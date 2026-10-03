import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DEFAULT_AI_CONFIG = {
  enabled:              true,
  replyStyle:           'friendly',
  businessDescription:  '',
  businessInstructions: '',
  tone:                 'Friendly and professional social media assistant',
  maxResponseLength:    150,
  customInstructions:   'Always keep responses short and natural. Never invent pricing details.'
};

export const getAISettings = asyncHandler(async (req, res) => {
  const config = await prisma.aIConfiguration.findFirst({
    where: { userId: req.user.id },
    // Never return instagramAccountId or internal IDs unless needed
    select: {
      id:                   true,
      enabled:              true,
      replyStyle:           true,
      businessDescription:  true,
      businessInstructions: true,
      tone:                 true,
      maxResponseLength:    true,
      customInstructions:   true,
      updatedAt:            true
    }
  });

  return res.status(200).json({
    success: true,
    data: config || { ...DEFAULT_AI_CONFIG }
  });
});

export const updateAISettings = asyncHandler(async (req, res) => {
  // Strip fields that should never be user-writable
  const { userId: _u, instagramAccountId: _ia, id: _id, ...safeBody } = req.body;

  const existing = await prisma.aIConfiguration.findFirst({
    where: { userId: req.user.id },
    select: { id: true }
  });

  let updatedConfig;
  if (existing) {
    updatedConfig = await prisma.aIConfiguration.update({
      where: { id: existing.id },
      data: safeBody
    });
  } else {
    updatedConfig = await prisma.aIConfiguration.create({
      data: {
        userId: req.user.id,
        ...DEFAULT_AI_CONFIG,
        ...safeBody
      }
    });
  }

  return res.status(200).json({
    success: true,
    data: updatedConfig
  });
});
