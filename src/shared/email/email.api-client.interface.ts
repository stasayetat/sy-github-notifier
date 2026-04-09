export interface EmailApiClient {
  sendEmail(recipientEmail: string, subject: string, htmlText: string): Promise<void>;
}
