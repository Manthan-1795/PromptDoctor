import express from 'express';
import { runExperiment, getExperimentHistory } from '../controllers/experimentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/run', optionalAuth, runExperiment);
router.get('/', optionalAuth, getExperimentHistory);

export default router;
