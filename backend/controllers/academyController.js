import { AcademyLesson, UserLessonProgress, User } from '../models/index.js';
import { checkAndAwardAchievement } from '../utils/gamification.js';

// @desc    Get all 10 Academy lessons with optional user completion progress
// @route   GET /api/academy/lessons
// @access  Public / Optional Auth
export const getAcademyLessons = async (req, res, next) => {
  try {
    const lessons = await AcademyLesson.findAll({
      order: [['lessonNumber', 'ASC']],
    });

    let progressMap = {};
    if (req.user) {
      const progressList = await UserLessonProgress.findAll({
        where: { userId: req.user.id },
      });
      progressList.forEach((p) => {
        progressMap[p.lessonId] = {
          completed: p.completed,
          quizScore: p.quizScore,
          completedAt: p.completedAt,
        };
      });
    }

    const payload = lessons.map((l) => ({
      ...l.toJSON(),
      completed: progressMap[l.id]?.completed || false,
      quizScore: progressMap[l.id]?.quizScore || 0,
      completedAt: progressMap[l.id]?.completedAt || null,
    }));

    res.json({
      success: true,
      count: payload.length,
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete academy lesson quiz and grant XP
// @route   POST /api/academy/lessons/:id/complete
// @access  Protected
export const completeLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { selectedOption } = req.body;

    const lesson = await AcademyLesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found in curriculum.',
      });
    }

    const correct = lesson.quiz && Number(selectedOption) === lesson.quiz.correct;
    const quizScore = correct ? 100 : 0;

    const [progress, created] = await UserLessonProgress.findOrCreate({
      where: { userId: req.user.id, lessonId: lesson.id },
      defaults: {
        userId: req.user.id,
        lessonId: lesson.id,
        completed: correct,
        quizScore,
        completedAt: correct ? new Date() : null,
      },
    });

    let xpAwarded = 0;
    if (correct && (!progress.completed || created)) {
      await progress.update({
        completed: true,
        quizScore: 100,
        completedAt: new Date(),
      });

      xpAwarded = lesson.xpReward || 100;
      await req.user.increment('xp', { by: xpAwarded });

      const updatedXp = req.user.xp + xpAwarded;
      const newLevel = Math.floor(updatedXp / 300) + 1;
      if (newLevel > req.user.level) {
        await req.user.update({ level: newLevel });
      }
    }

    // Check how many total lessons completed
    const completedCount = await UserLessonProgress.count({
      where: { userId: req.user.id, completed: true },
    });

    res.json({
      success: true,
      correct,
      quizScore,
      xpAwarded,
      explanation: lesson.quiz?.explanation || '',
      completedCount,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAcademyLessons,
  completeLesson,
};
