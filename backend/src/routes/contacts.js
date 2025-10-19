// Contacts Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM contacts WHERE user_id = $1 AND status = $2 ORDER BY current_name',
            [req.user.id, 'active']
        );
        res.json({ contacts: result.rows });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { current_name, contact_type, email, phone } = req.body;
        const result = await pool.query(
            `INSERT INTO contacts (user_id, current_name, contact_type, email, phone) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, current_name, contact_type, email, phone]
        );
        res.status(201).json({ contact: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

