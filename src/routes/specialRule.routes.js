import { Router } from 'express';
import {
  getSpecialRules,
  createSpecialRule,
  updateSpecialRule,
  deleteSpecialRule
} from '../controllers/specialRule.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createSpecialRuleSchema, updateSpecialRuleSchema } from '../validators/specialRule.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getSpecialRules);
router.post('/', validate(createSpecialRuleSchema), createSpecialRule);
router.patch('/:id', validate(updateSpecialRuleSchema), updateSpecialRule);
router.delete('/:id', deleteSpecialRule);

export default router;
