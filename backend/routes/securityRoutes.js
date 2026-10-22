import express from 'express';
import { runSecurityScan, getSecurityHistory } from '../controllers/securityController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/scan', optionalAuth, runSecurityScan);
router.get('/history', optionalAuth, getSecurityHistory);

export default router;
