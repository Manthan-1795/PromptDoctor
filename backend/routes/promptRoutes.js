import express from 'express';
import {
  diagnosePrompt,
  getDiagnosisById,
  listDiagnoses,
  getLabStats,
} from '../controllers/diagnosisController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Required by specification: POST /api/prompts/diagnose
router.post('/diagnose', optionalAuth, diagnosePrompt);
router.get('/', optionalAuth, listDiagnoses);
router.get('/:id', getDiagnosisById);

export default router;
