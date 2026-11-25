require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');
const { seed } = require('./seed');
const { resolvedJava, resolvedJavac } = require('./services/executor');

const authRoutes = require('./routes/auth');
const executeRoutes = require('./routes/execute');
const programRoutes = require('./routes/programs');
const practiceRoutes = require('./routes/practice');
const aiRoutes = require('./routes/ai');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const musicRoutes = require('./routes/music');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health' && req.path !== '/api/sync/events') {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Ensure audio uploads directory exists and mount static streaming
const fs = require('fs');
const musicUploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads', 'music')
  : path.join(__dirname, 'uploads/music');
if (!fs.existsSync(musicUploadDir)) {
  fs.mkdirSync(musicUploadDir, { recursive: true });
}
app.use('/api/music/stream', express.static(musicUploadDir, {
  setHeaders: (res, path) => {
    res.set('Accept-Ranges', 'bytes');
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'OJT Code Playground API',
    timestamp: new Date().toISOString(),
    java: {
      java: resolvedJava,
      javac: resolvedJavac
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/sync', syncRoutes);

// Static frontend serving if client/dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Ensure database & seed are initialized before handling API requests
let dbInitPromise = null;
async function ensureDbReady() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await initDB();
      await seed();
    })();
  }
  return dbInitPromise;
}

// Middleware to ensure DB is ready on serverless cold starts
app.use(async (req, res, next) => {
  try {
    await ensureDbReady();
    next();
  } catch (err) {
    next(err);
  }
});

// Start standalone server when running directly
async function startServer() {
  try {
    await ensureDbReady();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 OJT Code Playground API running on http://localhost:${PORT}`);
      console.log(`☕ Java detected: ${resolvedJava}`);
      console.log(`📚 Database & seed initialized successfully.`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
