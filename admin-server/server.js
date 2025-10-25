// Admin Server - Main Entry Point
require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3003"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3003"],
    credentials: true
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

// Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/servers', serverRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/health', healthRoutes);

// Socket.IO connection
const processManager = require('./services/processManager');

// Set IO in process manager for real-time updates
processManager.setIO(io);

io.on('connection', (socket) => {
    console.log('📡 Admin client connected:', socket.id);

    // Send current server status
    socket.emit('server-status', processManager.getStatus());

    // Request server status updates
    socket.on('request-status', () => {
        socket.emit('server-status', processManager.getStatus());
    });

    socket.on('disconnect', () => {
        console.log('📡 Admin client disconnected:', socket.id);
    });
});

// Make io available to routes
app.set('io', io);

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'admin-dashboard',
        port: process.env.ADMIN_PORT || 3002,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.ADMIN_PORT || 3002;

server.listen(PORT, () => {
    console.log('');
    console.log('🎛️  Mai Finances Admin Dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🔗 Dashboard: http://localhost:${PORT}`);
    console.log(`🔐 Admin endpoint: http://localhost:${PORT}/api/admin`);
    console.log('✨ Ready to manage your servers!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⏸️  SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Admin server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };

