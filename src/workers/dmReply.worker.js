import { Worker } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES } from '../jobs/queues.js';
import { handleMessageEvent } from '../services/webhook/handlers/message.handler.js';
import { logger } from '../utils/logger.js';

const connection = getRedisConnection();

if (connection) {
  const worker = new Worker(
    QUEUE_NAMES.DM_REPLY,
    async (job) => {
      logger.info({ jobId: job.id, senderId: job.data.senderId }, 'Processing DM reply job');
      return handleMessageEvent(job.data);
    },
    {
      connection,
      concurrency: 3,
      limiter: { max: 5, duration: 1000 }
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'DM reply job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'DM reply job failed');
  });

  logger.info('DM reply worker started');
}
