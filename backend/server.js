const app = require('./src/app');
const connectDb = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  connectDb().catch((error) => {
    console.error('Database connection failed, continuing without DB:', error.message || error);
  });
  // bootstrap admin user from environment variables if provided
  try {
    const bootstrapAdmin = require('./src/utils/bootstrapAdmin');
    // call but don't await blocking logs (it's async)
    bootstrapAdmin().catch((e) => console.error('bootstrapAdmin failed', e));
  } catch (err) {
    // ignore if file missing
  }

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});