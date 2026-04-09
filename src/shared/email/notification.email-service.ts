import {
  confirmationEmailTemplate,
  EMAIL_SUBJECT_CONFIRMATION,
  EMAIL_SUBJECT_RELEASE_NOTIFICATION,
  releaseNotificationTemplate,
} from '@shared/email/email.utils';
import { emailApiClient } from '@shared/email/index';
import { logger } from '@shared/logger';
import { getErrorMessage } from '@shared/utils';

export class NotificationEmailService {
  async sendConfirmationEmail(to: string, token: string, repo: string) {
    try {
      await emailApiClient.sendEmail(to, EMAIL_SUBJECT_CONFIRMATION, confirmationEmailTemplate(token, repo));

      logger.info(`User ${to} has recevied confirmation email`);
    } catch (error) {
      const message = getErrorMessage(error);

      logger.error(`Failed to send confirmation ${to}: ${message}`);
    }
  }

  async sendReleaseNotification(to: string, repo: string, tag: string, unsubscribeToken: string) {
    try {
      await emailApiClient.sendEmail(
        to,
        EMAIL_SUBJECT_RELEASE_NOTIFICATION(repo, tag),
        releaseNotificationTemplate(repo, tag, unsubscribeToken),
      );

      logger.info(`User ${to} has recevied release notification about ${repo}`);
    } catch (error) {
      const message = getErrorMessage(error);

      logger.error(`Failed to notify ${to}: ${message}`);
    }
  }
}
