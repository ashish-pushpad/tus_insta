import { Router } from 'express';
import { getAutomations, updateAutomation } from '../controllers/automation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateAutomationSchema } from '../validators/automation.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getAutomations);
router.post('/', validate(updateAutomationSchema), updateAutomation);
router.patch('/', validate(updateAutomationSchema), updateAutomation);

export default router;
