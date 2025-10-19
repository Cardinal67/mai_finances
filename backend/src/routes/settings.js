// Settings Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT settings FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json({ settings: result.rows[0]?.settings || {} });
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'UPDATE users SET settings = $1 WHERE id = $2 RETURNING settings',
            [JSON.stringify(req.body), req.user.id]
        );
        res.json({ settings: result.rows[0].settings });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

