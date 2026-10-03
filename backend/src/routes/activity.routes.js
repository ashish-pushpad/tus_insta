import { Router } from 'express';
import { getActivityLogs, getDashboardStats } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getActivityLogs);
router.get('/stats', getDashboardStats);

export default router;
