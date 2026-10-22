import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Symptom = sequelize.define('Symptom', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  diagnosisId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  severity: {
    type: DataTypes.STRING(50), // critical, high, medium, low
    allowNull: false,
    defaultValue: 'medium',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recommendation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'symptoms',
  timestamps: true,
});

export default Symptom;
