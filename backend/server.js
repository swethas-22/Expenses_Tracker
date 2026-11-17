const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const insightRoutes = require('./routes/insights');
const challengeRoutes = require('./routes/challenges');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static receipt uploads folder per NFR-S9
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint per NFR-R6
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    app: 'SpendQuest API'
  });
});

// Mount modular API routers
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/challenges', challengeRoutes);

// Global Error Handler per NFR-R1 (Clean JSON, never expose internal stack trace)
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    detail: err.message || 'An unexpected server error occurred.',
    error_id: 'err-' + Date.now()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.originalUrl} not found.` });
});

app.listen(PORT, () => {
  console.log(`✨ SpendQuest backend running on port ${PORT}`);
  console.log(`🔗 API Documentation & Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
