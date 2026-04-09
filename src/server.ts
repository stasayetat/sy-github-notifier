import express from 'express';

import { subscriptionRouter } from './modules/subscription/subcription.controller';

export const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get('/', (_req, res) => {
  res.json({ message: 'Hello World' });
});

server.use('/api', subscriptionRouter);
