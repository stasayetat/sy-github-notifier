import 'reflect-metadata';
import './modules/scanner/scanner.cron-controller';

import { env } from '@shared/env';
import { logger } from '@shared/logger';

import { startGrpcServer } from './grpc/grpc.server';
import { server } from './server';

process.on('unhandledRejection', reason => {
  logger.error(`Unhandled rejection: ${String(reason)}`);
});

process.on('uncaughtException', error => {
  logger.error(`Uncaught exception: ${error.message}`);
});

server.listen(env.PORT, err => {
  if (err) {
    logger.error(err.message);
  } else {
    logger.info('Express server started on port: ' + env.PORT);
  }
});

startGrpcServer(env.GRPC_PORT);
