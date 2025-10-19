// Search Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const { q } = req.query;
        const searchTerm = `%${q}%`;
        
        const payments = await pool.query(
            `SELECT * FROM payments WHERE user_id = $1 AND description ILIKE $2 LIMIT 20`,
            [req.user.id, searchTerm]
        );
        
        const contacts = await pool.query(
            `SELECT * FROM contacts WHERE user_id = $1 AND current_name ILIKE $2 LIMIT 10`,
            [req.user.id, searchTerm]
        );
        
        res.json({ payments: payments.rows, contacts: contacts.rows });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

