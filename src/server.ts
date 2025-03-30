import { app } from './app';
import { logger } from './logger';
import { config } from './config';

const server = app({
  logger,
  pluginTimeout: config.server.pluginTimeout,
  bodyLimit: config.server.bodyLimit,
});

if (import.meta.env.PROD) {
  const PORT = config.server.port;
  try {
    server.listen({ port: PORT, host: config.server.host });
    server.log.info(`Server started on ${config.server.host}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

export const viteNodeApp = server;
