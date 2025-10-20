const db = require('../config/database');
const moment = require('moment-timezone');

/**
 * Get all income streams for the authenticated user
 */
async function getAllIncomeStreams(req, res) {
    const userId = req.user.id;
    const { is_active, source_type, search } = req.query;

    try {
        let query = `
            SELECT i.*,
                   a.account_name as to_account_name,
                   (SELECT COUNT(*) FROM INCOME_TRANSACTIONS it WHERE it.income_stream_id = i.id) as transaction_count,
                   (SELECT SUM(it.amount) FROM INCOME_TRANSACTIONS it WHERE it.income_stream_id = i.id) as total_received
            FROM INCOME_STREAMS i
            LEFT JOIN ACCOUNTS a ON i.to_account_id = a.id
            WHERE i.user_id = $1
        `;
        const params = [userId];
        let paramIndex = 2;

        if (is_active !== undefined) {
            query += ` AND i.is_active = $${paramIndex}`;
            params.push(is_active === 'true');
            paramIndex++;
        }

        if (source_type) {
            query += ` AND i.source_type = $${paramIndex}`;
            params.push(source_type);
            paramIndex++;
        }

        if (search) {
            query += ` AND i.source_name ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY i.next_expected_date ASC NULLS LAST`;

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get income streams error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving income streams'
        });
    }
}

/**
 * Get a single income stream by ID
 */
async function getIncomeStreamById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT i.*,
                    a.account_name as to_account_name,
                    (SELECT json_agg(it ORDER BY it.received_date DESC) 
                     FROM INCOME_TRANSACTIONS it 
                     WHERE it.income_stream_id = i.id) as recent_transactions
             FROM INCOME_STREAMS i
             LEFT JOIN ACCOUNTS a ON i.to_account_id = a.id
             WHERE i.id = $1 AND i.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Income stream not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get income stream error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving income stream'
        });
    }
}

/**
 * Create a new income stream
 */
async function createIncomeStream(req, res) {
    const userId = req.user.id;
    const {
        source_name,
        source_type,
        amount,
        is_variable = false,
        to_account_id,
        is_recurring = false,
        recurrence_pattern,
        recurrence_interval,
        next_expected_date,
        recurrence_end_date,
        tax_withholding = 0,
        notes
    } = req.body;

    try {
        // Verify account belongs to user if provided
        if (to_account_id) {
            const accountCheck = await db.query(
                'SELECT id FROM ACCOUNTS WHERE id = $1 AND user_id = $2',
                [to_account_id, userId]
            );

            if (accountCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
        }

        const result = await db.query(
            `INSERT INTO INCOME_STREAMS (
                user_id, source_name, source_type, amount, is_variable,
                to_account_id, is_recurring, recurrence_pattern, recurrence_interval,
                next_expected_date, recurrence_end_date, tax_withholding, notes,
                is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true,
                      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                userId, source_name, source_type, amount, is_variable,
                to_account_id, is_recurring, recurrence_pattern, recurrence_interval,
                next_expected_date, recurrence_end_date, tax_withholding, notes
            ]
        );

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'income_stream_created', 'income_stream', $2, $3)`,
            [userId, result.rows[0].id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json({
            success: true,
            message: 'Income stream created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create income stream error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating income stream'
        });
    }
}

/**
 * Update an income stream
 */
async function updateIncomeStream(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    try {
        const currentData = await db.query(
            'SELECT * FROM INCOME_STREAMS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Income stream not found'
            });
        }

        const allowedFields = [
            'source_name', 'source_type', 'amount', 'is_variable',
            'to_account_id', 'is_recurring', 'recurrence_pattern',
            'recurrence_interval', 'next_expected_date', 'recurrence_end_date',
            'tax_withholding', 'notes', 'is_active'
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
            UPDATE INCOME_STREAMS 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING *
        `;

        const result = await db.query(query, values);

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'income_stream_updated', 'income_stream', $2, $3)`,
            [userId, id, JSON.stringify(result.rows[0])]
        );

        res.json({
            success: true,
            message: 'Income stream updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update income stream error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating income stream'
        });
    }
}

/**
 * Delete an income stream
 */
async function deleteIncomeStream(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const check = await db.query(
            'SELECT * FROM INCOME_STREAMS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Income stream not found'
            });
        }

        await db.query('DELETE FROM INCOME_STREAMS WHERE id = $1', [id]);

        // Log deletion
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, old_value)
             VALUES ($1, 'income_stream_deleted', 'income_stream', $2, $3)`,
            [userId, id, JSON.stringify(check.rows[0])]
        );

        res.json({
            success: true,
            message: 'Income stream deleted successfully'
        });
    } catch (error) {
        console.error('Delete income stream error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting income stream'
        });
    }
}

/**
 * Mark income as received (record transaction)
 */
async function receiveIncome(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const {
        amount,
        to_account_id,
        received_date,
        confirmation_number,
        notes
    } = req.body;

    try {
        // Get income stream details
        const incomeResult = await db.query(
            'SELECT * FROM INCOME_STREAMS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (incomeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Income stream not found'
            });
        }

        const incomeStream = incomeResult.rows[0];
        const finalToAccount = to_account_id || incomeStream.to_account_id;

        // Record transaction
        const transactionResult = await db.query(
            `INSERT INTO INCOME_TRANSACTIONS (
                income_stream_id, user_id, received_date, amount,
                to_account_id, confirmation_number, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                id, userId, received_date || new Date(), amount,
                finalToAccount, confirmation_number, notes
            ]
        );

        // Update account balance if account specified
        if (finalToAccount) {
            await db.query(
                `UPDATE ACCOUNTS 
                 SET current_balance = current_balance + $1,
                     available_balance = available_balance + $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2 AND user_id = $3`,
                [amount, finalToAccount, userId]
            );
        }

        // Update next expected date if recurring
        if (incomeStream.is_recurring && incomeStream.next_expected_date) {
            const nextDate = calculateNextOccurrence(
                incomeStream.next_expected_date,
                incomeStream.recurrence_pattern,
                incomeStream.recurrence_interval
            );

            await db.query(
                `UPDATE INCOME_STREAMS 
                 SET next_expected_date = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [nextDate, id]
            );
        }

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'income_received', 'income_stream', $2, $3)`,
            [userId, id, JSON.stringify(transactionResult.rows[0])]
        );

        res.status(201).json({
            success: true,
            message: 'Income received successfully',
            data: transactionResult.rows[0]
        });
    } catch (error) {
        console.error('Receive income error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording income'
        });
    }
}

