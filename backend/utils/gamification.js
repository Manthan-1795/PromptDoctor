import { Achievement, UserAchievement, User } from '../models/index.js';

/**
 * Checks and awards user achievements based on an event key and optional metric
 * @param {number} userId - The user ID
 * @param {string} achievementKey - Specific achievement key (e.g., 'first_diagnosis', 'experimenter')
 * @param {Object} context - Optional context (e.g. score, totalCount, streak)
 * @returns {Promise<Array>} List of newly unlocked achievements
 */
export const checkAndAwardAchievement = async (userId, achievementKey, context = {}) => {
  if (!userId) return [];

  const newlyUnlocked = [];

  try {
    const user = await User.findByPk(userId);
    if (!user) return [];

    const achievement = await Achievement.findOne({ where: { key: achievementKey } });
    if (!achievement) return [];

    let [userAchievement] = await UserAchievement.findOrCreate({
      where: { userId, achievementId: achievement.id },
      defaults: {
        userId,
        achievementId: achievement.id,
        progress: 0,
        unlocked: false,
      },
    });

    if (userAchievement.unlocked) {
      return []; // Already unlocked
    }

    const newProgress = (context.currentCount !== undefined)
      ? context.currentCount
      : (userAchievement.progress || 0) + 1;

    let shouldUnlock = false;
    if (newProgress >= achievement.requiredCount) {
      shouldUnlock = true;
    }

    // Specific score condition for healthy_prompt or perfect_prompt
    if (achievementKey === 'healthy_prompt' && (context.score >= 85 || context.overallScore >= 85)) {
      shouldUnlock = true;
    }
    if (achievementKey === 'perfect_prompt' && (context.score >= 95 || context.overallScore >= 95)) {
      shouldUnlock = true;
    }

    await userAchievement.update({
      progress: newProgress,
      unlocked: shouldUnlock,
      unlockedAt: shouldUnlock ? new Date() : null,
    });

    if (shouldUnlock) {
      // Award XP
      const xpBonus = achievement.xpReward || 100;
      await user.increment('xp', { by: xpBonus });
      const updatedXp = user.xp + xpBonus;
      const newLevel = Math.floor(updatedXp / 300) + 1;
      if (newLevel > user.level) {
        await user.update({ level: newLevel });
      }

      newlyUnlocked.push({
        key: achievement.key,
        title: achievement.title,
        xpReward: achievement.xpReward,
      });
    }
  } catch (err) {
    console.error(`⚠️ [GAMIFICATION ERROR for ${achievementKey}]:`, err.message);
  }

  return newlyUnlocked;
};

/**
 * Checks all diagnosis-related achievements after a diagnosis is created
 */
export const processDiagnosisGamification = async (userId, overallScore, totalDiagnosesCount) => {
  if (!userId) return [];

  const unlocked = [];

  // 1. First diagnosis
  if (totalDiagnosesCount >= 1) {
    const r = await checkAndAwardAchievement(userId, 'first_diagnosis', { currentCount: totalDiagnosesCount });
    unlocked.push(...r);
  }

  // 2. Prompt Doctor (5 diagnoses)
  if (totalDiagnosesCount >= 5) {
    const r = await checkAndAwardAchievement(userId, 'prompt_doctor', { currentCount: totalDiagnosesCount });
    unlocked.push(...r);
  }

  // 3. 10 Diagnoses
  if (totalDiagnosesCount >= 10) {
    const r = await checkAndAwardAchievement(userId, 'ten_diagnoses', { currentCount: totalDiagnosesCount });
    unlocked.push(...r);
  }

  // 4. Prompt Surgeon (25 diagnoses)
  if (totalDiagnosesCount >= 25) {
    const r = await checkAndAwardAchievement(userId, 'prompt_surgeon', { currentCount: totalDiagnosesCount });
    unlocked.push(...r);
  }

  // 5. Healthy Prompt (85+)
  if (overallScore >= 85) {
    const r = await checkAndAwardAchievement(userId, 'healthy_prompt', { score: overallScore });
    unlocked.push(...r);
  }

  // 6. Perfect Prompt (95+)
  if (overallScore >= 95) {
    const r = await checkAndAwardAchievement(userId, 'perfect_prompt', { score: overallScore });
    unlocked.push(...r);
  }

  return unlocked;
};

export default {
  checkAndAwardAchievement,
  processDiagnosisGamification,
};
