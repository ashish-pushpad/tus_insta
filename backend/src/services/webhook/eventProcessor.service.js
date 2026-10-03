import { handleCommentEvent } from './handlers/comment.handler.js';
import { handleMessageEvent } from './handlers/message.handler.js';
import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Generates a deterministic external event ID from the webhook payload
 * so we can deduplicate events across multiple deliveries from Meta.
 */
const buildEventId = (type, payload) => {
  switch (type) {
    case 'comment':
      return `comment_${payload.commentId}`;
    case 'message':
      return `message_${payload.messageId || `${payload.senderId}_${Date.now()}`}`;
    default:
      return `unknown_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
};

/**
 * Checks if this event has already been processed (idempotency fence).
 * Returns true if we should skip processing.
 */
const isEventAlreadyProcessed = async (externalEventId, eventType, rawPayload) => {
  try {
    const existing = await prisma.webhookEvent.findUnique({
      where: { externalEventId },
      select: { processed: true }
    });

    if (existing) {
      logger.info({ externalEventId }, 'Webhook event already exists — skipping duplicate delivery');
      return true;
    }

    // Create record immediately (unprocessed) before work begins
    await prisma.webhookEvent.create({
      data: {
        externalEventId,
        eventType,
        payload: rawPayload,
        processed: false
      }
    });

    return false;
  } catch (err) {
    // If DB write fails (e.g. unique constraint race), treat as duplicate
    if (err.code === 'P2002') {
      logger.warn({ externalEventId }, 'Duplicate webhook event insert race — skipping');
      return true;
    }
    logger.warn({ error: err.message }, 'WebhookEvent dedup check failed — processing anyway');
    return false;
  }
};

/**
 * Marks a webhook event as processed (or failed) after execution.
 */
const markEventProcessed = async (externalEventId, error = null) => {
  try {
    await prisma.webhookEvent.updateMany({
      where: { externalEventId },
      data: {
        processed: error === null,
        processedAt: new Date(),
        error: error ? String(error).slice(0, 500) : null
      }
    });
  } catch (err) {
    logger.warn({ error: err.message, externalEventId }, 'Failed to mark webhook event processed');
  }
};

export const processWebhookPayload = async (body) => {
  console.log("webhook body",body.entry[0].changes)
  if (!body || body.object !== 'instagram') {
    logger.warn({ object: body?.object }, 'Received non-Instagram webhook object');
    return { status: 'IGNORED' };
  }

  const entries = body.entry || [];
  const results = [];

  for (const entry of entries) {
    const igAccountId = entry.id;

    // ── Comment events (changes[].field === 'comments') ──────────────────
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field === 'comments') {
        const val = change.value || {};
        const commentPayload = {
          commentId: val.id,
          mediaId: val.media?.id || val.media_id,
          text: val.text,
          fromUserId: val.from?.id,
          fromUsername: val.from?.username,
          instagramAccountId: igAccountId
        };

        const eventId = buildEventId('comment', commentPayload);
        const isDuplicate = await isEventAlreadyProcessed(eventId, 'comment', val);
        if (isDuplicate) {
          results.push({ status: 'SKIPPED', reason: 'Duplicate webhook delivery' });
          continue;
        }

        let processError = null;
        let res;
        try {
          res = await handleCommentEvent(commentPayload);
        } catch (err) {
          processError = err.message;
          res = { status: 'ERROR', error: err.message };
          logger.error({ error: err.message, eventId }, 'Comment handler threw unhandled error');
        }

        await markEventProcessed(eventId, processError);
        results.push(res);
      }
    }

    // ── Direct Message events (messaging[]) ──────────────────────────────
    const messaging = entry.messaging || [];
    for (const msg of messaging) {
      if (!msg.message || msg.message.is_echo) continue;

      const messagePayload = {
        senderId: msg.sender?.id,
        senderUsername: msg.sender?.username,
        messageId: msg.message.mid,
        text: msg.message.text,
        instagramAccountId: igAccountId
      };

      if (!messagePayload.messageId) {
        // Unsupported message type (sticker, attachment) — skip gracefully
        logger.debug({ msg }, 'Skipping DM event without message ID');
        continue;
      }

      const eventId = buildEventId('message', messagePayload);
      const isDuplicate = await isEventAlreadyProcessed(eventId, 'message', msg.message);
      if (isDuplicate) {
        results.push({ status: 'SKIPPED', reason: 'Duplicate webhook delivery' });
        continue;
      }

      let processError = null;
      let res;
      try {
        res = await handleMessageEvent(messagePayload);
      } catch (err) {
        processError = err.message;
        res = { status: 'ERROR', error: err.message };
        logger.error({ error: err.message, eventId }, 'Message handler threw unhandled error');
      }

      await markEventProcessed(eventId, processError);
      results.push(res);
    }
  }

  return { success: true, processedCount: results.length, results };
};
