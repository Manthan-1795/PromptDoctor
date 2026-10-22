import { Achievement, UserAchievement } from '../models/index.js';

// @desc    Get all achievements with user unlock status & progress
// @route   GET /api/achievements
// @access  Public / Optional Auth
export const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.findAll({
      order: [['id', 'ASC']],
    });

    let userAchMap = {};
    if (req.user) {
      const records = await UserAchievement.findAll({
        where: { userId: req.user.id },
      });
      records.forEach((r) => {
        userAchMap[r.achievementId] = {
          unlocked: r.unlocked,
          progress: r.progress,
          unlockedAt: r.unlockedAt,
        };
      });
    }

    const payload = achievements.map((a) => {
      const record = userAchMap[a.id];
      return {
        ...a.toJSON(),
        unlocked: record ? record.unlocked : false,
        progress: record ? record.progress : 0,
        maxProgress: a.requiredCount,
        unlockedAt: record ? record.unlockedAt : null,
      };
    });

    const unlockedCount = payload.filter((p) => p.unlocked).length;

    res.json({
      success: true,
      total: payload.length,
      unlockedCount,
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAchievements,
};
