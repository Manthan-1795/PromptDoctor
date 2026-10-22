import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  achievementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unlockedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'user_achievements',
  timestamps: true,
});

export default UserAchievement;
