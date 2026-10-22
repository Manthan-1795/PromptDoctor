import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import diagnosisRoutes from './routes/diagnosisRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import userRoutes from './routes/userRoutes.js';
import experimentRoutes from './routes/experimentRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import academyRoutes from './routes/academyRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PROMPT DOCTOR Laboratory API',
    tagline: "Your prompt is sick. Let's fix it.",
    version: '1.0.0',
    llmProvider: 'Groq',
    groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/diagnoses', diagnosisRoutes); // Exact requirement 5: GET /api/diagnoses
app.use('/api/user', userRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
