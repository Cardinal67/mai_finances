const db = require('../config/database');

/**
 * Get user preferences
 */
async function getPreferences(req, res) {
    const userId = req.user.id;

    try {
        const result = await db.query(
            'SELECT * FROM USER_PREFERENCES WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Create default preferences if they don't exist
            const defaultPrefs = await db.query(
                `INSERT INTO USER_PREFERENCES (user_id, timezone, date_range_preference,
                    safety_buffer_type, safety_buffer_amount, default_currency,
                    dashboard_widgets, table_columns, display_density, theme, notification_preferences, balance_masked)
                 VALUES ($1, 'UTC', 30, 'fixed', 0.00, 'USD', '{}', '{}', 'comfortable', 'light', '{}', TRUE)
                 RETURNING *`,
                [userId]
            );

            return res.json({
                success: true,
                data: defaultPrefs.rows[0]
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving preferences'
        });
    }
}

/**
 * Update user preferences
 */
async function updatePreferences(req, res) {
    const userId = req.user.id;
    const updates = req.body;

    console.log('[PREFERENCES] Update request:', JSON.stringify(updates));
    console.log('[PREFERENCES] Request body type:', typeof updates);
    console.log('[PREFERENCES] Request body keys:', Object.keys(updates));
    console.log('[PREFERENCES] Raw body:', updates);

    try {
        const allowedFields = [
            'timezone', 'date_range_preference', 'safety_buffer_type', 'safety_buffer_amount',
            'default_currency', 'dashboard_widgets', 'table_columns', 'display_density',
            'theme', 'notification_preferences', 'custom_theme', 'balance_masked'
        ];

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            console.log(`[PREFERENCES] Checking field: ${key} = ${value} (type: ${typeof value}), allowed: ${allowedFields.includes(key)}, not undefined: ${value !== undefined}`);
            // Allow all values except undefined (includes false, 0, null, empty string)
            if (allowedFields.includes(key) && value !== undefined) {
                updateFields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
                console.log(`[PREFERENCES] ✅ Added field: ${key} = $${paramIndex-1}`);
            } else {
                console.log(`[PREFERENCES] ❌ Rejected field: ${key}, reason: ${!allowedFields.includes(key) ? 'not allowed' : 'undefined value'}`);
            }
        }

        console.log('[PREFERENCES] Update fields:', updateFields);
        console.log('[PREFERENCES] Values:', values);

        if (updateFields.length === 0) {
            console.log('[PREFERENCES] No valid fields to update');
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);

        const query = `
            UPDATE USER_PREFERENCES 
            SET ${updateFields.join(', ')}
            WHERE user_id = $${paramIndex}
            RETURNING *
        `;

        const result = await db.query(query, values);

        // If no rows updated, preferences don't exist yet - create them
        if (result.rows.length === 0) {
            const createResult = await db.query(
                `INSERT INTO USER_PREFERENCES (user_id, timezone, date_range_preference,
                    safety_buffer_type, safety_buffer_amount, default_currency,
                    dashboard_widgets, table_columns, display_density, theme, notification_preferences, balance_masked)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING *`,
                [
                    userId,
                    updates.timezone || 'UTC',
                    updates.date_range_preference || 30,
                    updates.safety_buffer_type || 'fixed',
                    updates.safety_buffer_amount || 0.00,
                    updates.default_currency || 'USD',
                    updates.dashboard_widgets || {},
                    updates.table_columns || {},
                    updates.display_density || 'comfortable',
                    updates.theme || 'light',
                    updates.notification_preferences || {},
                    updates.balance_masked !== undefined ? updates.balance_masked : true
                ]
            );

            return res.json({
                success: true,
                message: 'Preferences created successfully',
                data: createResult.rows[0]
            });
        }

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id)
             VALUES ($1, 'preferences_updated', 'user_preferences', $2)`,
            [userId, result.rows[0].id]
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating preferences'
        });
    }
}

/**
 * Get dashboard layout preferences
 */
async function getDashboardLayout(req, res) {
    const userId = req.user.id;

    try {
        const result = await db.query(
            'SELECT dashboard_widgets FROM USER_PREFERENCES WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            data: result.rows[0]?.dashboard_widgets || {}
        });
    } catch (error) {
        console.error('Get dashboard layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard layout'
        });
    }
}

/**
 * Update dashboard layout preferences
 */
async function updateDashboardLayout(req, res) {
    const userId = req.user.id;
    const { dashboard_widgets } = req.body;

    try {
        const result = await db.query(
            `UPDATE USER_PREFERENCES 
             SET dashboard_widgets = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2
             RETURNING dashboard_widgets`,
            [dashboard_widgets, userId]
        );

        res.json({
            success: true,
            message: 'Dashboard layout updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update dashboard layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating dashboard layout'
        });
    }
}

/**
 * Reset preferences to default
 */
async function resetPreferences(req, res) {
    const userId = req.user.id;

    try {
        const result = await db.query(
            `UPDATE USER_PREFERENCES 
             SET timezone = 'UTC',
                 date_range_preference = 30,
                 safety_buffer_type = 'fixed',
                 safety_buffer_amount = 0.00,
                 default_currency = 'USD',
                 dashboard_widgets = '{}',
                 table_columns = '{}',
                 display_density = 'comfortable',
                 theme = 'light',
                 notification_preferences = '{}',
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1
             RETURNING *`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Preferences reset to defaults',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Reset preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting preferences'
        });
    }
}

module.exports = {
    getPreferences,
    updatePreferences,
    getDashboardLayout,
    updateDashboardLayout,
    resetPreferences
};

