const db = require('../config/database');
const moment = require('moment-timezone');

/**
 * Get all payments for the authenticated user
 * Supports filtering by status, payment_type, date range, and contact
 */
async function getAllPayments(req, res) {
    const userId = req.user.id;
    const {
        status,
        payment_type,
        start_date,
        end_date,
        contact_id,
        search,
        limit = 50,
        offset = 0
    } = req.query;

    try {
        let query = `
            SELECT p.*, 
                   c.current_name as contact_name,
                   (SELECT COUNT(*) FROM PAYMENT_TRANSACTIONS pt WHERE pt.payment_id = p.id) as transaction_count,
                   (SELECT SUM(pt.amount) FROM PAYMENT_TRANSACTIONS pt WHERE pt.payment_id = p.id) as total_paid
             FROM PAYMENTS p
             LEFT JOIN CONTACTS c ON p.contact_id = c.id
             WHERE p.user_id = $1
        `;
        const params = [userId];
        let paramIndex = 2;

        // Apply filters
        if (status) {
            query += ` AND p.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (payment_type) {
            query += ` AND p.payment_type = $${paramIndex}`;
            params.push(payment_type);
            paramIndex++;
        }

        if (start_date) {
            query += ` AND p.current_due_date >= $${paramIndex}`;
            params.push(start_date);
            paramIndex++;
        }

        if (end_date) {
            query += ` AND p.current_due_date <= $${paramIndex}`;
            params.push(end_date);
            paramIndex++;
        }

        if (contact_id) {
            query += ` AND p.contact_id = $${paramIndex}`;
            params.push(contact_id);
            paramIndex++;
        }

        if (search) {
            query += ` AND (p.description ILIKE $${paramIndex} OR c.current_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY p.current_due_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) FROM PAYMENTS WHERE user_id = $1`;
        const countResult = await db.query(countQuery, [userId]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payments'
        });
    }
}

/**
 * Get a single payment by ID
 */
async function getPaymentById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT p.*, 
                    c.current_name as contact_name,
                    c.email as contact_email,
                    c.phone as contact_phone,
                    (SELECT json_agg(cat.*) FROM (
                        SELECT cat.id, cat.name, cat.color_code 
                        FROM CATEGORIES cat
                        JOIN PAYMENT_CATEGORIES pc ON cat.id = pc.category_id
                        WHERE pc.payment_id = p.id
                    ) cat) as categories
             FROM PAYMENTS p
             LEFT JOIN CONTACTS c ON p.contact_id = c.id
             WHERE p.id = $1 AND p.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get payment by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment'
        });
    }
}

/**
 * Create a new payment
 */
async function createPayment(req, res) {
    const userId = req.user.id;
    const {
        contact_id,
        expense_name,
        recipient,
        description,
        original_amount,
        currency = 'USD',
        due_date,
        payment_type,
        payment_method,
        is_recurring = false,
        recurrence_pattern,
        recurrence_interval,
        recurrence_end_date,
        notes,
        priority = 0,
        category_ids = []
    } = req.body;

    // Validate: Must have either expense_name or description
    if (!expense_name && !description) {
        return res.status(400).json({
            success: false,
            message: 'Expense name or description is required'
        });
    }

    // Validate: Must have either contact_id or recipient
    if (!contact_id && !recipient) {
        return res.status(400).json({
            success: false,
            message: 'Either contact or recipient is required'
        });
    }

    try {
        // Verify contact belongs to user (if provided)
        if (contact_id) {
            const contactCheck = await db.query(
                'SELECT id FROM CONTACTS WHERE id = $1 AND user_id = $2',
                [contact_id, userId]
            );

            if (contactCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            }
        }

        // Create payment
        const result = await db.query(
            `INSERT INTO PAYMENTS (
                user_id, contact_id, expense_name, recipient, description, 
                original_amount, current_balance, currency, due_date, current_due_date, 
                payment_type, payment_method, status, is_recurring, recurrence_pattern, 
                recurrence_interval, recurrence_end_date, notes, priority, 
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $8, $9, $10, 'unpaid', 
                      $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                userId, contact_id, expense_name, recipient, description,
                original_amount, currency, due_date, payment_type, payment_method,
                is_recurring, recurrence_pattern, recurrence_interval,
                recurrence_end_date, notes, priority
            ]
        );

        const newPayment = result.rows[0];

        // Add categories if provided
        if (category_ids.length > 0) {
            for (const categoryId of category_ids) {
                await db.query(
                    'INSERT INTO PAYMENT_CATEGORIES (payment_id, category_id) VALUES ($1, $2)',
                    [newPayment.id, categoryId]
                );
            }
        }

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'payment_created', 'payment', $2, $3)`,
            [userId, newPayment.id, JSON.stringify(newPayment)]
        );

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: newPayment
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment'
        });
    }
}

/**
 * Update an existing payment
 */
async function updatePayment(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    try {
        // Get current payment data
        const currentData = await db.query(
            'SELECT * FROM PAYMENTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const current = currentData.rows[0];

        // Build update query dynamically
        const allowedFields = [
            'description', 'original_amount', 'current_balance', 'currency',
            'due_date', 'current_due_date', 'status', 'is_recurring',
            'recurrence_pattern', 'recurrence_interval', 'recurrence_end_date',
            'notes', 'priority'
        ];

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updateFields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id, userId);

        const query = `
            UPDATE PAYMENTS 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING *
        `;

        const result = await db.query(query, values);

        // Log changes to audit trail
        for (const [key, value] of Object.entries(updates)) {
            if (current[key] !== value) {
                await db.query(
                    `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, 
                                           field_changed, old_value, new_value)
                     VALUES ($1, 'payment_updated', 'payment', $2, $3, $4, $5)`,
                    [userId, id, key, String(current[key]), String(value)]
                );
            }
        }

        res.json({
            success: true,
            message: 'Payment updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment'
        });
    }
}

/**
 * Delete a payment
 */
async function deletePayment(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check if payment exists
        const check = await db.query(
            'SELECT * FROM PAYMENTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Delete payment (cascade will handle related records)
        await db.query('DELETE FROM PAYMENTS WHERE id = $1', [id]);

        // Log deletion
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, old_value)
             VALUES ($1, 'payment_deleted', 'payment', $2, $3)`,
            [userId, id, JSON.stringify(check.rows[0])]
        );

        res.json({
            success: true,
            message: 'Payment deleted successfully'
        });
    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting payment'
        });
    }
}

