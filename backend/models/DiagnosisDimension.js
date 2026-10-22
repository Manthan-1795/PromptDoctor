import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const DiagnosisDimension = sequelize.define('DiagnosisDimension', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  diagnosisId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dimensionName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'moderate',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recommendation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'diagnosis_dimensions',
  timestamps: true,
});

export default DiagnosisDimension;
