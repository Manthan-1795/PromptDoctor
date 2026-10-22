import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const UserLessonProgress = sequelize.define('UserLessonProgress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  quizScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'user_lesson_progress',
  timestamps: true,
});

export default UserLessonProgress;
