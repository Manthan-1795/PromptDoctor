import { Op } from 'sequelize';
import {
  Diagnosis,
  DiagnosisDimension,
  Symptom,
  Prescription,
  DiagnosisChange,
  PromptDNA,
  User,
} from '../models/index.js';
import { diagnosePromptWithGroq } from '../services/groqService.js';
import { processDiagnosisGamification } from '../utils/gamification.js';

// Human-readable labels for the 11 dimensions
const DIMENSION_DISPLAY_NAMES = {
  role: 'Role Specification',
  context: 'Context & Intent',
  objective: 'Objective Definition',
  clarity: 'Instruction Clarity',
  specificity: 'Specificity & Detail',
  constraints: 'Negative Constraints',
  examples: 'Exemplar Demonstration',
  outputFormat: 'Output Structure',
  targetAudience: 'Target Audience Framing',
  ambiguity: 'Ambiguity Suppression',
  completeness: 'Clinical Completeness',
};

// @desc    Diagnose prompt using Groq AI and persist to MySQL
// @route   POST /api/prompts/diagnose
// @access  Public or Protected
export const diagnosePrompt = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    // 1. Validation
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Prompt is required and cannot be empty.',
      });
    }

    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Prompt exceeds maximum allowable clinical length of 10,000 characters.',
      });
    }

    // 2. Execute Groq AI Clinical Diagnosis
    const aiResult = await diagnosePromptWithGroq(trimmedPrompt);

    // 3. Persist Diagnosis Record to MySQL
    const cleanTitle = trimmedPrompt
      .replace(/^(please|can you|i want you to|write me|tell me about|make a)/i, '')
      .trim();
    const title = cleanTitle ? `Prompt Rx: ${cleanTitle.slice(0, 40)}` : 'Prompt Clinical Specimen';

    const diagnosis = await Diagnosis.create({
      userId: req.user ? req.user.id : null,
      originalPrompt: trimmedPrompt,
      improvedPrompt: aiResult.improvedPrompt,
      overallScore: aiResult.overallScore,
      status: aiResult.status,
      modelTarget: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      title,
    });

    // 4. Save all 11 Dimensions to DiagnosisDimension
    const dimensionsPayload = Object.entries(aiResult.dimensions).map(([key, dim]) => ({
      diagnosisId: diagnosis.id,
      dimensionName: DIMENSION_DISPLAY_NAMES[key] || key,
      score: dim.score,
      status: dim.status,
      explanation: dim.explanation,
      recommendation: dim.recommendation,
    }));
    await DiagnosisDimension.bulkCreate(dimensionsPayload);

    // 5. Save Symptoms
    if (aiResult.symptoms && aiResult.symptoms.length > 0) {
      const symptomsPayload = aiResult.symptoms.map((s) => ({
        diagnosisId: diagnosis.id,
        title: s.title,
        severity: s.severity,
        description: s.description,
        recommendation: s.recommendation,
      }));
      await Symptom.bulkCreate(symptomsPayload);
    }

    // 6. Save Prescriptions
    if (aiResult.prescription && aiResult.prescription.length > 0) {
      const prescriptionsPayload = aiResult.prescription.map((rec, idx) => ({
        diagnosisId: diagnosis.id,
        recommendation: typeof rec === 'string' ? rec : rec.recommendation || JSON.stringify(rec),
        actionCategory: 'Clinical Rx',
        priority: idx < 2 ? 'High' : 'Medium',
      }));
      await Prescription.bulkCreate(prescriptionsPayload);
    }

    // 7. Save Changes
    if (aiResult.changes && aiResult.changes.length > 0) {
      const changesPayload = aiResult.changes.map((c) => ({
        diagnosisId: diagnosis.id,
        type: c.type,
        description: c.description,
      }));
      await DiagnosisChange.bulkCreate(changesPayload);
    }

    // 8. Save Prompt DNA
    if (aiResult.promptDNA) {
      await PromptDNA.create({
        diagnosisId: diagnosis.id,
        roleStrength: aiResult.promptDNA.roleStrength,
        contextStrength: aiResult.promptDNA.contextStrength,
        instructionStrength: aiResult.promptDNA.instructionStrength,
        constraintStrength: aiResult.promptDNA.constraintStrength,
        outputStructureStrength: aiResult.promptDNA.outputStructureStrength,
        specificityStrength: aiResult.promptDNA.specificityStrength,
      });
    }

    // 9. If user is logged in, grant XP, check level progression & evaluate achievements
    let newlyUnlocked = [];
    if (req.user) {
      const xpGain = 50;
      await req.user.increment('xp', { by: xpGain });
      const updatedXp = req.user.xp + xpGain;
      const newLevel = Math.floor(updatedXp / 300) + 1;
      if (newLevel > req.user.level) {
        await req.user.update({ level: newLevel });
      }

      // Count user's total diagnoses
      const totalUserDiagnoses = await Diagnosis.count({ where: { userId: req.user.id } });
      newlyUnlocked = await processDiagnosisGamification(req.user.id, aiResult.overallScore, totalUserDiagnoses);
    }

    // 10. Fetch fully populated medical record for frontend
    const fullRecord = await Diagnosis.findByPk(diagnosis.id, {
      include: [
        { model: DiagnosisDimension, as: 'dimensions' },
        { model: Symptom, as: 'symptoms' },
        { model: Prescription, as: 'prescriptions' },
        { model: DiagnosisChange, as: 'changes' },
        { model: PromptDNA, as: 'dna' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'level', 'xp'] },
      ],
    });

    // 11. Return the response
    res.status(201).json({
      success: true,
      id: diagnosis.id,
      overallScore: aiResult.overallScore,
      status: aiResult.status,
      dimensions: aiResult.dimensions,
      symptoms: aiResult.symptoms,
      prescription: aiResult.prescription,
      prescriptions: aiResult.prescription,
      improvedPrompt: aiResult.improvedPrompt,
      changes: aiResult.changes,
      promptDNA: aiResult.promptDNA,
      newlyUnlocked,
      data: fullRecord,
    });
  } catch (error) {
    console.error('⚠️ [DIAGNOSIS CONTROLLER ERROR]:', error.message);
    const statusCode = error.status || (res.statusCode === 200 ? 500 : res.statusCode);
    res.status(statusCode).json({
      success: false,
      error: error.code || 'Diagnosis Error',
      message: error.message || 'An error occurred during prompt engineering diagnosis.',
    });
  }
};

