import { GithubApiClient } from '@shared/apis/github.api-client';
import { NotificationEmailService } from '@shared/email/notification.email-service';
import { logger } from '@shared/logger';
import { E, MinifiedSubscription, Subscription, SubscriptionResponse } from '@shared/types';
import { Repository } from '@shared/types/repository.types';

import { RepoRepository } from '../repository/repo.repository';
import { SubscriptionRepository } from '../repository/subscription.repository';

export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository = new SubscriptionRepository(),
    private readonly repoRepository = new RepoRepository(),
    private readonly notificationEmailService = new NotificationEmailService(),
  ) {}

  async subscribe(email: string, repo: string): Promise<SubscriptionResponse> {
    const foundRepo = await this.repoRepository.findByRepo(repo);

    if (foundRepo) {
      return await this.subscribeToExistingRepo(email, foundRepo);
    }

    return await this.subscribeToNewRepo(email, repo);
  }

  async confirmSubscribe(token: string): Promise<SubscriptionResponse> {
    const foundSubscriptionEither = await this.findSubscriptionByTokenOrFail(token);

    if (E.isLeft(foundSubscriptionEither)) {
      return foundSubscriptionEither.value;
    }

    await this.subscriptionRepository.confirmSubscription(foundSubscriptionEither.value);

    logger.info(`Subscription confirmed successfully for ${token}`);

    return { status: 200, message: 'Subscription confirmed successfully' };
  }

  async confirmUnsubscribe(token: string): Promise<SubscriptionResponse> {
    const foundSubscriptionEither = await this.findSubscriptionByTokenOrFail(token, true);

    if (E.isLeft(foundSubscriptionEither)) {
      return foundSubscriptionEither.value;
    }

    await this.subscriptionRepository.removeSubscription(foundSubscriptionEither.value);
    await this.removeRepoIfEmpty(foundSubscriptionEither);

    logger.info(`Subscription removed successfully for ${token}`);

    return { status: 200, message: 'Subscription removed successfully' };
  }

  async getAllSubscriptionsByEmail(email: string): Promise<{ status: number; data: MinifiedSubscription[] }> {
    const foundSubscriptions = await this.subscriptionRepository.getAllActiveSubscriptionByEmail(email);

    const mappedValue = foundSubscriptions.map<MinifiedSubscription>(({ repos, subscriptions }) => ({
      email: subscriptions.email,
      repo: repos.repo,
      confirmed: true,
      last_seen_tag: repos.last_seen_tag,
    }));

    logger.info(`Active subscription for ${email} - ${mappedValue.length}`);

    return { status: 200, data: mappedValue };
  }

  private async findSubscriptionByTokenOrFail(
    token: string,
    isConfirmed: boolean = false,
  ): Promise<E.Either<SubscriptionResponse, Subscription>> {
    const subscription = await this.subscriptionRepository.getSubscriptionByToken(token, isConfirmed);

    if (!subscription) {
      logger.info(`Subscription for ${token} not found`);

      return E.left({ status: 404, message: 'No token found' });
    }

    return E.right(subscription);
  }

  private async subscribeToExistingRepo(email: string, repository: Repository) {
    const foundSubscription = await this.subscriptionRepository.getSubscriptionByEmailAndRepoId(email, repository.id);

    if (foundSubscription) {
      return await this.handleExistingSubscription(email, foundSubscription, repository.repo);
    }

    const newSubscription = await this.subscriptionRepository.createNewSubscription(email, repository.id);

    await this.notificationEmailService.sendConfirmationEmail(email, newSubscription.token, repository.repo);

    return { status: 200, message: 'Confirmation email sent' };
  }

  private async handleExistingSubscription(
    email: string,
    subscription: Subscription,
    repo: string,
  ): Promise<SubscriptionResponse> {
    if (subscription.confirmed) {
      logger.info(`Subscription for ${subscription.repoId} from ${email} already exists`);

      return { status: 409, message: 'Subscription already exists' };
    }

    logger.info(`Subscription for ${subscription.repoId} from ${email} already exists but not confirmed`);

    await this.notificationEmailService.sendConfirmationEmail(email, subscription.token, repo);

    return { status: 200, message: 'Confirmation email resent' };
  }

  private async subscribeToNewRepo(email: string, repo: string) {
    const foundRepoEither = await GithubApiClient.getLatestRelease(repo);

    if (E.isLeft(foundRepoEither)) {
      logger.info(`Something went wrong. Message: ${foundRepoEither.value.message}`);

      return foundRepoEither.value;
    }

    const newRepo = await this.repoRepository.createRepo(repo, foundRepoEither.value.tag_name);

    const newSubscription = await this.subscriptionRepository.createNewSubscription(email, newRepo.id);
    await this.notificationEmailService.sendConfirmationEmail(email, newSubscription.token, repo);

    logger.info(`Confirmation for ${repo} successfully sent to ${email}`);

    return { status: 200, message: 'Confirmation email sent' };
  }

  private async removeRepoIfEmpty(foundSubscriptionEither: E.Right<Subscription>) {
    const subscriptionsCount = await this.subscriptionRepository.countByRepoId(foundSubscriptionEither.value.repoId);

    if (!subscriptionsCount) {
      await this.repoRepository.deleteRepo(foundSubscriptionEither.value.repoId);
    }
  }
}
