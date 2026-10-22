import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const PromptDNA = sequelize.define('PromptDNA', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  diagnosisId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  roleStrength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  contextStrength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  instructionStrength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  constraintStrength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  outputStructureStrength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  specificityStrength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'prompt_dna',
  timestamps: true,
});

export default PromptDNA;
