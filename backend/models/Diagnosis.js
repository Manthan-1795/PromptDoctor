import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Diagnosis = sequelize.define('Diagnosis', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  originalPrompt: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  overallScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'sick', // critical, sick, fair, healthy, optimal
  },
  improvedPrompt: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  modelTarget: {
    type: DataTypes.STRING(80),
    defaultValue: 'General LLM',
  },
  title: {
    type: DataTypes.STRING(255),
    defaultValue: 'Untitled Prompt Diagnosis',
  },
}, {
  tableName: 'diagnoses',
  timestamps: true,
});

export default Diagnosis;
