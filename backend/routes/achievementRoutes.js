import express from 'express';
import { getAchievements } from '../controllers/achievementController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAchievements);

export default router;
