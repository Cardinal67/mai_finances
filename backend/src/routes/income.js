// Income Routes (NEW FEATURE)
// Created: 2025-10-20T00:18:00Z

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get all income streams
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM income_streams WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ incomeStreams: result.rows });
    } catch (error) {
        next(error);
    }
});

// Create income stream
router.post('/', async (req, res, next) => {
    try {
        const { source_name, source_type, amount, to_account_id, is_recurring } = req.body;
        
        const result = await pool.query(
            `INSERT INTO income_streams (user_id, source_name, source_type, amount, to_account_id, is_recurring)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.id, source_name, source_type, amount, to_account_id, is_recurring]
        );
        
        res.status(201).json({ incomeStream: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// Mark income as received
router.post('/:id/receive', async (req, res, next) => {
    try {
        const { amount, to_account_id } = req.body;
        
        const result = await pool.query(
            `INSERT INTO income_transactions (income_stream_id, amount, to_account_id)
             VALUES ($1, $2, $3) RETURNING *`,
            [req.params.id, amount, to_account_id]
        );
        
        res.status(201).json({ transaction: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

