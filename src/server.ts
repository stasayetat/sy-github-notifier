import { subscriptionRouter } from '@modules/subscription';
import { metricsRouter } from '@shared/metrics';
import { apiKeyMiddleware } from '@shared/middlewares/api-key.middleware';
import express from 'express';

export const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get('/', (_req, res) => {
  res.json({ message: 'Hello World' });
});

server.use('/api', apiKeyMiddleware, subscriptionRouter);
server.use(metricsRouter);
