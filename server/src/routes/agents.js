import express from 'express';
import { getAllAgents, getAgentById, getAgentTasks, executeAgent } from '../controllers/agentController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All agent routes require authentication
router.use(authenticate);

router.get('/', getAllAgents);
router.get('/:id', validate(schemas.uuidParam, 'params'), getAgentById);
router.get('/:id/tasks', validate(schemas.uuidParam, 'params'), getAgentTasks);
router.post('/:id/execute', validate(schemas.uuidParam, 'params'), executeAgent);

export default router;
