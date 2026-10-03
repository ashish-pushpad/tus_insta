import prisma from '../../../config/database.js';
import { generateAIDmReply } from '../../ai/dmReply.service.js';
import { sendDirectMessage } from '../../instagram/instagramMessage.service.js';
import { logger } from '../../../utils/logger.js';

export const handleMessageEvent = async (payload) => {
  const { senderId, senderUsername, messageId, text, instagramAccountId } = payload;

  if (!senderId || !text) {
    logger.warn({ payload }, 'Received message event with missing senderId or text');
    return { status: 'SKIPPED', reason: 'Invalid DM payload' };
  }

  logger.info({ senderId, senderUsername, messageId, text }, 'Processing Instagram Direct Message Event');

  // 1. Get or create Conversation record
  let conversation = null;
  try {
    conversation = await prisma.conversation.findFirst({
      where: {
        instagramAccountId,
        participantId: senderId
      },
      include: {
        messages: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          instagramAccountId,
          participantId: senderId,
          participantUsername: senderUsername || `user_${senderId.slice(-4)}`
        },
        include: { messages: true }
      });
    }
  } catch {
    conversation = { id: 'conv_' + senderId, participantId: senderId, messages: [] };
  }

  // 2. Record User incoming message
  try {
    if (messageId) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          externalMessageId: messageId,
          senderType: 'USER',
          content: text
        }
      });
    }
  } catch {
    // transient record
  }

  // 3. Load account & verify DM automation status
  let account = null;
  try {
    account = await prisma.instagramAccount.findUnique({ where: { id: instagramAccountId } });
  } catch {
    // transient
  }

  const accessToken = account ? account.accessToken : null;

  // 4. Call AI DM Agent
  const aiResult = await generateAIDmReply({
    messageText: text,
    conversationHistory: conversation.messages ? [...conversation.messages].reverse() : [],
    instagramAccountId
  });

  if (!aiResult.shouldReply || !aiResult.message) {
    logger.info({ senderId, reason: aiResult.reason }, 'AI DM agent decided not to reply');
    return { status: 'SKIPPED', reason: aiResult.reason };
  }

  // 5. Send DM via Instagram Messaging API
  let status = 'SENT';
  try {
    await sendDirectMessage(
      account?.instagramUserId || 'me',
      senderId,
      aiResult.message,
      accessToken
    );
  } catch (err) {
    status = 'FAILED';
    logger.error({ error: err.message }, 'Failed to send automated DM reply');
  }

  // 6. Record AI outgoing message
  try {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalMessageId: `mid_ai_${Date.now()}`,
        senderType: 'AI',
        content: aiResult.message
      }
    });
  } catch {
    // transient
  }

  return { status, reply: aiResult.message };
};
