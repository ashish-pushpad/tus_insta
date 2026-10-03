import axios from 'axios';
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v26.0';

// Refresh a token when it has fewer than this many days remaining
const REFRESH_THRESHOLD_DAYS = 10;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Refreshes an Instagram long-lived token for a single account.
 * Meta allows refreshing any time while the token is still valid.
 * Returns the updated account record, or null on failure.
 */
export const refreshAccountToken = async (accountId) => {
  const account = await prisma.instagramAccount.findUnique({
    where: { id: accountId },
    select: { id: true, accessToken: true, username: true, tokenExpiresAt: true }
  });

  if (!account) {
    logger.warn({ accountId }, 'Token refresh: account not found');
    return null;
  }

  // Skip mock tokens (dev environment)
  if (account.accessToken.startsWith('mock_')) {
    logger.debug({ accountId }, 'Token refresh: skipping mock token');
    return null;
  }

  try {
    const response = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: account.accessToken
      }
    });

    const newToken    = response.data.access_token;
    const expiresIn   = response.data.expires_in || 5184000; // 60 days fallback
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    const updated = await prisma.instagramAccount.update({
      where: { id: accountId },
      data: { accessToken: newToken, tokenExpiresAt }
    });

    logger.info(
      { accountId, username: account.username, expiresAt: tokenExpiresAt.toISOString() },
      'Instagram access token refreshed successfully'
    );

    return updated;
  } catch (err) {
    const apiError = err.response?.data?.error?.message || err.message;
    logger.error({ accountId, error: apiError }, 'Failed to refresh Instagram access token');

    // Mark account as disconnected if token is permanently invalid
    if (err.response?.status === 400 || err.response?.status === 401) {
      await prisma.instagramAccount.update({
        where: { id: accountId },
        data: { isConnected: false }
      }).catch(() => {});
      logger.warn({ accountId }, 'Instagram account marked as disconnected due to invalid token');
    }

    return null;
  }
};

/**
 * Scans all active accounts whose tokens expire within REFRESH_THRESHOLD_DAYS
 * and refreshes them. Called by the cron job every 12 hours.
 */
export const refreshExpiringTokens = async () => {
  const thresholdDate = new Date(Date.now() + REFRESH_THRESHOLD_DAYS * MS_PER_DAY);

  const accounts = await prisma.instagramAccount.findMany({
    where: {
      isConnected: true,
      tokenExpiresAt: { lte: thresholdDate }
    },
    select: { id: true, username: true, tokenExpiresAt: true }
  });

  if (accounts.length === 0) {
    logger.debug('Token refresh scan: no tokens need refreshing');
    return { refreshed: 0, failed: 0 };
  }

  logger.info({ count: accounts.length }, 'Token refresh scan: found accounts needing refresh');

  let refreshed = 0;
  let failed = 0;

  for (const account of accounts) {
    const result = await refreshAccountToken(account.id);
    if (result) {
      refreshed++;
    } else {
      failed++;
    }
  }

  logger.info({ refreshed, failed }, 'Token refresh scan complete');
  return { refreshed, failed };
};
