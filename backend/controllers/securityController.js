import { SecurityScan } from '../models/index.js';
import { scanPromptSecurity } from '../services/groqService.js';
import { checkAndAwardAchievement } from '../utils/gamification.js';

// @desc    Scan prompt for security vulnerabilities & jailbreaks using Groq AI and store in MySQL
// @route   POST /api/security/scan
// @access  Public / Optional Auth
export const runSecurityScan = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for security scan.',
      });
    }

    const trimmedPrompt = prompt.trim();
    const result = await scanPromptSecurity(trimmedPrompt);

    // Save to MySQL
    const scanRecord = await SecurityScan.create({
      userId: req.user ? req.user.id : null,
      prompt: trimmedPrompt,
      securityScore: result.securityScore,
      riskLevel: result.riskLevel,
      detectedIssues: result.detectedIssues,
      recommendations: result.recommendations,
    });

    // Check gamification for security_scout achievement
    let newlyUnlocked = [];
    if (req.user) {
      newlyUnlocked = await checkAndAwardAchievement(req.user.id, 'security_scout');
      await req.user.increment('xp', { by: 40 });
    }

    res.status(201).json({
      success: true,
      data: scanRecord,
      details: result,
      newlyUnlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get security scan history
// @route   GET /api/security/history
// @access  Public / Optional Auth
export const getSecurityHistory = async (req, res, next) => {
  try {
    const where = {};
    if (req.user) {
      where.userId = req.user.id;
    }

    const scans = await SecurityScan.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({
      success: true,
      count: scans.length,
      data: scans,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  runSecurityScan,
  getSecurityHistory,
};
