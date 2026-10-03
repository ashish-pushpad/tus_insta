import cron from 'node-cron';
import { refreshExpiringTokens } from '../services/instagram/instagramTokenRefresh.service.js';
import { logger } from '../utils/logger.js';

/**
 * Starts all scheduled background cron jobs.
 * Called once from server.js after the HTTP server starts.
 */
export const startScheduler = () => {
  // Token refresh — runs every 12 hours
  // Checks all connected accounts and refreshes any token expiring within 10 days
  cron.schedule('0 */12 * * *', async () => {
    logger.info('Cron: starting Instagram token refresh scan');
    try {
      const result = await refreshExpiringTokens();
      logger.info(result, 'Cron: token refresh scan complete');
    } catch (err) {
      logger.error({ error: err.message }, 'Cron: token refresh scan failed');
    }
  });

  logger.info('Background job scheduler started (token refresh every 12 h)');
};
