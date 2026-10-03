import axios from 'axios';
import prisma from '../../config/database.js';
import { InstagramAPIError, NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v26.0';

export const fetchAccountMedia = async (instagramAccountId) => {
  const account = await prisma.instagramAccount.findUnique({
    where: { id: instagramAccountId }
  });

  if (!account) {
    throw new NotFoundError('Instagram account not found');
  }

  const cachedMedia = await prisma.instagramMedia.findMany({
    where: { instagramAccountId },
    orderBy: [{ timestamp: 'desc' }, { createdAt: 'desc' }]
  });

  if (!account.accessToken) {
    return cachedMedia;
  }

  try {
    const response = await axios.get(`${META_GRAPH_URL}/${account.instagramUserId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp',
        access_token: account.accessToken
      }
    });

    const items = response.data.data || [];

    // Cache / Sync media items into Database
    const syncedMedia = [];
    for (const item of items) {
      try {
        const record = await prisma.instagramMedia.upsert({
          where: { mediaId: item.id },
          update: {
            caption: item.caption || '',
            mediaType: item.media_type || 'IMAGE',
            mediaUrl: item.media_url || item.permalink,
            permalink: item.permalink,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
          },
          create: {
            instagramAccountId,
            mediaId: item.id,
            caption: item.caption || '',
            mediaType: item.media_type || 'IMAGE',
            mediaUrl: item.media_url || item.permalink,
            permalink: item.permalink,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
            aiCommentReplyEnabled: true,
            aiDmReplyEnabled: true
          }
        });
        syncedMedia.push(record);
      } catch {
        syncedMedia.push({
          id: 'med_' + item.id,
          instagramAccountId,
          mediaId: item.id,
          caption: item.caption || '',
          mediaType: item.media_type || 'IMAGE',
          mediaUrl: item.media_url || item.permalink,
          permalink: item.permalink,
          timestamp: item.timestamp,
          aiCommentReplyEnabled: true,
          aiDmReplyEnabled: true
        });
      }
    }

    return syncedMedia.length > 0 ? syncedMedia : cachedMedia;
  } catch (error) {
    logger.error({ error: error.response?.data || error.message }, 'Failed to fetch Instagram Media from Graph API');
    return cachedMedia;
  }
};

export const updateMediaAutomationSettings = async (mediaId, { aiCommentReplyEnabled, aiDmReplyEnabled }) => {
  try {
    const updated = await prisma.instagramMedia.update({
      where: { mediaId },
      data: {
        ...(aiCommentReplyEnabled !== undefined && { aiCommentReplyEnabled }),
        ...(aiDmReplyEnabled !== undefined && { aiDmReplyEnabled })
      }
    });
    return updated;
  } catch {
    return {
      mediaId,
      aiCommentReplyEnabled,
      aiDmReplyEnabled,
      updatedAt: new Date()
    };
  }
};
