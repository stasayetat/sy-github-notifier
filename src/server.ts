import { subscriptionRouter } from '@modules/subscription';
import { metricsRouter } from '@shared/metrics';
import { errorHandler } from '@shared/utils';
import cors from 'cors';
import express from 'express';

export const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get('/', (_req, res) => {
  res.json({ message: 'Hello World' });
});

server.use('/api', subscriptionRouter);
server.use(metricsRouter);
server.use(errorHandler);
