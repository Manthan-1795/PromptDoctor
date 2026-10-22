import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const DiagnosisChange = sequelize.define('DiagnosisChange', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  diagnosisId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(50), // 'added', 'removed', 'modified', 'structural'
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'diagnosis_changes',
  timestamps: true,
});

export default DiagnosisChange;
