import { getOAuthConnectUrl, handleOAuthCallback } from '../services/instagram/instagramAuth.service.js';
import { fetchAccountMedia } from '../services/instagram/instagramMedia.service.js';
import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { NotFoundError } from '../utils/errors.js';

export const getConnectUrl = asyncHandler(async (req, res) => {
  const url = getOAuthConnectUrl(req.user.id);
  return res.status(200).json({
    success: true,
    data: { url }
  });
});

export const handleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const account = await handleOAuthCallback(code, state);
  
  // Redirect to frontend Instagram settings page
  return res.redirect(`${env.FRONTEND_URL}/instagram?connected=true&account=${account.username}`);
});

export const getAccount = asyncHandler(async (req, res) => {
  const account = await prisma.instagramAccount.findFirst({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return res.status(200).json({
    success: true,
    data: account
  });
});

export const getMedia = asyncHandler(async (req, res) => {
  let accountId = req.query.accountId ?? null;

  if (accountId) {
    const ownedAccount = await prisma.instagramAccount.findFirst({
      where: {
        id: accountId,
        userId: req.user.id
      },
      select: { id: true }
    });

    if (!ownedAccount) {
      throw new NotFoundError('Instagram account not found');
    }
  } else {
    const account = await prisma.instagramAccount.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    });

    if (!account) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    accountId = account.id;
  }

  const mediaList = await fetchAccountMedia(accountId);
  return res.status(200).json({
    success: true,
    data: mediaList
  });
});
