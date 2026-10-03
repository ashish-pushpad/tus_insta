import { Worker } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES } from '../jobs/queues.js';
import { refreshAccountToken } from '../services/instagram/instagramTokenRefresh.service.js';
import { logger } from '../utils/logger.js';

const connection = getRedisConnection();

if (connection) {
  const worker = new Worker(
    QUEUE_NAMES.TOKEN_REFRESH,
    async (job) => {
      logger.info({ jobId: job.id, accountId: job.data.accountId }, 'Processing token refresh job');
      return refreshAccountToken(job.data.accountId);
    },
    {
      connection,
      concurrency: 2
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Token refresh job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Token refresh job failed');
  });

  logger.info('Token refresh worker started');
}
