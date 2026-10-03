import axios from 'axios';
import { InstagramAPIError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v26.0';

/**
 * Send a Direct Message to an Instagram User
 * Meta Graph API: POST /{ig-business-id}/messages
 * Body: { recipient: { id: recipientId }, message: { text: messageText } }
 */
export const sendDirectMessage = async (igBusinessAccountId, recipientId, messageText, accessToken) => {
  if (!recipientId || !messageText) {
    throw new Error('Recipient ID and message text are required');
  }

  logger.info({ igBusinessAccountId, recipientId, messageText: messageText.substring(0, 40) }, 'Sending Direct Message');

  if (!accessToken || accessToken.startsWith('mock_')) {
    logger.info('[MOCK MODE] Successfully sent Instagram DM');
    return { recipient_id: recipientId, message_id: `mid_mock_${Date.now()}` };
  }

  try {
    const endpointUrl = `${META_GRAPH_URL}/${igBusinessAccountId || 'me'}/messages`;
    const response = await axios.post(
      endpointUrl,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      { params: { access_token: accessToken } }
    );
    return response.data;
  } catch (error) {
    const apiError = error.response?.data?.error;
    logger.error({ apiError, recipientId }, 'Failed to send Instagram Direct Message');
    throw new InstagramAPIError(apiError?.message || 'Instagram API failed to send Direct Message');
  }
};
