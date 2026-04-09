import { NodemailApiClient } from '@shared/apis/nodemail.api-client';
import { ResendApiClient } from '@shared/apis/resend.api-client';

import { EmailApiClient } from './email.api-client.interface';

export * from './email.api-client.interface';

export const emailApiClient: EmailApiClient =
  process.env.NODE_ENV === 'production' ? new ResendApiClient() : new NodemailApiClient();
