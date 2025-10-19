// Calendar Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const result = await pool.query(
            `SELECT * FROM payments WHERE user_id = $1 
             AND EXTRACT(MONTH FROM current_due_date) = $2 
             AND EXTRACT(YEAR FROM current_due_date) = $3
             ORDER BY current_due_date`,
            [req.user.id, month, year]
        );
        res.json({ events: result.rows });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

