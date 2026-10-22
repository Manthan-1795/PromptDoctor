import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  diagnosisId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recommendation: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  actionCategory: {
    type: DataTypes.STRING(100),
    defaultValue: 'Structure',
  },
  priority: {
    type: DataTypes.STRING(50),
    defaultValue: 'High',
  },
}, {
  tableName: 'prescriptions',
  timestamps: true,
});

export default Prescription;
