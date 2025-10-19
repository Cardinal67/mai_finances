// Accounts Routes
// Created: 2025-10-20T00:19:00Z

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { encrypt, decrypt } = require('../config/encryption');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, account_name, account_type, institution_name, current_balance, is_active FROM accounts WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ accounts: result.rows });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { account_name, account_type, current_balance } = req.body;
        const result = await pool.query(
            `INSERT INTO accounts (user_id, account_name, account_type, current_balance) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, account_name, account_type, current_balance || 0]
        );
        res.status(201).json({ account: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

