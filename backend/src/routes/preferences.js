// Preferences Routes (NEW FEATURE)
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [req.user.id]
        );
        res.json({ preferences: result.rows[0] || {} });
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { timezone, date_range_preference, safety_buffer_amount, theme, display_density } = req.body;
        
        const result = await pool.query(
            `INSERT INTO user_preferences (user_id, timezone, date_range_preference, safety_buffer_amount, theme, display_density)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id) DO UPDATE SET
             timezone = COALESCE($2, user_preferences.timezone),
             date_range_preference = COALESCE($3, user_preferences.date_range_preference),
             safety_buffer_amount = COALESCE($4, user_preferences.safety_buffer_amount),
             theme = COALESCE($5, user_preferences.theme),
             display_density = COALESCE($6, user_preferences.display_density),
             updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [req.user.id, timezone, date_range_preference, safety_buffer_amount, theme, display_density]
        );
        
        res.json({ preferences: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

