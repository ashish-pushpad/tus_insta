import { Router } from 'express';
import { getWebhookConfig } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/webhook', getWebhookConfig);

export default router;
