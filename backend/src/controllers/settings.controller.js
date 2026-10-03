import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

/**
 * Returns the webhook configuration needed by the user to configure
 * their Meta Developer App. Only exposes the verify token and URL —
 * no secrets or access tokens are included.
 */
export const getWebhookConfig = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      callbackUrl: `${env.APP_URL}/api/webhooks/instagram`,
      verifyToken: env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
      subscribedFields: ['comments', 'messages'],
      appUrl: env.APP_URL
    }
  });
});
