const db = require('../config/database');

/**
 * Normalize URL by adding http:// if missing
 */
function normalizeUrl(url) {
    if (!url || url.trim() === '') return null;
    const trimmedUrl = url.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
        return `http://${trimmedUrl}`;
    }
    return trimmedUrl;
}

/**
 * Get all contacts for the authenticated user
 */
async function getAllContacts(req, res) {
    const userId = req.user.id;
    const { contact_type, status, search } = req.query;

    try {
        let query = `
            SELECT c.*,
                   (SELECT COUNT(*) FROM PAYMENTS WHERE contact_id = c.id) as payment_count
            FROM CONTACTS c
            WHERE c.user_id = $1
        `;
        const params = [userId];
        let paramIndex = 2;

        if (contact_type) {
            query += ` AND c.contact_type = $${paramIndex}`;
            params.push(contact_type);
            paramIndex++;
        }

        if (status) {
            query += ` AND c.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (search) {
            query += ` AND c.current_name ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY c.current_name ASC`;

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving contacts'
        });
    }
}

/**
 * Get a single contact by ID
 */
async function getContactById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT c.*,
                    (SELECT json_agg(cnh ORDER BY cnh.change_date DESC) 
                     FROM CONTACT_NAME_HISTORY cnh 
                     WHERE cnh.contact_id = c.id) as name_history
             FROM CONTACTS c
             WHERE c.id = $1 AND c.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving contact'
        });
    }
}

/**
 * Create a new contact
 */
async function createContact(req, res) {
    const userId = req.user.id;
    const {
        current_name,
        contact_type,
        email,
        phone,
        address,
        account_number,
        website,
        payment_portal_url,
        notes
    } = req.body;

    // Validate required fields
    if (!current_name || !contact_type) {
        return res.status(400).json({
            success: false,
            message: 'Contact name and type are required'
        });
    }

    try {
        // Normalize URLs
        const normalizedWebsite = normalizeUrl(website);
        const normalizedPortalUrl = normalizeUrl(payment_portal_url);

        const result = await db.query(
            `INSERT INTO CONTACTS (
                user_id, current_name, contact_type, email, phone, address,
                account_number, website, payment_portal_url, notes, status,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active',
                      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                userId, current_name, contact_type, email, phone, address,
                account_number, normalizedWebsite, normalizedPortalUrl, notes
            ]
        );

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'contact_created', 'contact', $2, $3)`,
            [userId, result.rows[0].id, JSON.stringify(result.rows[0])]
        );

        res.status(201).json({
            success: true,
            message: 'Contact created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating contact'
        });
    }
}

/**
 * Update a contact
 */
async function updateContact(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    try {
        const currentData = await db.query(
            'SELECT * FROM CONTACTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Normalize URLs if they are being updated
        if (updates.website) {
            updates.website = normalizeUrl(updates.website);
        }
        if (updates.payment_portal_url) {
            updates.payment_portal_url = normalizeUrl(updates.payment_portal_url);
        }

        const allowedFields = [
            'current_name', 'contact_type', 'email', 'phone', 'address',
            'account_number', 'website', 'payment_portal_url', 'notes', 'status'
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
            UPDATE CONTACTS 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING *
        `;

        const result = await db.query(query, values);

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id)
             VALUES ($1, 'contact_updated', 'contact', $2)`,
            [userId, id]
        );

        res.json({
            success: true,
            message: 'Contact updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact'
        });
    }
}

/**
 * Delete a contact
 */
async function deleteContact(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check if contact has payments
        const paymentCheck = await db.query(
            'SELECT COUNT(*) as count FROM PAYMENTS WHERE contact_id = $1',
            [id]
        );

        if (parseInt(paymentCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete contact with existing payments. Consider marking as inactive instead.'
            });
        }

        const check = await db.query(
            'SELECT * FROM CONTACTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await db.query('DELETE FROM CONTACTS WHERE id = $1', [id]);

        // Log deletion
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, old_value)
             VALUES ($1, 'contact_deleted', 'contact', $2, $3)`,
            [userId, id, JSON.stringify(check.rows[0])]
        );

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact'
        });
    }
}

/**
 * Rename a contact (with history tracking)
 */
async function renameContact(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { new_name, change_reason, documentation, new_account_number } = req.body;

    try {
        const currentData = await db.query(
            'SELECT * FROM CONTACTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        const contact = currentData.rows[0];

        // Record name change in history
        await db.query(
            `INSERT INTO CONTACT_NAME_HISTORY (
                contact_id, old_name, new_name, change_reason,
                old_account_number, new_account_number, documentation, changed_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                id, contact.current_name, new_name, change_reason,
                contact.account_number, new_account_number, documentation, userId
            ]
        );

        // Update contact
        const updateQuery = `
            UPDATE CONTACTS 
            SET current_name = $1, 
                ${new_account_number ? 'account_number = $4,' : ''}
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `;

        const params = new_account_number 
            ? [new_name, id, userId, new_account_number]
            : [new_name, id, userId];

        const result = await db.query(updateQuery, params);

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, 
                                   field_changed, old_value, new_value, change_reason)
             VALUES ($1, 'contact_renamed', 'contact', $2, 'current_name', $3, $4, $5)`,
            [userId, id, contact.current_name, new_name, change_reason]
        );

        res.json({
            success: true,
            message: 'Contact renamed successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Rename contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Error renaming contact'
        });
    }
}

/**
 * Get all payments for a contact
 */
async function getContactPayments(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verify contact belongs to user
        const contactCheck = await db.query(
            'SELECT id FROM CONTACTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (contactCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        const result = await db.query(
            `SELECT * FROM PAYMENTS 
             WHERE contact_id = $1 
             ORDER BY current_due_date DESC`,
            [id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get contact payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving contact payments'
        });
    }
}

module.exports = {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    renameContact,
    getContactPayments
};

