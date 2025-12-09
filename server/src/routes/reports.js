import express from 'express';
import { getAllReports, getReportById, createReport, updateReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

router.get('/', getAllReports);
router.get('/:id', validate(schemas.uuidParam, 'params'), getReportById);
router.post('/', createReport);
router.put('/:id', validate(schemas.uuidParam, 'params'), updateReport);

export default router;
