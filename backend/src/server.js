const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const { initializeScheduledJobs } = require('./jobs/scheduledJobs');

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Personal Finance Manager API is running',
        version: '1.0.0-dev',
        timestamp: new Date().toISOString()
    });
});

// API Routes
const authRoutes = require('./routes/auth');
const paymentsRoutes = require('./routes/payments');
const incomeRoutes = require('./routes/income');
const accountsRoutes = require('./routes/accounts');
const contactsRoutes = require('./routes/contacts');
const categoriesRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const spendingPlansRoutes = require('./routes/spendingPlans');
const preferencesRoutes = require('./routes/preferences');
const calendarRoutes = require('./routes/calendar');
const searchRoutes = require('./routes/search');

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/spending-plans', spendingPlansRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/search', searchRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedPath: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 Personal Finance Manager API');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
    console.log('\n✨ Ready to accept requests!\n');

    // Initialize scheduled jobs
    initializeScheduledJobs();
});

module.exports = app;
