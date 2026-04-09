import zod from 'zod';

export const EnvironmentSchema = zod.object({
  PORT: zod.coerce.number(),
  NODE_ENV: zod.enum(['development', 'production', 'test']),
  APP_URL: zod.string(),
  HOST: zod.string(),
  POSTGRES_URL: zod.string(),
  GITHUB_AUTH_TOKEN: zod.string(),
  RESEND_AUTH_TOKEN: zod.string(),
  SMTP_HOST: zod.string(),
  SMTP_PORT: zod.coerce.number(),
  SMTP_USER: zod.string(),
  SMTP_PASS: zod.string(),

  REDIS_HOST: zod.string(),
  REDIS_PORT: zod.coerce.number(),
});
