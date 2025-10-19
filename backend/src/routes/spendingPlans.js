// Spending Plans Routes (NEW FEATURE)
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM spending_plans WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ spendingPlans: result.rows });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { plan_name, planned_amount, from_account_id } = req.body;
        const result = await pool.query(
            `INSERT INTO spending_plans (user_id, plan_name, planned_amount, from_account_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, plan_name, planned_amount, from_account_id]
        );
        res.status(201).json({ spendingPlan: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// What-if calculator
router.post('/calculate', async (req, res, next) => {
    try {
        const { amount } = req.body;
        
        // Get user's safe-to-spend (simplified)
        const accounts = await pool.query(
            'SELECT SUM(current_balance) as total FROM accounts WHERE user_id = $1',
            [req.user.id]
        );
        
        const current = parseFloat(accounts.rows[0]?.total || 0);
        const afterPurchase = current - amount;
        
        res.json({
            currentSafeToSpend: current,
            afterPurchase,
            recommendation: afterPurchase < 100 ? 'Wait for next income' : 'Safe to spend'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

