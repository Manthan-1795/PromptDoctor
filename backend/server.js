import app from './app.js';
import { connectDatabase } from './config/database.js';
import seedDatabase from './utils/seedData.js';
// Import models to ensure associations and tables are registered
import './models/index.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('\n======================================================');
  console.log('🩺 PROMPT DOCTOR: "Your prompt is sick. Let\'s fix it."');
  console.log('======================================================');

  // Verify and sync MySQL database
  const isDbConnected = await connectDatabase();

  if (isDbConnected) {
    // Seed standard achievements and 10 Academy lessons
    await seedDatabase();
  } else {
    console.warn('⚠️ [PROMPT DOCTOR] Server starting in limited mode without database persistence.');
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 [PROMPT DOCTOR LAB] API active on: http://localhost:${PORT}`);
    console.log(`🩺 Health status check: http://localhost:${PORT}/api/health`);
    console.log(`🔬 Ready to diagnose and cure sick prompts.\n`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n🛑 [PROMPT DOCTOR LAB] Shutting down laboratory servers cleanly...');
    server.close(() => {
      console.log('Laboratory servers offline.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
