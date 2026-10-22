import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  User,
  Diagnosis,
  UserAchievement,
  Achievement,
  UserLessonProgress,
  AcademyLesson,
} from '../models/index.js';

const router = express.Router();

// @desc    Get user profile, achievements, academy progress & laboratory telemetry
// @route   GET /api/user/profile
// @access  Protected
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Diagnosis,
          as: 'diagnoses',
          order: [['createdAt', 'DESC']],
          limit: 10,
        },
      ],
    });

    const diagnosesCount = await Diagnosis.count({ where: { userId: req.user.id } });
    const userDiagnoses = await Diagnosis.findAll({
      where: { userId: req.user.id },
      attributes: ['overallScore'],
    });

    const avgScore = userDiagnoses.length > 0
      ? Math.round(userDiagnoses.reduce((a, b) => a + b.overallScore, 0) / userDiagnoses.length)
      : 82;

    // Achievements progress
    const totalAchievements = await Achievement.count();
    const unlockedAchievements = await UserAchievement.count({
      where: { userId: req.user.id, unlocked: true },
    });

    // Academy progress
    const totalLessons = await AcademyLesson.count();
    const completedLessons = await UserLessonProgress.count({
      where: { userId: req.user.id, completed: true },
    });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalDiagnoses: diagnosesCount,
          averageScore: avgScore,
          streak: user.streak,
          xp: user.xp,
          level: user.level,
          achievementsUnlocked: unlockedAchievements,
          totalAchievements: totalAchievements || 9,
          academyCompleted: completedLessons,
          totalAcademyLessons: totalLessons || 10,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Protected
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByPk(req.user.id);
    if (name) user.name = name;
    await user.save();

    res.json({
      success: true,
      message: 'Practitioner profile updated.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
