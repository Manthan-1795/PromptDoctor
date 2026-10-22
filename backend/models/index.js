import User from './User.js';
import Diagnosis from './Diagnosis.js';
import DiagnosisDimension from './DiagnosisDimension.js';
import Symptom from './Symptom.js';
import Prescription from './Prescription.js';
import DiagnosisChange from './DiagnosisChange.js';
import PromptDNA from './PromptDNA.js';
import PromptExperiment from './PromptExperiment.js';
import SecurityScan from './SecurityScan.js';
import Achievement from './Achievement.js';
import UserAchievement from './UserAchievement.js';
import AcademyLesson from './AcademyLesson.js';
import UserLessonProgress from './UserLessonProgress.js';

// User <-> Diagnosis
User.hasMany(Diagnosis, {
  foreignKey: 'userId',
  as: 'diagnoses',
  onDelete: 'SET NULL',
});
Diagnosis.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Diagnosis <-> DiagnosisDimension
Diagnosis.hasMany(DiagnosisDimension, {
  foreignKey: 'diagnosisId',
  as: 'dimensions',
  onDelete: 'CASCADE',
});
DiagnosisDimension.belongsTo(Diagnosis, {
  foreignKey: 'diagnosisId',
  as: 'diagnosis',
});

// Diagnosis <-> Symptom
Diagnosis.hasMany(Symptom, {
  foreignKey: 'diagnosisId',
  as: 'symptoms',
  onDelete: 'CASCADE',
});
Symptom.belongsTo(Diagnosis, {
  foreignKey: 'diagnosisId',
  as: 'diagnosis',
});

// Diagnosis <-> Prescription
Diagnosis.hasMany(Prescription, {
  foreignKey: 'diagnosisId',
  as: 'prescriptions',
  onDelete: 'CASCADE',
});
Prescription.belongsTo(Diagnosis, {
  foreignKey: 'diagnosisId',
  as: 'diagnosis',
});

// Diagnosis <-> DiagnosisChange
Diagnosis.hasMany(DiagnosisChange, {
  foreignKey: 'diagnosisId',
  as: 'changes',
  onDelete: 'CASCADE',
});
DiagnosisChange.belongsTo(Diagnosis, {
  foreignKey: 'diagnosisId',
  as: 'diagnosis',
});

// Diagnosis <-> PromptDNA
Diagnosis.hasOne(PromptDNA, {
  foreignKey: 'diagnosisId',
  as: 'dna',
  onDelete: 'CASCADE',
});
PromptDNA.belongsTo(Diagnosis, {
  foreignKey: 'diagnosisId',
  as: 'diagnosis',
});

// User <-> PromptExperiment
User.hasMany(PromptExperiment, {
  foreignKey: 'userId',
  as: 'experiments',
  onDelete: 'SET NULL',
});
PromptExperiment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Diagnosis <-> PromptExperiment
Diagnosis.hasMany(PromptExperiment, {
  foreignKey: 'diagnosisId',
  as: 'experiments',
  onDelete: 'SET NULL',
});
PromptExperiment.belongsTo(Diagnosis, {
  foreignKey: 'diagnosisId',
  as: 'diagnosis',
});

// User <-> SecurityScan
User.hasMany(SecurityScan, {
  foreignKey: 'userId',
  as: 'securityScans',
  onDelete: 'SET NULL',
});
SecurityScan.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// User <-> Achievement (many-to-many through UserAchievement)
User.belongsToMany(Achievement, {
  through: UserAchievement,
  foreignKey: 'userId',
  as: 'achievements',
});
Achievement.belongsToMany(User, {
  through: UserAchievement,
  foreignKey: 'achievementId',
  as: 'users',
});
User.hasMany(UserAchievement, {
  foreignKey: 'userId',
  as: 'userAchievements',
});
UserAchievement.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
Achievement.hasMany(UserAchievement, {
  foreignKey: 'achievementId',
  as: 'achievementRecords',
});
UserAchievement.belongsTo(Achievement, {
  foreignKey: 'achievementId',
  as: 'achievement',
});

// User <-> AcademyLesson (many-to-many through UserLessonProgress)
User.belongsToMany(AcademyLesson, {
  through: UserLessonProgress,
  foreignKey: 'userId',
  as: 'lessons',
});
AcademyLesson.belongsToMany(User, {
  through: UserLessonProgress,
  foreignKey: 'lessonId',
  as: 'users',
});
User.hasMany(UserLessonProgress, {
  foreignKey: 'userId',
  as: 'lessonProgress',
});
UserLessonProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
AcademyLesson.hasMany(UserLessonProgress, {
  foreignKey: 'lessonId',
  as: 'lessonProgressRecords',
});
UserLessonProgress.belongsTo(AcademyLesson, {
  foreignKey: 'lessonId',
  as: 'lesson',
});

export {
  User,
  Diagnosis,
  DiagnosisDimension,
  Symptom,
  Prescription,
  DiagnosisChange,
  PromptDNA,
  PromptExperiment,
  SecurityScan,
  Achievement,
  UserAchievement,
  AcademyLesson,
  UserLessonProgress,
};

export default {
  User,
  Diagnosis,
  DiagnosisDimension,
  Symptom,
  Prescription,
  DiagnosisChange,
  PromptDNA,
  PromptExperiment,
  SecurityScan,
  Achievement,
  UserAchievement,
  AcademyLesson,
  UserLessonProgress,
};