/**
 * Get all transactions for an income stream
 */
async function getIncomeTransactions(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verify income stream belongs to user
        const check = await db.query(
            'SELECT id FROM INCOME_STREAMS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Income stream not found'
            });
        }

        const result = await db.query(
            `SELECT it.*,
                    a.account_name as to_account_name
             FROM INCOME_TRANSACTIONS it
             LEFT JOIN ACCOUNTS a ON it.to_account_id = a.id
             WHERE it.income_stream_id = $1
             ORDER BY it.received_date DESC`,
            [id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get income transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving transactions'
        });
    }
}

/**
 * Get upcoming income (next 30 days by default)
 */
async function getUpcomingIncome(req, res) {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    try {
        const endDate = moment().add(parseInt(days), 'days').format('YYYY-MM-DD');

        const result = await db.query(
            `SELECT i.*,
                    a.account_name as to_account_name
             FROM INCOME_STREAMS i
             LEFT JOIN ACCOUNTS a ON i.to_account_id = a.id
             WHERE i.user_id = $1
               AND i.is_active = true
               AND i.next_expected_date IS NOT NULL
               AND i.next_expected_date <= $2
             ORDER BY i.next_expected_date ASC`,
            [userId, endDate]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get upcoming income error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving upcoming income'
        });
    }
}

/**
 * Get income statistics
 */
async function getIncomeStats(req, res) {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    try {
        const params = [userId];
        let dateFilter = '';

        if (start_date && end_date) {
            dateFilter = ' AND it.received_date BETWEEN $2 AND $3';
            params.push(start_date, end_date);
        }

        const query = `
            SELECT 
                COUNT(DISTINCT i.id) as total_streams,
                COUNT(it.id) as total_transactions,
                COALESCE(SUM(it.amount), 0) as total_received,
                COALESCE(AVG(it.amount), 0) as average_amount,
                json_agg(DISTINCT jsonb_build_object(
                    'source_type', i.source_type,
                    'count', (SELECT COUNT(*) FROM INCOME_STREAMS WHERE user_id = $1 AND source_type = i.source_type),
                    'total', (SELECT COALESCE(SUM(it2.amount), 0) 
                             FROM INCOME_TRANSACTIONS it2 
                             JOIN INCOME_STREAMS i2 ON it2.income_stream_id = i2.id
                             WHERE i2.user_id = $1 AND i2.source_type = i.source_type ${dateFilter})
                )) FILTER (WHERE i.source_type IS NOT NULL) as by_type
            FROM INCOME_STREAMS i
            LEFT JOIN INCOME_TRANSACTIONS it ON i.id = it.income_stream_id ${dateFilter}
            WHERE i.user_id = $1
        `;

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get income stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving income statistics'
        });
    }
}

/**
 * Helper function to calculate next occurrence date
 */
function calculateNextOccurrence(currentDate, pattern, interval = 1) {
    const date = moment(currentDate);

    switch (pattern) {
        case 'daily':
            return date.add(interval, 'days').format('YYYY-MM-DD');
        case 'weekly':
            return date.add(interval, 'weeks').format('YYYY-MM-DD');
        case 'biweekly':
            return date.add(interval * 2, 'weeks').format('YYYY-MM-DD');
        case 'monthly':
            return date.add(interval, 'months').format('YYYY-MM-DD');
        case 'quarterly':
            return date.add(interval * 3, 'months').format('YYYY-MM-DD');
        case 'yearly':
            return date.add(interval, 'years').format('YYYY-MM-DD');
        default:
            return date.add(interval, 'days').format('YYYY-MM-DD');
    }
}

module.exports = {
    getAllIncomeStreams,
    getIncomeStreamById,
    createIncomeStream,
    updateIncomeStream,
    deleteIncomeStream,
    receiveIncome,
    getIncomeTransactions,
    getUpcomingIncome,
    getIncomeStats
};

