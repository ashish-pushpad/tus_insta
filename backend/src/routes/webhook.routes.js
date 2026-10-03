import { Router } from 'express';
import { verifyWebhook, receiveWebhookEvent } from '../controllers/webhook.controller.js';

const router = Router();

router.get('/instagram', verifyWebhook);
router.post('/instagram', receiveWebhookEvent);

export default router;
