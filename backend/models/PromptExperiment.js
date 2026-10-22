import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const PromptExperiment = sequelize.define('PromptExperiment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  diagnosisId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  strategy: {
    type: DataTypes.STRING(80),
    allowNull: false, // Role Prompting, Few-Shot, Context Addition, Constraints, Structured Output, Persona, Tone, Target Audience
  },
  originalPrompt: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  modifiedPrompt: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  scoreBefore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
  },
  scoreAfter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 80,
  },
  scoreDelta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
  improved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'prompt_experiments',
  timestamps: true,
});

export default PromptExperiment;
