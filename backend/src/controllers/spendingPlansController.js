const db = require('../config/database');

/**
 * Get all spending plans for the authenticated user
 */
async function getAllSpendingPlans(req, res) {
    const userId = req.user.id;
    const { status } = req.query;

    try {
        let query = `
            SELECT sp.*,
                   a.account_name as from_account_name,
                   c.name as category_name,
                   c.color_code as category_color
            FROM SPENDING_PLANS sp
            LEFT JOIN ACCOUNTS a ON sp.from_account_id = a.id
            LEFT JOIN CATEGORIES c ON sp.category_id = c.id
            WHERE sp.user_id = $1
        `;
        const params = [userId];

        if (status) {
            query += ` AND sp.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY sp.planned_date ASC NULLS LAST, sp.created_at DESC`;

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get spending plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving spending plans'
        });
    }
}

/**
 * Get a single spending plan by ID
 */
async function getSpendingPlanById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT sp.*,
                    a.account_name as from_account_name,
                    a.available_balance as account_balance,
                    c.name as category_name,
                    c.color_code as category_color
             FROM SPENDING_PLANS sp
             LEFT JOIN ACCOUNTS a ON sp.from_account_id = a.id
             LEFT JOIN CATEGORIES c ON sp.category_id = c.id
             WHERE sp.id = $1 AND sp.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Spending plan not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get spending plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving spending plan'
        });
    }
}

/**
 * Create a new spending plan
 */
async function createSpendingPlan(req, res) {
    const userId = req.user.id;
    const {
        plan_name,
        planned_amount,
        planned_date,
        from_account_id,
        category_id,
        notes
    } = req.body;

    try {
        // Verify account belongs to user if provided
        if (from_account_id) {
            const accountCheck = await db.query(
                'SELECT id FROM ACCOUNTS WHERE id = $1 AND user_id = $2',
                [from_account_id, userId]
            );

            if (accountCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
        }

        // Verify category belongs to user if provided
        if (category_id) {
            const categoryCheck = await db.query(
                'SELECT id FROM CATEGORIES WHERE id = $1 AND user_id = $2',
                [category_id, userId]
            );

            if (categoryCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
        }

        const result = await db.query(
            `INSERT INTO SPENDING_PLANS (
                user_id, plan_name, planned_amount, planned_date,
                from_account_id, category_id, status, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, 'planned', $7, CURRENT_TIMESTAMP)
            RETURNING *`,
            [userId, plan_name, planned_amount, planned_date, from_account_id, category_id, notes]
        );

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'spending_plan_created', 'spending_plan', $2, $3)`,
            [userId, result.rows[0].id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json({
            success: true,
            message: 'Spending plan created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create spending plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating spending plan'
        });
    }
}

/**
 * Update a spending plan
 */
async function updateSpendingPlan(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    try {
        const currentData = await db.query(
            'SELECT * FROM SPENDING_PLANS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Spending plan not found'
            });
        }

        const allowedFields = [
            'plan_name', 'planned_amount', 'planned_date',
            'from_account_id', 'category_id', 'status', 'notes'
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

        values.push(id, userId);

        const query = `
            UPDATE SPENDING_PLANS 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING *
        `;

        const result = await db.query(query, values);

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id)
             VALUES ($1, 'spending_plan_updated', 'spending_plan', $2)`,
            [userId, id]
        );

        res.json({
            success: true,
            message: 'Spending plan updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update spending plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating spending plan'
        });
    }
}

/**
 * Delete a spending plan
 */
async function deleteSpendingPlan(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const check = await db.query(
            'SELECT * FROM SPENDING_PLANS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Spending plan not found'
            });
        }

        await db.query('DELETE FROM SPENDING_PLANS WHERE id = $1', [id]);

        // Log deletion
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, old_value)
             VALUES ($1, 'spending_plan_deleted', 'spending_plan', $2, $3)`,
            [userId, id, JSON.stringify(check.rows[0])]
        );

        res.json({
            success: true,
            message: 'Spending plan deleted successfully'
        });
    } catch (error) {
        console.error('Delete spending plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting spending plan'
        });
    }
}

/**
 * Mark a spending plan as completed
 */
async function completeSpendingPlan(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const check = await db.query(
            'SELECT * FROM SPENDING_PLANS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Spending plan not found'
            });
        }

        const result = await db.query(
            `UPDATE SPENDING_PLANS 
             SET status = 'completed', completed_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, userId]
        );

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id)
             VALUES ($1, 'spending_plan_completed', 'spending_plan', $2)`,
            [userId, id]
        );

        res.json({
            success: true,
            message: 'Spending plan marked as completed',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Complete spending plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing spending plan'
        });
    }
}

module.exports = {
    getAllSpendingPlans,
    getSpendingPlanById,
    createSpendingPlan,
    updateSpendingPlan,
    deleteSpendingPlan,
    completeSpendingPlan
};

