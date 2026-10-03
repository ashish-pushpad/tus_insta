import { Router } from 'express';
import { getConnectUrl, handleCallback, getAccount, getMedia } from '../controllers/instagram.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/connect', authenticate, getConnectUrl);
router.get('/callback', handleCallback);
router.get('/account', authenticate, getAccount);
router.get('/media', authenticate, getMedia);

export default router;
