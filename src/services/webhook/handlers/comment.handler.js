import prisma from '../../../config/database.js';
import { matchSpecialRules } from '../../rules/ruleEngine.service.js';
import { generateAICommentReply } from '../../ai/commentReply.service.js';
import { replyToComment, sendPrivateReplyFromComment } from '../../instagram/instagramComment.service.js';
import { logger } from '../../../utils/logger.js';

export const handleCommentEvent = async (payload) => {
  const { commentId, mediaId, text, fromUserId, fromUsername, instagramAccountId } = payload;

  if (!commentId || !text) {
    logger.warn({ payload }, 'Received comment webhook event with missing ID or text');
    return { status: 'SKIPPED', reason: 'Invalid payload' };
  }

  logger.info({ commentId, mediaId, text }, 'Processing Instagram Comment Webhook Event');

  // 1. Idempotency check: Have we already processed this comment?
  try {
    const existing = await prisma.comment.findUnique({ where: { commentId } });
    if (existing) {
      logger.info({ commentId }, 'Comment event already processed. Skipping for idempotency.');
      return { status: 'SKIPPED', reason: 'Already processed' };
    }
  } catch {
    // transient db check
  }

  // 2. Load Instagram Account & Media Automation settings
  let account = null;
  let media = null;
  try {
    account = await prisma.instagramAccount.findUnique({ where: { id: instagramAccountId } });
    media = await prisma.instagramMedia.findUnique({ where: { mediaId } });
  } catch {
    // transient fallback
  }

  const isAutomationEnabled = media ? media.aiCommentReplyEnabled : true;
  if (!isAutomationEnabled) {
    logger.info({ mediaId }, 'Comment automation is disabled for this media item. Skipping.');
    return { status: 'SKIPPED', reason: 'Automation disabled' };
  }

  const accessToken = account ? account.accessToken : null;

  // 3. Special Rule Precedence Engine Check
  const ruleMatch = await matchSpecialRules({
    commentText: text,
    instagramAccountId,
    mediaId,
    fromUsername,
    postUrl: media?.permalink || ''
  });

  if (ruleMatch.matched) {
    logger.info({ ruleName: ruleMatch.rule.name, actionType: ruleMatch.actionType }, 'Executing Special Rule Action');

    let publicReplyResult = null;
    let privateDmResult = null;
    let status = 'SENT';
    let error = null;

    try {
      if (ruleMatch.actionType === 'COMMENT_REPLY' || ruleMatch.actionType === 'BOTH') {
        publicReplyResult = await replyToComment(commentId, ruleMatch.commentReply, accessToken);
      }

      if (ruleMatch.actionType === 'DM' || ruleMatch.actionType === 'BOTH') {
        privateDmResult = await sendPrivateReplyFromComment(commentId, ruleMatch.dmMessage, accessToken);
      }
    } catch (err) {
      status = 'FAILED';
      error = err.message;
    }

    // Record comment execution
    try {
      await prisma.comment.create({
        data: {
          instagramAccountId,
          mediaId,
          commentId,
          fromUserId,
          fromUsername,
          commentText: text,
          generatedReply: ruleMatch.commentReply || ruleMatch.dmMessage,
          responseType: 'RULE',
          status,
          ruleId: ruleMatch.rule.id,
          error
        }
      });
    } catch {
      // transient record
    }

    return { status, responseType: 'RULE', ruleName: ruleMatch.rule.name };
  }

  // 4. Generic AI Reply Fallback
  logger.info({ commentId }, 'No special rule matched. Dispatching to Generic AI Comment Agent.');

  const aiResult = await generateAICommentReply({
    commentText: text,
    postCaption: media?.caption || '',
    instagramAccountId
  });

  if (!aiResult.shouldReply || !aiResult.reply) {
    logger.info({ commentId, reason: aiResult.reason }, 'AI agent decided not to reply to this comment');
    return { status: 'SKIPPED', reason: aiResult.reason };
  }

  let status = 'SENT';
  let error = null;

  try {
    await replyToComment(commentId, aiResult.reply, accessToken);
  } catch (err) {
    status = 'FAILED';
    error = err.message;
  }

  // Record AI comment execution
  try {
    await prisma.comment.create({
      data: {
        instagramAccountId,
        mediaId,
        commentId,
        fromUserId,
        fromUsername,
        commentText: text,
        generatedReply: aiResult.reply,
        responseType: 'AI',
        status,
        error
      }
    });
  } catch {
    // transient record
  }

  return { status, responseType: 'AI', reply: aiResult.reply };
};
