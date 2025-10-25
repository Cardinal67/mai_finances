// Server control routes
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const processManager = require('../services/processManager');

// All routes require admin authentication
router.use(authenticateAdmin);

// Get server status
router.get('/status', (req, res) => {
    res.json(processManager.getStatus());
});

// Start backend
router.post('/backend/start', async (req, res) => {
    try {
        const result = await processManager.startBackend();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Stop backend
router.post('/backend/stop', async (req, res) => {
    try {
        const result = await processManager.stopBackend();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Restart backend
router.post('/backend/restart', async (req, res) => {
    try {
        const result = await processManager.restartBackend();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start frontend
router.post('/frontend/start', async (req, res) => {
    try {
        const result = await processManager.startFrontend();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Stop frontend
router.post('/frontend/stop', async (req, res) => {
    try {
        const result = await processManager.stopFrontend();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Restart frontend
router.post('/frontend/restart', async (req, res) => {
    try {
        const result = await processManager.restartFrontend();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get logs
router.get('/:server/logs', (req, res) => {
    const { server } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    if (!['backend', 'frontend'].includes(server)) {
        return res.status(400).json({ error: 'Invalid server name' });
    }

    const logs = processManager.getLogs(server, limit);
    res.json({ logs });
});

// Clear logs
router.delete('/:server/logs', (req, res) => {
    const { server } = req.params;

    if (!['backend', 'frontend'].includes(server)) {
        return res.status(400).json({ error: 'Invalid server name' });
    }

    processManager.clearLogs(server);
    res.json({ success: true, message: `${server} logs cleared` });
});

module.exports = router;

