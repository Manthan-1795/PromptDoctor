import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbName = process.env.DB_NAME || 'prompt_doctor';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'manager';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: Number(dbPort),
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? (msg) => {
    // Only log essential queries or silence verbose SQL in terminal
    if (msg.includes('Executing (default): SELECT 1+1')) return;
  } : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('🧪 [PROMPT DOCTOR DB] Connected successfully to MySQL database:', `mysql://${dbUser}@${dbHost}:${dbPort}/${dbName}`);
    
    // In development, automatically create/update tables
    await sequelize.sync({ alter: true });
    console.log('📋 [PROMPT DOCTOR DB] All models synchronized and database schema verified.');
    return true;
  } catch (error) {
    console.error('❌ [PROMPT DOCTOR DB] MySQL connection failure!');
    console.error('   Error details:', error.message);
    console.error(`   Host: ${dbHost}:${dbPort} | DB: ${dbName} | User: ${dbUser}`);
    console.error('   Please check that the MySQL service is active and the password matches.');
    return false;
  }
};

export default sequelize;
