import { Router } from 'express';
import { getAISettings, updateAISettings } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateAISettingsSchema } from '../validators/ai.validator.js';

const router = Router();

router.use(authenticate);

router.get('/settings', getAISettings);
router.patch('/settings', validate(updateAISettingsSchema), updateAISettings);

export default router;
