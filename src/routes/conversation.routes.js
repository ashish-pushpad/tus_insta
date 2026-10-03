import { Router } from 'express';
import { getConversations, getConversationMessages } from '../controllers/conversation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/:id/messages', getConversationMessages);

export default router;
