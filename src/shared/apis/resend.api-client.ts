import { EmailApiClient } from '@shared/email';
import { env } from '@shared/env';
import { logger } from '@shared/logger';
import { getErrorMessage } from '@shared/utils';
import Bottleneck from 'bottleneck';
import { Resend } from 'resend';

export class ResendApiClient implements EmailApiClient {
  private readonly resend = new Resend(env.RESEND_AUTH_TOKEN);
  private readonly limiter = new Bottleneck({
    maxConcurrent: 3,
    minTime: 1000 / 3,
  });

  async sendEmail(recipientEmail: string, subject: string, htmlText: string) {
    try {
      await this.limiter.schedule(() => {
        return this.resend.emails.send({
          from: 'onboarding@resend.dev',
          to: recipientEmail,
          subject,
          html: htmlText,
        });
      });
    } catch (error) {
      logger.error(`Error sending email using resend: ${getErrorMessage(error)}`);

      throw error;
    }
  }
}
