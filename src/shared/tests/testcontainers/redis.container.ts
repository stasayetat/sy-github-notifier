import { env } from '@shared/env';
import { RedisContainer } from '@testcontainers/redis';

const port = env.REDIS_PORT;

process.env.REDIS_CONNECT_URL = `redis://127.0.0.1:${port}`;

export const redisContainer = new RedisContainer('redis:7-alpine')
  .withExposedPorts({
    container: 6379,
    host: port,
  })
  .withNetworkAliases('redis')
  .withCommand(['redis-server']);
