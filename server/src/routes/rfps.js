import express from 'express';
import { getAllRFPs, getRFPById, createRFP, updateRFP, deleteRFP } from '../controllers/rfpController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All RFP routes require authentication
router.use(authenticate);

router.get('/', getAllRFPs);
router.get('/:id', validate(schemas.uuidParam, 'params'), getRFPById);
router.post('/', validate(schemas.createRFP), createRFP);
router.put('/:id', validate(schemas.uuidParam, 'params'), validate(schemas.updateRFP), updateRFP);
router.delete('/:id', validate(schemas.uuidParam, 'params'), deleteRFP);

export default router;
