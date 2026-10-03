import { updateMediaAutomationSettings } from '../services/instagram/instagramMedia.service.js';
import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const getAutomations = asyncHandler(async (req, res) => {
  const automations = await prisma.instagramMedia.findMany({
    where: {
      instagramAccount: {
        userId: req.user.id
      }
    },
    select: {
      id: true,
      mediaId: true,
      caption: true,
      mediaType: true,
      aiCommentReplyEnabled: true,
      aiDmReplyEnabled: true,
      updatedAt: true
    },
    orderBy: [{ updatedAt: 'desc' }]
  });

  return res.status(200).json({
    success: true,
    data: automations
  });
});

export const updateAutomation = asyncHandler(async (req, res) => {
  const { mediaId, aiCommentReplyEnabled, aiDmReplyEnabled } = req.body;
  const media = await prisma.instagramMedia.findFirst({
    where: {
      mediaId,
      instagramAccount: {
        userId: req.user.id
      }
    },
    select: { mediaId: true }
  });

  if (!media) {
    throw new NotFoundError('Instagram media not found');
  }

  const result = await updateMediaAutomationSettings(mediaId, {
    aiCommentReplyEnabled,
    aiDmReplyEnabled
  });

  return res.status(200).json({
    success: true,
    data: result
  });
});
