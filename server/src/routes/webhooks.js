import express from 'express';
import { handleN8nCallback, testWebhook, getWebhookStatus } from '../controllers/webhookController.js';

const router = express.Router();

// n8n workflow callback endpoint (no auth - secured by backend URL)
router.post('/n8n/callback', handleN8nCallback);

// Test endpoint
router.post('/n8n/test', testWebhook);
router.get('/n8n/test', testWebhook);

// Status endpoint
router.get('/n8n/status', getWebhookStatus);

export default router;