/**
 * Record a payment transaction (partial or full)
 */
async function recordTransaction(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const {
        amount,
        payment_method,
        from_account_id,
        to_account_id,
        transaction_reference,
        confirmation_number,
        notes,
        transaction_date,
        expected_clear_date
    } = req.body;

    try {
        // Get payment details
        const paymentResult = await db.query(
            'SELECT * FROM PAYMENTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const payment = paymentResult.rows[0];

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Transaction amount must be greater than 0'
            });
        }

        // Record transaction
        const transactionResult = await db.query(
            `INSERT INTO PAYMENT_TRANSACTIONS (
                payment_id, user_id, transaction_date, amount, payment_method,
                from_account_id, to_account_id, transaction_reference,
                confirmation_number, notes, expected_clear_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'completed')
            RETURNING *`,
            [
                id, userId, transaction_date || new Date(), amount, payment_method,
                from_account_id, to_account_id, transaction_reference,
                confirmation_number, notes, expected_clear_date
            ]
        );

        // Update payment balance and status
        const newBalance = parseFloat(payment.current_balance) - parseFloat(amount);
        let newStatus = payment.status;

        if (newBalance <= 0) {
            newStatus = 'paid_in_full';
        } else if (newBalance < payment.original_amount) {
            newStatus = 'partially_paid';
        }

        await db.query(
            `UPDATE PAYMENTS 
             SET current_balance = $1, status = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [Math.max(0, newBalance), newStatus, id]
        );

        // Update account balance if from_account_id provided
        if (from_account_id && payment.payment_type === 'owed_by_me') {
            await db.query(
                `UPDATE ACCOUNTS 
                 SET current_balance = current_balance - $1,
                     available_balance = available_balance - $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2 AND user_id = $3`,
                [amount, from_account_id, userId]
            );
        }

        // Update account balance if to_account_id provided
        if (to_account_id && payment.payment_type === 'owed_to_me') {
            await db.query(
                `UPDATE ACCOUNTS 
                 SET current_balance = current_balance + $1,
                     available_balance = available_balance + $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2 AND user_id = $3`,
                [amount, to_account_id, userId]
            );
        }

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'payment_transaction_recorded', 'payment', $2, $3)`,
            [userId, id, JSON.stringify(transactionResult.rows[0])]
        );

        res.status(201).json({
            success: true,
            message: 'Transaction recorded successfully',
            data: {
                transaction: transactionResult.rows[0],
                new_balance: newBalance,
                new_status: newStatus
            }
        });
    } catch (error) {
        console.error('Record transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording transaction'
        });
    }
}

