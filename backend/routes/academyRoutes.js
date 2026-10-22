import express from 'express';
import { getAcademyLessons, completeLesson } from '../controllers/academyController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/lessons', optionalAuth, getAcademyLessons);
router.post('/lessons/:id/complete', protect, completeLesson);

export default router;
