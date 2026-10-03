import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { filter = 'ALL', page = 1, limit = 20 } = req.query;
  const take = parseInt(limit, 10);
  const skip = (parseInt(page, 10) - 1) * take;

  const comments = await prisma.comment.findMany({
    where: {
      instagramAccount: {
        userId: req.user.id
      }
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip
  });

  const dmMessages = await prisma.message.findMany({
    where: {
      senderType: { in: ['AI', 'RULE'] },
      conversation: {
        instagramAccount: {
          userId: req.user.id
        }
      }
    },
    include: {
      conversation: {
        select: {
          participantUsername: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip
  });

  const commentLogs = comments.map((comment) => ({
    id: comment.id,
    kind: 'COMMENT',
    fromUsername: comment.fromUsername,
    commentText: comment.commentText,
    generatedReply: comment.generatedReply,
    responseType: comment.responseType,
    status: comment.status,
    error: comment.error,
    createdAt: comment.createdAt
  }));

  const dmLogs = dmMessages.map((message) => ({
    id: message.id,
    kind: 'DM',
    fromUsername: message.conversation.participantUsername,
    commentText: message.content,
    generatedReply: message.content,
    responseType: message.senderType === 'RULE' ? 'RULE' : 'AI',
    status: 'SENT',
    error: null,
    createdAt: message.createdAt
  }));

  const allLogs = [...commentLogs, ...dmLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let filtered = allLogs;
  if (filter === 'COMMENTS') {
    filtered = allLogs.filter((item) => item.kind === 'COMMENT');
  } else if (filter === 'DMS') {
    filtered = allLogs.filter((item) => item.kind === 'DM');
  } else if (filter === 'RULES') {
    filtered = allLogs.filter((item) => item.responseType === 'RULE');
  } else if (filter === 'ERRORS') {
    filtered = allLogs.filter((item) => item.status === 'FAILED');
  }

  return res.status(200).json({
    success: true,
    data: filtered,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total: filtered.length,
      totalPages: 1
    }
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [account, commentStats, dmReplyCount, ruleTriggerCount, recentErrors] = await Promise.all([
    prisma.instagramAccount.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { isConnected: true }
    }),
    prisma.comment.aggregate({
      where: {
        instagramAccount: { userId: req.user.id },
        createdAt: { gte: startOfDay }
      },
      _count: { _all: true }
    }),
    prisma.message.count({
      where: {
        senderType: 'AI',
        createdAt: { gte: startOfDay },
        conversation: {
          instagramAccount: {
            userId: req.user.id
          }
        }
      }
    }),
    prisma.comment.count({
      where: {
        instagramAccount: { userId: req.user.id },
        responseType: 'RULE',
        createdAt: { gte: startOfDay }
      }
    }),
    prisma.comment.count({
      where: {
        instagramAccount: { userId: req.user.id },
        status: 'FAILED'
      }
    })
  ]);

  return res.status(200).json({
    success: true,
    data: {
      isConnected: Boolean(account?.isConnected),
      commentAiActive: Boolean(account?.isConnected),
      dmAiActive: Boolean(account?.isConnected),
      todayActivity: {
        commentsReplied: commentStats._count._all,
        dmsReplied: dmReplyCount,
        rulesTriggered: ruleTriggerCount
      },
      errors: recentErrors
    }
  });
});
