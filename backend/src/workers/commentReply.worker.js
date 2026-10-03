import { Worker } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES } from '../jobs/queues.js';
import { handleCommentEvent } from '../services/webhook/handlers/comment.handler.js';
import { logger } from '../utils/logger.js';

const connection = getRedisConnection();

if (connection) {
  const worker = new Worker(
    QUEUE_NAMES.COMMENT_REPLY,
    async (job) => {
      logger.info({ jobId: job.id, commentId: job.data.commentId }, 'Processing comment reply job');
      return handleCommentEvent(job.data);
    },
    {
      connection,
      concurrency: 5,
      limiter: { max: 10, duration: 1000 } // respect Instagram API rate limits
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Comment reply job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Comment reply job failed');
  });

  logger.info('Comment reply worker started');
}
