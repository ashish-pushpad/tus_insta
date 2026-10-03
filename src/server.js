import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { startScheduler } from './jobs/scheduler.js';
import { closeRedis } from './config/redis.js';

// Boot BullMQ workers (no-op if Redis is not configured)
import './workers/commentReply.worker.js';
import './workers/dmReply.worker.js';
import './workers/tokenRefresh.worker.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Instagram AI Backend running on port ${PORT} [${env.NODE_ENV}]`);
  logger.info(`Webhook URL: ${env.APP_URL}/api/webhooks/instagram`);

  // Start background cron jobs
  startScheduler();
});

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(async () => {
    await closeRedis();
    logger.info('Server closed gracefully');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes > 10 s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception — shutting down');
  process.exit(1);
});
