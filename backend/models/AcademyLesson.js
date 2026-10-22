import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const AcademyLesson = sequelize.define('AcademyLesson', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  lessonNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(80),
    defaultValue: 'Fundamentals',
  },
  duration: {
    type: DataTypes.STRING(50),
    defaultValue: '10 mins',
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  explanation: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  example: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  badPrompt: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  improvedPrompt: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  quiz: {
    type: DataTypes.JSON,
    allowNull: false, // { question, options: [], correct: 0, explanation: "" }
  },
}, {
  tableName: 'academy_lessons',
  timestamps: true,
});

export default AcademyLesson;
