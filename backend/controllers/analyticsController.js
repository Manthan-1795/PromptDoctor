import {
  Diagnosis,
  DiagnosisDimension,
  Symptom,
} from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// @desc    Get comprehensive laboratory analytics
// @route   GET /api/analytics/overview
// @access  Public
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const totalDiagnoses = await Diagnosis.count();

    if (totalDiagnoses === 0) {
      return res.json({
        success: true,
        data: {
          totalPrompts: 0,
          averageHealthScore: 0,
          highestScore: 0,
          lowestScore: 0,
          promptsImproved: 0,
          mostCommonSymptoms: [],
          strongestDimension: { name: 'Instruction Precision', score: 0 },
          weakestDimension: { name: 'Negative Constraints', score: 0 },
          dimensionAverages: [],
          scoreOverTime: [],
          countOverTime: [],
        },
      });
    }

    // 1. Min, Max, Average score
    const scores = await Diagnosis.findAll({
      attributes: ['id', 'overallScore', 'status', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });

    const scoreVals = scores.map((s) => s.overallScore);
    const sum = scoreVals.reduce((a, b) => a + b, 0);
    const averageHealthScore = Math.round(sum / scoreVals.length);
    const highestScore = Math.max(...scoreVals);
    const lowestScore = Math.min(...scoreVals);
    const promptsImproved = scores.filter((s) => s.overallScore >= 70).length;

    // 2. Most common symptoms
    const symptoms = await Symptom.findAll({
      attributes: ['title', [Diagnosis.sequelize.fn('COUNT', Diagnosis.sequelize.col('title')), 'count']],
      group: ['title'],
      order: [[Diagnosis.sequelize.fn('COUNT', Diagnosis.sequelize.col('title')), 'DESC']],
      limit: 6,
    });

    const mostCommonSymptoms = symptoms.map((s) => ({
      name: s.title,
      count: parseInt(s.get('count'), 10),
    }));

    // 3. Dimension Averages
    const dimensions = await DiagnosisDimension.findAll({
      attributes: [
        'dimensionName',
        [Diagnosis.sequelize.fn('AVG', Diagnosis.sequelize.col('score')), 'avgScore'],
      ],
      group: ['dimensionName'],
      order: [[Diagnosis.sequelize.fn('AVG', Diagnosis.sequelize.col('score')), 'DESC']],
    });

    const dimensionAverages = dimensions.map((d) => ({
      name: d.dimensionName,
      score: Math.round(parseFloat(d.get('avgScore')) || 0),
    }));

    const strongestDimension = dimensionAverages.length > 0
      ? dimensionAverages[0]
      : { name: 'Instruction Clarity', score: averageHealthScore };

    const weakestDimension = dimensionAverages.length > 0
      ? dimensionAverages[dimensionAverages.length - 1]
      : { name: 'Negative Constraints', score: Math.max(0, averageHealthScore - 20) };

    // 4. Score over time (longitudinal trajectory)
    const scoreOverTime = scores.map((s, idx) => ({
      session: `#${idx + 1}`,
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.overallScore,
    }));

    // 5. Diagnosis count grouped by date
    const dateCounts = {};
    scores.forEach((s) => {
      const d = new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    });

    const countOverTime = Object.entries(dateCounts).map(([date, count]) => ({
      date,
      count,
    }));

    res.json({
      success: true,
      data: {
        totalPrompts: totalDiagnoses,
        averageHealthScore,
        highestScore,
        lowestScore,
        promptsImproved,
        mostCommonSymptoms,
        strongestDimension,
        weakestDimension,
        dimensionAverages,
        scoreOverTime,
        countOverTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAnalyticsOverview,
};
