import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

export const getSpecialRules = asyncHandler(async (req, res) => {
  const rules = await prisma.specialRule.findMany({
    where: { userId: req.user.id },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }]
  });

  return res.status(200).json({
    success: true,
    data: rules
  });
});

export const createSpecialRule = asyncHandler(async (req, res) => {
  const account = await prisma.instagramAccount.findFirst({
    where: {
      id: req.body.instagramAccountId,
      userId: req.user.id
    },
    select: { id: true }
  });

  if (!account) {
    throw new NotFoundError('Instagram account not found');
  }

  if (req.body.mediaId) {
    const media = await prisma.instagramMedia.findFirst({
      where: {
        mediaId: req.body.mediaId,
        instagramAccountId: account.id
      },
      select: { mediaId: true }
    });

    if (!media) {
      throw new NotFoundError('Instagram media not found');
    }
  }

  const data = { ...req.body, userId: req.user.id };
  const rule = await prisma.specialRule.create({ data });

  return res.status(201).json({
    success: true,
    data: rule
  });
});

export const updateSpecialRule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingRule = await prisma.specialRule.findFirst({
    where: {
      id,
      userId: req.user.id
    },
    select: {
      id: true,
      instagramAccountId: true
    }
  });

  if (!existingRule) {
    throw new NotFoundError('Special rule not found');
  }

  if (req.body.mediaId) {
    const media = await prisma.instagramMedia.findFirst({
      where: {
        mediaId: req.body.mediaId,
        instagramAccountId: existingRule.instagramAccountId
      },
      select: { mediaId: true }
    });

    if (!media) {
      throw new NotFoundError('Instagram media not found');
    }
  }

  const updatedRule = await prisma.specialRule.update({
    where: { id: existingRule.id },
    data: req.body
  });

  return res.status(200).json({
    success: true,
    data: updatedRule
  });
});

export const deleteSpecialRule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingRule = await prisma.specialRule.findFirst({
    where: {
      id,
      userId: req.user.id
    },
    select: { id: true }
  });

  if (!existingRule) {
    throw new NotFoundError('Special rule not found');
  }

  await prisma.specialRule.delete({ where: { id: existingRule.id } });

  return res.status(200).json({
    success: true,
    data: { id, message: 'Special rule deleted successfully' }
  });
});
