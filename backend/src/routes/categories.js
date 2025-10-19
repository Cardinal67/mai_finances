// Categories Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1 AND is_active = true ORDER BY sort_order, name',
            [req.user.id]
        );
        res.json({ categories: result.rows });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, color_code, parent_category_id } = req.body;
        const result = await pool.query(
            `INSERT INTO categories (user_id, name, color_code, parent_category_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, name, color_code || '#3B82F6', parent_category_id]
        );
        res.status(201).json({ category: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

