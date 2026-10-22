import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'Diagnostics',
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'Award',
  },
  requiredCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'achievements',
  timestamps: true,
});

export default Achievement;
