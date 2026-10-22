import { PromptExperiment } from '../models/index.js';
import { applyExperimentStrategy } from '../services/groqService.js';
import { checkAndAwardAchievement } from '../utils/gamification.js';

// @desc    Run a prompt strategy experiment using Groq AI and store in MySQL
// @route   POST /api/experiments/run
// @access  Public / Optional Auth
export const runExperiment = async (req, res, next) => {
  try {
    const { strategy, diagnosisId } = req.body;
    const prompt = req.body.prompt || req.body.originalPrompt;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for experiment.',
      });
    }

    const validStrategies = [
      'Role Prompting',
      'Few-Shot Prompting',
      'Context Addition',
      'Constraints',
      'Structured Output',
      'Persona',
      'Tone',
      'Target Audience',
    ];

    const selectedStrategy = validStrategies.includes(strategy)
      ? strategy
      : 'Role Prompting';

    const result = await applyExperimentStrategy(prompt.trim(), selectedStrategy);

    // Save experiment to MySQL
    const experiment = await PromptExperiment.create({
      userId: req.user ? req.user.id : null,
      diagnosisId: diagnosisId ? parseInt(diagnosisId, 10) : null,
      strategy: result.strategy,
      originalPrompt: result.originalPrompt,
      modifiedPrompt: result.modifiedPrompt,
      scoreBefore: result.scoreBefore,
      scoreAfter: result.scoreAfter,
      scoreDelta: result.scoreDelta,
      improved: result.improved,
      explanation: result.explanation,
    });

    // Check gamification for experimenter achievement
    let newlyUnlocked = [];
    if (req.user) {
      newlyUnlocked = await checkAndAwardAchievement(req.user.id, 'experimenter');
      // award 35 XP for running an experiment
      await req.user.increment('xp', { by: 35 });
    }

    res.status(201).json({
      success: true,
      data: experiment,
      details: result,
      newlyUnlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get experiment history
// @route   GET /api/experiments
// @access  Public / Optional Auth
export const getExperimentHistory = async (req, res, next) => {
  try {
    const where = {};
    if (req.user) {
      where.userId = req.user.id;
    }

    const experiments = await PromptExperiment.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({
      success: true,
      count: experiments.length,
      data: experiments,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  runExperiment,
  getExperimentHistory,
};
