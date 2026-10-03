import { verifyWebhookChallenge, handleIncomingWebhook } from '../services/webhook/webhook.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyWebhook = asyncHandler(async (req, res) => {
  const challenge = verifyWebhookChallenge(req.query);
  return res.status(200).send(challenge);
});

export const receiveWebhookEvent = asyncHandler(async (req, res) => {
  await handleIncomingWebhook(req.body);
  return res.status(200).json({ success: true, message: 'EVENT_RECEIVED' });
});
