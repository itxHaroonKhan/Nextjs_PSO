const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ AUTH ROUTE (ALWAYS TOP)
app.use('/api/auth', require('./routes/auth'));

// ✅ PROTECTED ROUTES
app.use('/api/products', require('./routes/products'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/menu', require('./routes/menu'));

// ROOT
app.get('/', (req, res) => {
  res.json({
    message: 'Elites POS System API',
    version: '1.0.0',
    status: 'Running'
  });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler - Undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;