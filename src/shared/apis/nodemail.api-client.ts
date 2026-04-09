import { EmailApiClient } from '@shared/email';
import { env } from '@shared/env';
import { logger } from '@shared/logger';
import { getErrorMessage } from '@shared/utils';
import nodemailer from 'nodemailer';

export class NodemailApiClient implements EmailApiClient {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  async sendEmail(recipientEmail: string, subject: string, htmlText: string) {
    try {
      await this.transporter.sendMail({
        from: `"GitHub Notifier" <${env.SMTP_USER}>`,
        to: recipientEmail,
        subject,
        html: htmlText,
      });
    } catch (error) {
      logger.error(`Error sending email using nodemail: ${getErrorMessage(error)}`);

      throw error;
    }
  }
}
