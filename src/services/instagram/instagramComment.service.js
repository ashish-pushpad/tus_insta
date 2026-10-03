import axios from 'axios';
import prisma from '../../config/database.js';
import { InstagramAPIError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v26.0';

/**
 * Reply publicly to an Instagram Comment
 * Meta Graph API: POST /{comment-id}/replies?message={text}
 */
export const replyToComment = async (commentId, replyText, accessToken) => {
  if (!commentId || !replyText) {
    throw new Error('Comment ID and reply message are required');
  }

  logger.info({ commentId, replyText: replyText.substring(0, 40) }, 'Sending Instagram Public Comment Reply');

  if (!accessToken || accessToken.startsWith('mock_')) {
    logger.info('[MOCK MODE] Successfully posted comment reply');
    return { id: `rep_mock_${Date.now()}`, commentId, message: replyText };
  }

  try {
    const response = await axios.post(
      `${META_GRAPH_URL}/${commentId}/replies`,
      { message: replyText },
      { params: { access_token: accessToken } }
    );
    return response.data;
  } catch (error) {
    const apiError = error.response?.data?.error;
    logger.error({ apiError, commentId }, 'Failed to post Instagram comment reply');
    throw new InstagramAPIError(apiError?.message || 'Instagram API failed to post comment reply');
  }
};

/**
 * Send a Private Reply DM triggered from a comment
 * Meta Graph API: POST /{comment-id}/private_replies?message={text}
 */
export const sendPrivateReplyFromComment = async (commentId, dmMessage, accessToken) => {
  if (!commentId || !dmMessage) {
    throw new Error('Comment ID and DM message are required');
  }

  logger.info({ commentId, dmMessage: dmMessage.substring(0, 40) }, 'Sending Instagram Private Reply DM');

  if (!accessToken || accessToken.startsWith('mock_')) {
    logger.info('[MOCK MODE] Successfully sent private reply DM from comment');
    return { id: `priv_mock_${Date.now()}`, commentId, message: dmMessage };
  }

  try {
    const response = await axios.post(
      `${META_GRAPH_URL}/${commentId}/private_replies`,
      { message: dmMessage },
      { params: { access_token: accessToken } }
    );
    return response.data;
  } catch (error) {
    const apiError = error.response?.data?.error;
    logger.error({ apiError, commentId }, 'Failed to send Instagram private reply DM from comment');
    throw new InstagramAPIError(apiError?.message || 'Instagram API failed to send private reply DM');
  }
};
