import axios from 'axios';
import { env } from '../../config/env.js';
import prisma from '../../config/database.js';
import { InstagramAPIError, ValidationError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const META_GRAPH_URL = 'https://graph.facebook.com/v26.0';

const decodeOAuthState = (stateStr) => {
  if (!stateStr) {
    throw new ValidationError('OAuth state is required');
  }

  try {
    const decoded = JSON.parse(Buffer.from(stateStr, 'base64').toString('utf8'));
    if (!decoded?.userId) {
      throw new ValidationError('OAuth state is invalid');
    }

    return decoded;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError('OAuth state is invalid');
  }
};

export const getOAuthConnectUrl = (userId) => {
  const scope = [
    'instagram_basic',
    'instagram_manage_comments',
    'instagram_manage_messages',
    'pages_manage_metadata',
    'pages_messaging',
    'pages_read_engagement',
    'pages_show_list'
  ].join(',');

  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

  const params = new URLSearchParams({
    client_id: env.META_APP_ID,
    redirect_uri: env.META_REDIRECT_URI,
    scope,
    response_type: 'code',
    state
  });

  return `https://www.facebook.com/v26.0/dialog/oauth?${params.toString()}`;
};

export const handleOAuthCallback = async (code, stateStr) => {
  if (!code) {
    throw new ValidationError('OAuth authorization code is required');
  }

  const { userId } = decodeOAuthState(stateStr);
  // console.log("userId ====> ",userId)
  try {
    // 1. Exchange authorization code for short-lived access token
    // console.log("instagram code ==> ",code)
    const tokenResponse = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
      params: {
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        redirect_uri: env.META_REDIRECT_URI,
        code
      }
    });

    const shortLivedToken = tokenResponse.data.access_token;
    // console.log("shortLivedToken",shortLivedToken)
    // 2. Exchange short-lived token for long-lived access token (60 days)
    const longLivedResponse = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken
      }
    });
    console.log("longLivedResponse",longLivedResponse)
    const accessToken = longLivedResponse.data.access_token;
    const expiresIn = longLivedResponse.data.expires_in || 5184000; // 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    const debugResponse = await axios.get(
  `${META_GRAPH_URL}/me/permissions`,
  {
    params: {
      access_token: accessToken
    }
  }
);

console.log(
  "TOKEN PERMISSIONS ==> ",
  JSON.stringify(debugResponse.data, null, 2)
);

    // 3. Get connected Facebook Pages with Instagram Business Accounts
    // console.log("come here ==> Facebook Pages with Instagram Business Accounts")
    const pagesResponse = await axios.get(`${META_GRAPH_URL}/me/accounts`, {
      params: {
        fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}',
        access_token: accessToken
      }
    });
    console.log("pagesResponse data ==> ",pagesResponse.data)
    const pages = pagesResponse.data.data || [];
    const pageWithIg = pages.find((p) => p.instagram_business_account);

    if (!pageWithIg || !pageWithIg.instagram_business_account) {
      throw new InstagramAPIError(
        'No Instagram Professional/Business account linked to your Facebook Pages. Please switch your Instagram account to Professional status.'
      );
    }

    const igAccount = pageWithIg.instagram_business_account;

    // 4. Upsert Instagram Account into Database
    let accountRecord;
    try {
      accountRecord = await prisma.instagramAccount.upsert({
        where: { instagramUserId: igAccount.id },
        update: {
          accessToken,
          tokenExpiresAt,
          username: igAccount.username,
          name: igAccount.name || igAccount.username,
          profilePictureUrl: igAccount.profile_picture_url || null,
          isConnected: true
        },
        create: {
          userId,
          instagramUserId: igAccount.id,
          username: igAccount.username,
          name: igAccount.name || igAccount.username,
          profilePictureUrl: igAccount.profile_picture_url || null,
          accessToken,
          tokenExpiresAt,
          isConnected: true
        }
      });
    } catch (dbError) {
      logger.warn({ dbError }, 'Database unmigrated, returning transient account metadata');
      accountRecord = {
        id: 'ig_acc_' + igAccount.id,
        userId,
        instagramUserId: igAccount.id,
        username: igAccount.username,
        name: igAccount.name || igAccount.username,
        profilePictureUrl: igAccount.profile_picture_url || null,
        isConnected: true
      };
    }

    return accountRecord;
  } catch (error) {
    logger.error({ error: error.response?.data || error.message }, 'Instagram OAuth Token Exchange failed');

    throw new InstagramAPIError(
      error.response?.data?.error?.message || 'Failed to exchange Instagram OAuth token'
    );
  }
};