// @desc    Get diagnosis record by ID
// @route   GET /api/diagnosis/:id or /api/prompts/diagnose/:id
// @access  Public
export const getDiagnosisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const diagnosis = await Diagnosis.findByPk(id, {
      include: [
        { model: DiagnosisDimension, as: 'dimensions' },
        { model: Symptom, as: 'symptoms' },
        { model: Prescription, as: 'prescriptions' },
        { model: DiagnosisChange, as: 'changes' },
        { model: PromptDNA, as: 'dna' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'level', 'xp'] },
      ],
    });

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: `Clinical record #${id} not found in database.`,
      });
    }

    if (diagnosis.userId && req.user && diagnosis.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot access another user\'s diagnosis record.',
      });
    }

    res.json({
      success: true,
      data: diagnosis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List diagnosis history with search, health status filter, and sorting
// @route   GET /api/diagnoses or /api/diagnosis or /api/prompts
// @access  Public / Optional Auth
export const listDiagnoses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const offset = (page - 1) * limit;

    const { search, status, sortBy, sortOrder } = req.query;

    const where = {};
    if (req.user) {
      where.userId = req.user.id;
    }

    // Health status filter
    if (status && status !== 'all') {
      where.status = status.toLowerCase();
    }

    // Search query filter
    if (search && typeof search === 'string' && search.trim()) {
      const s = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: s } },
        { originalPrompt: { [Op.like]: s } },
        { improvedPrompt: { [Op.like]: s } },
        { modelTarget: { [Op.like]: s } },
      ];
    }

    // Sorting by score or date
    const orderCol = sortBy === 'score' ? 'overallScore' : 'createdAt';
    const orderDirection = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const { count, rows } = await Diagnosis.findAndCountAll({
      where,
      order: [[orderCol, orderDirection]],
      limit,
      offset,
      include: [
        { model: DiagnosisDimension, as: 'dimensions' },
        { model: PromptDNA, as: 'dna' },
        { model: Symptom, as: 'symptoms' },
      ],
    });

    res.json({
      success: true,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated laboratory stats
// @route   GET /api/diagnosis/stats/overview
// @access  Public / Optional Auth
export const getLabStats = async (req, res, next) => {
  try {
    const where = {};
    if (req.user) {
      where.userId = req.user.id;
    }

    const totalDiagnoses = await Diagnosis.count({ where });
    const diagnoses = await Diagnosis.findAll({
      where,
      attributes: ['overallScore', 'status', 'createdAt', 'improvedPrompt'],
      limit: 100,
      order: [['createdAt', 'DESC']],
    });

    let avgScore = 0;
    let promptsImproved = 0;
    if (diagnoses.length > 0) {
      const sum = diagnoses.reduce((acc, curr) => acc + curr.overallScore, 0);
      avgScore = Math.round(sum / diagnoses.length);
      promptsImproved = diagnoses.filter((d) => Boolean(d.improvedPrompt)).length;
    }

    // Dynamic health distribution calculation
    const optimal = diagnoses.filter((d) => d.overallScore >= 85).length;
    const healthy = diagnoses.filter((d) => d.overallScore >= 70 && d.overallScore < 85).length;
    const fair = diagnoses.filter((d) => d.overallScore >= 50 && d.overallScore < 70).length;
    const critical = diagnoses.filter((d) => d.overallScore < 50).length;

    res.json({
      success: true,
      data: {
        totalDiagnoses,
        promptsImproved,
        averageHealthScore: avgScore,
        clinicalEfficacyRate: totalDiagnoses > 0 ? `${Math.round((promptsImproved / totalDiagnoses) * 100)}%` : '0%',
        activePatients: totalDiagnoses,
        distribution: {
          optimal: { count: optimal, pct: totalDiagnoses > 0 ? Math.round((optimal / totalDiagnoses) * 100) : 0 },
          healthy: { count: healthy, pct: totalDiagnoses > 0 ? Math.round((healthy / totalDiagnoses) * 100) : 0 },
          fair: { count: fair, pct: totalDiagnoses > 0 ? Math.round((fair / totalDiagnoses) * 100) : 0 },
          critical: { count: critical, pct: totalDiagnoses > 0 ? Math.round((critical / totalDiagnoses) * 100) : 0 },
        },
        recentSamples: diagnoses.slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete diagnosis record
// @route   DELETE /api/diagnosis/:id
// @access  Protected
export const deleteDiagnosis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findByPk(id);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis record not found.',
      });
    }

    if (diagnosis.userId && req.user && diagnosis.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot purge another practitioner’s record.',
      });
    }

    await diagnosis.destroy();

    res.json({
      success: true,
      message: `Diagnosis record #${id} purged successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  diagnosePrompt,
  getDiagnosisById,
  listDiagnoses,
  getLabStats,
  deleteDiagnosis,
};
