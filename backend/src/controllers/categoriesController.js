const db = require('../config/database');

/**
 * Get all categories for the authenticated user
 */
async function getAllCategories(req, res) {
    const userId = req.user.id;
    const { is_active } = req.query;

    try {
        let query = `
            SELECT c.*,
                   pc.name as parent_name,
                   (SELECT COUNT(*) FROM PAYMENT_CATEGORIES WHERE category_id = c.id) as usage_count
            FROM CATEGORIES c
            LEFT JOIN CATEGORIES pc ON c.parent_category_id = pc.id
            WHERE c.user_id = $1
        `;
        const params = [userId];

        if (is_active !== undefined) {
            query += ` AND c.is_active = $2`;
            params.push(is_active === 'true');
        }

        query += ` ORDER BY c.sort_order ASC, c.name ASC`;

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving categories'
        });
    }
}

/**
 * Get a single category by ID
 */
async function getCategoryById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT c.*, pc.name as parent_name
             FROM CATEGORIES c
             LEFT JOIN CATEGORIES pc ON c.parent_category_id = pc.id
             WHERE c.id = $1 AND c.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving category'
        });
    }
}

/**
 * Create a new category
 */
async function createCategory(req, res) {
    const userId = req.user.id;
    const {
        name,
        parent_category_id,
        color_code,
        icon,
        is_active = true,
        sort_order = 0
    } = req.body;

    try {
        // Check for duplicate name
        const duplicateCheck = await db.query(
            'SELECT id FROM CATEGORIES WHERE user_id = $1 AND name = $2',
            [userId, name]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Verify parent category belongs to user if provided
        if (parent_category_id) {
            const parentCheck = await db.query(
                'SELECT id FROM CATEGORIES WHERE id = $1 AND user_id = $2',
                [parent_category_id, userId]
            );

            if (parentCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent category not found'
                });
            }
        }

        const result = await db.query(
            `INSERT INTO CATEGORIES (
                user_id, name, parent_category_id, color_code, icon,
                is_active, sort_order, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [userId, name, parent_category_id, color_code, icon, is_active, sort_order]
        );

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'category_created', 'category', $2, $3)`,
            [userId, result.rows[0].id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category'
        });
    }
}

/**
 * Update a category
 */
async function updateCategory(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    try {
        const currentData = await db.query(
            'SELECT * FROM CATEGORIES WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check for duplicate name if changing name
        if (updates.name && updates.name !== currentData.rows[0].name) {
            const duplicateCheck = await db.query(
                'SELECT id FROM CATEGORIES WHERE user_id = $1 AND name = $2 AND id != $3',
                [userId, updates.name, id]
            );

            if (duplicateCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        const allowedFields = [
            'name', 'parent_category_id', 'color_code', 'icon', 'is_active', 'sort_order'
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
            UPDATE CATEGORIES 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING *
        `;

        const result = await db.query(query, values);

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id)
             VALUES ($1, 'category_updated', 'category', $2)`,
            [userId, id]
        );

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category'
        });
    }
}

/**
 * Delete a category
 */
async function deleteCategory(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check if category has payments
        const paymentCheck = await db.query(
            'SELECT COUNT(*) as count FROM PAYMENT_CATEGORIES WHERE category_id = $1',
            [id]
        );

        if (parseInt(paymentCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing payments. Consider marking as inactive instead.'
            });
        }

        // Check if category has subcategories
        const subcategoryCheck = await db.query(
            'SELECT COUNT(*) as count FROM CATEGORIES WHERE parent_category_id = $1',
            [id]
        );

        if (parseInt(subcategoryCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with subcategories'
            });
        }

        const check = await db.query(
            'SELECT * FROM CATEGORIES WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await db.query('DELETE FROM CATEGORIES WHERE id = $1', [id]);

        // Log deletion
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, old_value)
             VALUES ($1, 'category_deleted', 'category', $2, $3)`,
            [userId, id, JSON.stringify(check.rows[0])]
        );

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category'
        });
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};

