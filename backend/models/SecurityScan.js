import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const SecurityScan = sequelize.define('SecurityScan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  prompt: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  securityScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 85,
  },
  riskLevel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'safe', // safe, low, medium, high, critical
  },
  detectedIssues: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  recommendations: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
}, {
  tableName: 'security_scans',
  timestamps: true,
});

export default SecurityScan;
