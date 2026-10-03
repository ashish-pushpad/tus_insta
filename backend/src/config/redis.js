import IORedis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let redisClient = null;

/**
 * Returns a shared IORedis connection.
 * If REDIS_URL is not configured, returns null and queues fall back
 * to in-process setImmediate processing.
 */
export const getRedisConnection = () => {
  if (!env.REDIS_URL) return null;
  if (redisClient) return redisClient;

  redisClient = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => logger.warn({ error: err.message }, 'Redis connection error'));

  return redisClient;
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
