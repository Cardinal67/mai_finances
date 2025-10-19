// Dashboard Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/summary', async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Get upcoming bills
        const bills = await pool.query(
            `SELECT * FROM payments WHERE user_id = $1 AND status != 'paid' 
             AND current_due_date >= CURRENT_DATE ORDER BY current_due_date LIMIT 10`,
            [userId]
        );
        
        // Get upcoming income  
        const income = await pool.query(
            `SELECT * FROM income_streams WHERE user_id = $1 AND is_active = true 
             AND next_expected_date >= CURRENT_DATE ORDER BY next_expected_date LIMIT 5`,
            [userId]
        );
        
        // Get accounts
        const accounts = await pool.query(
            'SELECT * FROM accounts WHERE user_id = $1 AND is_active = true',
            [userId]
        );
        
        // Calculate safe to spend (simplified)
        let totalBalance = 0;
        let reservedForBills = 0;
        
        accounts.rows.forEach(acc => {
            totalBalance += parseFloat(acc.current_balance || 0);
        });
        
        bills.rows.forEach(bill => {
            if (bill.status === 'unpaid') {
                reservedForBills += parseFloat(bill.original_amount || 0);
            }
        });
        
        const safeToSpend = totalBalance - reservedForBills - 100; // -100 safety buffer
        
        res.json({
            upcomingBills: bills.rows,
            upcomingIncome: income.rows,
            accounts: accounts.rows,
            safeToSpend: Math.max(0, safeToSpend),
            totalBalance,
            reservedForBills
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

