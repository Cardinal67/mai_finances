// Health check routes
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const { Client } = require('pg');
const http = require('http');

router.use(authenticateAdmin);

// Check backend health
async function checkBackendHealth() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3001/health', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: 'ok', data: parsed, responseTime: Date.now() });
                } catch (e) {
                    resolve({ status: 'error', error: 'Invalid response' });
                }
            });
        });
        req.on('error', (error) => {
            resolve({ status: 'error', error: error.message });
        });
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({ status: 'timeout', error: 'Request timeout' });
        });
    });
}

// Check frontend health
async function checkFrontendHealth() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/', (res) => {
            resolve({ status: res.statusCode === 200 ? 'ok' : 'error', statusCode: res.statusCode });
        });
        req.on('error', (error) => {
            resolve({ status: 'error', error: error.message });
        });
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({ status: 'timeout', error: 'Request timeout' });
        });
    });
}

// Check database health
async function checkDatabaseHealth() {
    try {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        const startTime = Date.now();
        await client.connect();
        await client.query('SELECT 1');
        const responseTime = Date.now() - startTime;
        await client.end();
        return { status: 'ok', responseTime };
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}

// Get all health status
router.get('/all', async (req, res) => {
    const [backend, frontend, database] = await Promise.all([
        checkBackendHealth(),
        checkFrontendHealth(),
        checkDatabaseHealth()
    ]);

    res.json({
        backend,
        frontend,
        database,
        timestamp: new Date().toISOString()
    });
});

// Get backend health
router.get('/backend', async (req, res) => {
    const health = await checkBackendHealth();
    res.json(health);
});

// Get frontend health
router.get('/frontend', async (req, res) => {
    const health = await checkFrontendHealth();
    res.json(health);
});

// Get database health
router.get('/database', async (req, res) => {
    const health = await checkDatabaseHealth();
    res.json(health);
});

module.exports = router;

