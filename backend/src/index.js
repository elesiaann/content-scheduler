require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const platformsRoutes = require('./routes/platforms');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/platforms', platformsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// On Vercel: serve the compiled Vite frontend for all non-API routes
// (Vercel routes all requests through this function)
if (process.env.VERCEL) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  const fs = require('fs');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large (max 100MB)' });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server only outside Vercel (serverless exports the app directly)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startScheduler();
  });
}
// On Vercel serverless, the function sleeps between requests so a cron
// scheduler won't fire reliably — skip it.

module.exports = app;
