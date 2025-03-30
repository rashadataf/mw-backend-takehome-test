import './env';
import 'reflect-metadata';

import { fastify as Fastify, FastifyServerOptions } from 'fastify';
import databaseConnection from 'typeorm-fastify-plugin';
import { errorHandler } from './middlewares/error-handler.middleware';
import { valuationRouter } from './controllers/valuation.controller';
import { VehicleValuation } from './models/vehicle-valuation';
import { ProviderLog } from './models/provider-log';
import { config } from './config';

export const app = (opts?: FastifyServerOptions) => {
  const fastify = Fastify(opts);
  
  // Register error handler
  fastify.setErrorHandler(errorHandler);
  
  // Register database connection
  fastify
    .register(databaseConnection, {
      type: 'sqlite',
      database: config.database.path,
      synchronize: config.database.synchronize,
      logging: false,
      entities: [VehicleValuation, ProviderLog],
      migrations: [],
      subscribers: [],
    })
    .ready();

  // Simple health check endpoint
  fastify.get('/', async () => {
    return { hello: 'world' };
  });

  // Register API routes with prefixes
  fastify.register(valuationRouter, { prefix: '/valuations' });

  return fastify;
};
