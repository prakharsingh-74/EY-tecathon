import express from 'express';
import { getSettings, updateSettings, configureWebhook } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All settings routes require authentication
router.use(authenticate);

router.get('/', getSettings);
router.put('/', validate(schemas.updateSettings), updateSettings);
router.post('/webhooks', configureWebhook);

export default router;
