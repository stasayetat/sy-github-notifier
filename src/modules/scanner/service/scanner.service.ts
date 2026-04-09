import { GithubApiClient } from '@shared/apis/github.api-client';
import { NotificationEmailService } from '@shared/email/notification.email-service';
import { logger } from '@shared/logger';
import { E, Subscription } from '@shared/types';
import { Repository } from '@shared/types/repository.types';
import Bottleneck from 'bottleneck';
import ms from 'ms';

import { RepoRepository } from '../../subscription/repository/repo.repository';
import { SubscriptionRepository } from '../../subscription/repository/subscription.repository';
import { RepoNotifyInfo, RepoScanError, RepoScanSuccess } from '../scanner.types';
import { hasNewRelease } from '../scanner.utils';

export class ScannerService {
  private readonly scannerLimiter = new Bottleneck({
    reservoir: 5000,
    reservoirRefreshAmount: 5000,
    reservoirRefreshInterval: ms('1 hour'),
    maxConcurrent: 10,
  });

  constructor(
    private readonly repoRepository = new RepoRepository(),
    private readonly subscriptionRepository = new SubscriptionRepository(),
    private readonly notifierService = new NotificationEmailService(),
  ) {}

  async run(): Promise<void> {
    logger.info('Start scanning...');
    const allRepos = await this.repoRepository.getAllRepos();

    if (!allRepos.length) {
      logger.info(`There is no repos. Finishing job...`);

      return;
    }

    const successful = await this.scanAllRepos(allRepos);

    logger.info(`Scanned ${successful.length} repos`);

    const repoToNotify = successful.filter(hasNewRelease);

    if (!repoToNotify.length) {
      logger.info('No repos to notify. Finishing job...');

      return;
    }

    logger.info(`Repos ready to notify: ${repoToNotify.length}`);

    const repoIds = repoToNotify.map(repo => repo.currentRepo.id);

    const subscriptions = await this.subscriptionRepository.getSubscriptionsByRepoIds(repoIds);

    if (!subscriptions.length) {
      logger.info(`There is no subscriptions. Finishing job...`);

      return;
    }

    logger.info(`Subscribers ready to notify: ${repoToNotify.length}`);

    const notifyInfos = this.buildNotifyInfos(repoToNotify, subscriptions);

    await Promise.all(notifyInfos.map(info => this.notifySubscribers(info)));

    logger.info(`Scanning successfully end`);
  }

  private async notifySubscribers({ subscribers, newTag, repo }: RepoNotifyInfo) {
    await Promise.all(
      subscribers.map(subscriber =>
        this.notifierService.sendReleaseNotification(subscriber.email, repo.repo, newTag, subscriber.token),
      ),
    );

    await this.repoRepository.updateLastSeenTag(repo.id, newTag);
  }

  private buildNotifyInfos(repoToNotify: RepoScanSuccess[], subscriptions: Subscription[]): RepoNotifyInfo[] {
    const subscriptionsByRepoId = new Map<string, Subscription[]>();

    for (const subscription of subscriptions) {
      const existingSubscription = subscriptionsByRepoId.get(subscription.repoId) ?? [];
      existingSubscription.push(subscription);
      subscriptionsByRepoId.set(subscription.repoId, existingSubscription);
    }

    return repoToNotify.map(({ currentRepo, fetchedRepo }) => ({
      newTag: fetchedRepo.tag_name,
      repo: currentRepo,
      subscribers: subscriptionsByRepoId.get(currentRepo.id) ?? [],
    }));
  }

  private async scanAllRepos(allRepos: Repository[]) {
    const results = await Promise.all(
      allRepos.map(repo => {
        return this.scannerLimiter.schedule(() => this.fetchLatestReleaseInfo(repo));
      }),
    );

    const { successful, failed } = results.reduce<{
      successful: RepoScanSuccess[];
      failed: RepoScanError[];
    }>(
      (acc, result) => {
        if (E.isRight(result)) {
          acc.successful.push(result.value);
        } else {
          acc.failed.push(result.value);
        }

        return acc;
      },
      { successful: [], failed: [] },
    );

    failed.forEach(({ currentRepo, error }) => {
      logger.warn(`Failed to fetch repo ${currentRepo.repo}: ${error.message}`);
    });

    return successful;
  }

  private async fetchLatestReleaseInfo(repo: Repository): Promise<E.Either<RepoScanError, RepoScanSuccess>> {
    const result = await GithubApiClient.getLatestRelease(repo.repo);

    if (E.isLeft(result)) {
      return E.left({
        currentRepo: repo,
        error: result.value,
      });
    }

    return E.right({
      currentRepo: repo,
      fetchedRepo: result.value,
    });
  }
}
