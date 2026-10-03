import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const connection = getRedisConnection();

// ─── Queue names ──────────────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  COMMENT_REPLY:   'comment-reply',
  DM_REPLY:        'dm-reply',
  TOKEN_REFRESH:   'token-refresh',
};

// ─── Queue instances (only created when Redis is available) ───────────────────
let commentReplyQueue = null;
let dmReplyQueue      = null;
let tokenRefreshQueue = null;

const queueOptions = (name) => ({
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 60 * 60 * 24 },   // keep 24 h
    removeOnFail:     { age: 60 * 60 * 24 * 7 } // keep 7 days
  }
});

if (connection) {
  commentReplyQueue = new Queue(QUEUE_NAMES.COMMENT_REPLY, queueOptions(QUEUE_NAMES.COMMENT_REPLY));
  dmReplyQueue      = new Queue(QUEUE_NAMES.DM_REPLY,      queueOptions(QUEUE_NAMES.DM_REPLY));
  tokenRefreshQueue = new Queue(QUEUE_NAMES.TOKEN_REFRESH,  queueOptions(QUEUE_NAMES.TOKEN_REFRESH));
  logger.info('BullMQ queues initialised');
} else {
  logger.info('Redis not configured — BullMQ queues disabled, using synchronous processing');
}

export { commentReplyQueue, dmReplyQueue, tokenRefreshQueue };

/**
 * Add a comment-reply job to the queue.
 * Falls back to a no-op Promise if Redis is not available
 * (the webhook handler already processes synchronously in that case).
 */
export const enqueueCommentReply = async (payload) => {
  if (!commentReplyQueue) return null;
  return commentReplyQueue.add('process', payload, { jobId: `comment_${payload.commentId}` });
};

export const enqueueDmReply = async (payload) => {
  if (!dmReplyQueue) return null;
  return dmReplyQueue.add('process', payload, { jobId: `dm_${payload.messageId}` });
};

export const enqueueTokenRefresh = async (accountId) => {
  if (!tokenRefreshQueue) return null;
  return tokenRefreshQueue.add('refresh', { accountId }, {
    jobId: `token_refresh_${accountId}`,
    // Deduplicate: if a refresh job for this account is already queued, skip
    deduplication: { id: `token_${accountId}` }
  });
};
