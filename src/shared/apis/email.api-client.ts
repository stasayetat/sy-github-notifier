import { env } from '@shared/env';
import { logger } from '@shared/logger';
import { getErrorMessage } from '@shared/utils';
import Bottleneck from 'bottleneck';
import nodemailer from 'nodemailer';

export namespace EmailApiClient {
  const limiter = new Bottleneck({
    maxConcurrent: 3,
    minTime: 1000 / 3,
  });

  const config = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  };

  logger.info(`Config: ${JSON.stringify(config, null, 2)}`);
  const transporter = nodemailer.createTransport(config);

  export const sendEmail = async (recipientEmail: string, subject: string, htmlText: string) => {
    try {
      await limiter.schedule(() => {
        return transporter.sendMail({
          from: env.SMTP_SENDER_EMAIL,
          to: recipientEmail,
          subject,
          html: htmlText,
        });
      });
    } catch (error) {
      logger.error(`Error sending email using nodemail: ${getErrorMessage(error)}`);

      throw error;
    }
  };
}
