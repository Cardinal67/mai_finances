// Payments Routes  
// Created: 2025-10-20T00:17:00Z

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all payments
router.get('/', async (req, res, next) => {
    try {
        const { status, type, contact_id, limit = 50, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM payments WHERE user_id = $1';
        const params = [req.user.id];
        
        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }
        
        query += ` ORDER BY current_due_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        res.json({ payments: result.rows, total: result.rowCount });
    } catch (error) {
        next(error);
    }
});

// Create payment
router.post('/', async (req, res, next) => {
    try {
        const { contact_id, description, payment_type, original_amount, current_due_date } = req.body;
        
        const result = await pool.query(
            `INSERT INTO payments (user_id, contact_id, description, payment_type, original_amount, original_due_date, current_due_date)
             VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
            [req.user.id, contact_id, description, payment_type, original_amount, current_due_date]
        );
        
        res.status(201).json({ payment: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// Get payment by ID
router.get('/:id', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json({ payment: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// Update payment
router.put('/:id', async (req, res, next) => {
    try {
        const { description, original_amount, current_due_date, status } = req.body;
        
        const result = await pool.query(
            `UPDATE payments SET description = COALESCE($1, description), 
             original_amount = COALESCE($2, original_amount),
             current_due_date = COALESCE($3, current_due_date),
             status = COALESCE($4, status),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 AND user_id = $6 RETURNING *`,
            [description, original_amount, current_due_date, status, req.params.id, req.user.id]
        );
        
        res.json({ payment: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// Delete payment
router.delete('/:id', async (req, res, next) => {
    try {
        await pool.query(
            'DELETE FROM payments WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        
        res.json({ message: 'Payment deleted' });
    } catch (error) {
        next(error);
    }
});

// Record payment transaction
router.post('/:id/transactions', async (req, res, next) => {
    try {
        const { amount, payment_method, from_account_id } = req.body;
        
        const result = await pool.query(
            `INSERT INTO payment_transactions (payment_id, amount, payment_method, from_account_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.params.id, amount, payment_method, from_account_id]
        );
        
        // Update payment status if fully paid
        const payment = await pool.query('SELECT original_amount FROM payments WHERE id = $1', [req.params.id]);
        const totalPaid = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payment_transactions WHERE payment_id = $1',
            [req.params.id]
        );
        
        if (totalPaid.rows[0].total >= payment.rows[0].original_amount) {
            await pool.query(
                `UPDATE payments SET status = 'paid', paid_date = CURRENT_TIMESTAMP WHERE id = $1`,
                [req.params.id]
            );
        } else {
            await pool.query(
                `UPDATE payments SET status = 'partially_paid' WHERE id = $1`,
                [req.params.id]
            );
        }
        
        res.status(201).json({ transaction: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

