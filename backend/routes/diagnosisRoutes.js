import express from 'express';
import {
  diagnosePrompt,
  getDiagnosisById,
  listDiagnoses,
  getLabStats,
  deleteDiagnosis,
} from '../controllers/diagnosisController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats/overview', optionalAuth, getLabStats);
router.post('/', optionalAuth, diagnosePrompt);
router.post('/diagnose', optionalAuth, diagnosePrompt);
router.get('/', optionalAuth, listDiagnoses);
router.get('/:id', optionalAuth, getDiagnosisById);
router.delete('/:id', protect, deleteDiagnosis);

export default router;