/**
 * Get all transactions for a payment
 */
async function getPaymentTransactions(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verify payment belongs to user
        const paymentCheck = await db.query(
            'SELECT id FROM PAYMENTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (paymentCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const result = await db.query(
            `SELECT pt.*,
                    fa.account_name as from_account_name,
                    ta.account_name as to_account_name
             FROM PAYMENT_TRANSACTIONS pt
             LEFT JOIN ACCOUNTS fa ON pt.from_account_id = fa.id
             LEFT JOIN ACCOUNTS ta ON pt.to_account_id = ta.id
             WHERE pt.payment_id = $1
             ORDER BY pt.transaction_date DESC`,
            [id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get payment transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving transactions'
        });
    }
}

/**
 * Reschedule payment due date
 */
async function reschedulePayment(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { new_due_date, reason, fee_for_change = 0 } = req.body;

    try {
        // Get current payment
        const paymentResult = await db.query(
            'SELECT * FROM PAYMENTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const payment = paymentResult.rows[0];

        // Record date change
        await db.query(
            `INSERT INTO PAYMENT_DATE_CHANGES (
                payment_id, user_id, old_due_date, new_due_date, 
                reason, changed_by, fee_for_change
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, userId, payment.current_due_date, new_due_date, reason, userId, fee_for_change]
        );

        // Update payment
        const newBalance = parseFloat(payment.current_balance) + parseFloat(fee_for_change);
        await db.query(
            `UPDATE PAYMENTS 
             SET current_due_date = $1, 
                 current_balance = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [new_due_date, newBalance, id]
        );

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, 
                                   field_changed, old_value, new_value, change_reason)
             VALUES ($1, 'due_date_rescheduled', 'payment', $2, 'current_due_date', $3, $4, $5)`,
            [userId, id, payment.current_due_date, new_due_date, reason]
        );

        res.json({
            success: true,
            message: 'Payment rescheduled successfully',
            data: {
                old_due_date: payment.current_due_date,
                new_due_date,
                fee_applied: fee_for_change
            }
        });
    } catch (error) {
        console.error('Reschedule payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rescheduling payment'
        });
    }
}

/**
 * Get payment history (changes and transactions)
 */
async function getPaymentHistory(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verify payment belongs to user
        const paymentCheck = await db.query(
            'SELECT id FROM PAYMENTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (paymentCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Get all audit log entries for this payment
        const auditResult = await db.query(
            `SELECT * FROM AUDIT_LOG 
             WHERE entity_type = 'payment' AND entity_id = $1
             ORDER BY timestamp DESC`,
            [id]
        );

        // Get all date changes
        const dateChanges = await db.query(
            `SELECT * FROM PAYMENT_DATE_CHANGES 
             WHERE payment_id = $1
             ORDER BY changed_date DESC`,
            [id]
        );

        // Get all transactions
        const transactions = await db.query(
            `SELECT * FROM PAYMENT_TRANSACTIONS 
             WHERE payment_id = $1
             ORDER BY transaction_date DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                audit_log: auditResult.rows,
                date_changes: dateChanges.rows,
                transactions: transactions.rows
            }
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment history'
        });
    }
}

/**
 * Get recent recipients for autocomplete
 */
async function getRecentRecipients(req, res) {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    try {
        const result = await db.query(
            `SELECT DISTINCT recipient
             FROM PAYMENTS
             WHERE user_id = $1 AND recipient IS NOT NULL AND recipient != ''
             ORDER BY created_at DESC
             LIMIT $2`,
            [userId, limit]
        );

        res.json({
            success: true,
            data: result.rows.map(r => r.recipient)
        });
    } catch (error) {
        console.error('Get recent recipients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving recent recipients'
        });
    }
}

module.exports = {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    recordTransaction,
    getPaymentTransactions,
    reschedulePayment,
    getPaymentHistory,
    getRecentRecipients
};

