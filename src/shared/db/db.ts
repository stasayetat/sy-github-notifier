import { env } from '@shared/env';
import { logger } from '@shared/logger';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

logger.info(`DB: ${env.POSTGRES_URL}`);
const client = postgres(env.POSTGRES_URL);
export const db = drizzle(client);
