import { env } from '../../config/env.js';
import { processWebhookPayload } from './eventProcessor.service.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export const verifyWebhookChallenge = (query) => {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    logger.info('Meta Instagram Webhook Verification Succeeded');
    return challenge;
  }

  logger.warn({ mode, token }, 'Meta Instagram Webhook Verification Failed');
  throw new UnauthorizedError('Invalid webhook verification token');
};

export const handleIncomingWebhook = async (body) => {
  logger.info('Received Instagram Webhook Event Payload');
  // Process event asynchronously to return 200 immediately to Meta
  setImmediate(() => {
    processWebhookPayload(body).catch((err) => {
      logger.error({ error: err.message }, 'Error in async webhook event execution');
    });
  });

  return { received: true };
};
