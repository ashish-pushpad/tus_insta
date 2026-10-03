import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const take = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * take;

  const where = {
    instagramAccount: { userId: req.user.id },
    ...(status ? { status } : {})
  };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, senderType: true, createdAt: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take,
      skip
    }),
    prisma.conversation.count({ where })
  ]);

  return res.status(200).json({
    success: true,
    data: conversations,
    pagination: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  });
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const take = Math.min(parseInt(limit, 10) || 50, 200);
  const skip = (Math.max(parseInt(page, 10), 1) - 1) * take;

  // Ownership check — must belong to this user
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      instagramAccount: { userId: req.user.id }
    },
    select: { id: true, participantId: true, participantUsername: true, status: true }
  });

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take,
      skip
    }),
    prisma.message.count({ where: { conversationId: id } })
  ]);

  return res.status(200).json({
    success: true,
    data: { conversation, messages },
    pagination: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  });
});
