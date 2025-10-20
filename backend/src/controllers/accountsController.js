const db = require('../config/database');
const { encrypt, decrypt, getLast4Digits } = require('../config/encryption');

/**
 * Get all accounts for the authenticated user
 */
async function getAllAccounts(req, res) {
    const userId = req.user.id;
    const { account_type, is_active } = req.query;

    try {
        let query = `
            SELECT id, user_id, account_name, account_type, institution_name,
                   institution_phone, institution_website, account_number_last4,
                   current_balance, available_balance, is_active, default_for_bills,
                   transfer_time_days, notes, created_at, updated_at
            FROM ACCOUNTS
            WHERE user_id = $1
        `;
        const params = [userId];
        let paramIndex = 2;

        if (account_type) {
            query += ` AND account_type = $${paramIndex}`;
            params.push(account_type);
            paramIndex++;
        }

        if (is_active !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(is_active === 'true');
            paramIndex++;
        }

        query += ` ORDER BY is_active DESC, account_name ASC`;

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving accounts'
        });
    }
}

/**
 * Get a single account by ID (with decrypted sensitive data)
 */
async function getAccountById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { include_sensitive = 'false' } = req.query;

    try {
        const result = await db.query(
            `SELECT * FROM ACCOUNTS WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        const account = result.rows[0];

        // Decrypt sensitive fields if requested
        if (include_sensitive === 'true') {
            if (account.routing_number) {
                account.routing_number = decrypt(account.routing_number);
            }
            if (account.account_number) {
                account.account_number = decrypt(account.account_number);
            }
        } else {
            // Remove encrypted fields from response
            delete account.routing_number;
            delete account.account_number;
        }

        res.json({
            success: true,
            data: account
        });
    } catch (error) {
        console.error('Get account by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving account'
        });
    }
}

/**
 * Create a new account
 */
async function createAccount(req, res) {
    const userId = req.user.id;
    const {
        account_name,
        account_type,
        institution_name,
        institution_phone,
        institution_website,
        routing_number,
        account_number,
        current_balance = 0,
        available_balance,
        is_active = true,
        default_for_bills = false,
        transfer_time_days = 2,
        notes
    } = req.body;

    try {
        // Encrypt sensitive data
        const encryptedRoutingNumber = routing_number ? encrypt(routing_number) : null;
        const encryptedAccountNumber = account_number ? encrypt(account_number) : null;
        const last4 = account_number ? getLast4Digits(account_number) : null;

        // If default_for_bills is true, unset other defaults
        if (default_for_bills) {
            await db.query(
                'UPDATE ACCOUNTS SET default_for_bills = false WHERE user_id = $1',
                [userId]
            );
        }

        const result = await db.query(
            `INSERT INTO ACCOUNTS (
                user_id, account_name, account_type, institution_name,
                institution_phone, institution_website, routing_number,
                account_number, account_number_last4, current_balance,
                available_balance, is_active, default_for_bills,
                transfer_time_days, notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, user_id, account_name, account_type, institution_name,
                      account_number_last4, current_balance, available_balance,
                      is_active, default_for_bills, created_at`,
            [
                userId, account_name, account_type, institution_name,
                institution_phone, institution_website, encryptedRoutingNumber,
                encryptedAccountNumber, last4, current_balance,
                available_balance || current_balance, is_active, default_for_bills,
                transfer_time_days, notes
            ]
        );

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, new_value)
             VALUES ($1, 'account_created', 'account', $2, $3)`,
            [userId, result.rows[0].id, JSON.stringify({ account_name, account_type })]
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating account'
        });
    }
}

/**
 * Update an account
 */
async function updateAccount(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    try {
        // Check if account exists
        const currentData = await db.query(
            'SELECT * FROM ACCOUNTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        // Handle default_for_bills
        if (updates.default_for_bills === true) {
            await db.query(
                'UPDATE ACCOUNTS SET default_for_bills = false WHERE user_id = $1 AND id != $2',
                [userId, id]
            );
        }

        // Build update query
        const allowedFields = [
            'account_name', 'account_type', 'institution_name', 'institution_phone',
            'institution_website', 'current_balance', 'available_balance',
            'is_active', 'default_for_bills', 'transfer_time_days', 'notes'
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

        // Handle encrypted fields separately
        if (updates.routing_number !== undefined) {
            updateFields.push(`routing_number = $${paramIndex}`);
            values.push(updates.routing_number ? encrypt(updates.routing_number) : null);
            paramIndex++;
        }

        if (updates.account_number !== undefined) {
            updateFields.push(`account_number = $${paramIndex}`);
            values.push(updates.account_number ? encrypt(updates.account_number) : null);
            paramIndex++;

            updateFields.push(`account_number_last4 = $${paramIndex}`);
            values.push(updates.account_number ? getLast4Digits(updates.account_number) : null);
            paramIndex++;
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
            UPDATE ACCOUNTS 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING id, user_id, account_name, account_type, institution_name,
                      account_number_last4, current_balance, available_balance,
                      is_active, default_for_bills, updated_at
        `;

        const result = await db.query(query, values);

        // Log to audit trail
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id)
             VALUES ($1, 'account_updated', 'account', $2)`,
            [userId, id]
        );

        res.json({
            success: true,
            message: 'Account updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating account'
        });
    }
}

/**
 * Delete an account
 */
async function deleteAccount(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check if account has any transactions
        const transactionCheck = await db.query(
            `SELECT COUNT(*) as count FROM (
                SELECT id FROM PAYMENT_TRANSACTIONS WHERE from_account_id = $1 OR to_account_id = $1
                UNION
                SELECT id FROM INCOME_TRANSACTIONS WHERE to_account_id = $1
                UNION
                SELECT id FROM ACCOUNT_TRANSFERS WHERE from_account_id = $1 OR to_account_id = $1
            ) AS combined`,
            [id]
        );

        if (parseInt(transactionCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete account with existing transactions. Consider deactivating instead.'
            });
        }

        const check = await db.query(
            'SELECT * FROM ACCOUNTS WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        await db.query('DELETE FROM ACCOUNTS WHERE id = $1', [id]);

        // Log deletion
        await db.query(
            `INSERT INTO AUDIT_LOG (user_id, action_type, entity_type, entity_id, old_value)
             VALUES ($1, 'account_deleted', 'account', $2, $3)`,
            [userId, id, JSON.stringify({ account_name: check.rows[0].account_name })]
        );

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account'
        });
    }
}

/**
 * Get safe-to-spend amount for an account or all accounts
 */
async function getSafeToSpend(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { days_ahead = 30 } = req.query;

    try {
        // Get user preferences for safety buffer
        const prefsResult = await db.query(
            'SELECT safety_buffer_type, safety_buffer_amount FROM USER_PREFERENCES WHERE user_id = $1',
            [userId]
        );

        const prefs = prefsResult.rows[0] || { safety_buffer_type: 'fixed', safety_buffer_amount: 0 };

        let accountFilter = '';
        const params = [userId, days_ahead];

        if (id !== 'all') {
            accountFilter = ' AND a.id = $3';
            params.push(id);
        }

        // Calculate safe-to-spend
        const query = `
            SELECT 
                a.id,
                a.account_name,
                a.available_balance,
                COALESCE(SUM(p.current_balance), 0) as upcoming_bills,
                COALESCE(SUM(i.amount), 0) as expected_income
            FROM ACCOUNTS a
            LEFT JOIN PAYMENTS p ON p.user_id = a.user_id 
                AND p.payment_type = 'owed_by_me'
                AND p.status NOT IN ('paid_in_full', 'canceled')
                AND p.current_due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '1 day' * $2
            LEFT JOIN INCOME_STREAMS i ON i.user_id = a.user_id
                AND i.is_active = true
                AND i.next_expected_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '1 day' * $2
            WHERE a.user_id = $1 ${accountFilter}
            GROUP BY a.id, a.account_name, a.available_balance
        `;

        const result = await db.query(query, params);

        // Calculate safe-to-spend for each account
        const accounts = result.rows.map(account => {
            const upcomingBills = parseFloat(account.upcoming_bills) || 0;
            const expectedIncome = parseFloat(account.expected_income) || 0;
            const availableBalance = parseFloat(account.available_balance) || 0;

            // Calculate safety buffer
            let safetyBuffer = 0;
            if (prefs.safety_buffer_type === 'percentage') {
                safetyBuffer = availableBalance * (parseFloat(prefs.safety_buffer_amount) / 100);
            } else {
                safetyBuffer = parseFloat(prefs.safety_buffer_amount) || 0;
            }

            const safeToSpend = availableBalance - upcomingBills - safetyBuffer + expectedIncome;

            return {
                account_id: account.id,
                account_name: account.account_name,
                available_balance: availableBalance,
                upcoming_bills: upcomingBills,
                expected_income: expectedIncome,
                safety_buffer: safetyBuffer,
                safe_to_spend: Math.max(0, safeToSpend),
                days_ahead: parseInt(days_ahead)
            };
        });

        // If calculating for all accounts, add a total
        if (id === 'all') {
            const total = accounts.reduce((sum, acc) => ({
                available_balance: sum.available_balance + acc.available_balance,
                upcoming_bills: sum.upcoming_bills + acc.upcoming_bills,
                expected_income: sum.expected_income + acc.expected_income,
                safety_buffer: sum.safety_buffer + acc.safety_buffer,
                safe_to_spend: sum.safe_to_spend + acc.safe_to_spend
            }), {
                available_balance: 0,
                upcoming_bills: 0,
                expected_income: 0,
                safety_buffer: 0,
                safe_to_spend: 0
            });

            res.json({
                success: true,
                data: {
                    accounts,
                    total
                }
            });
        } else {
            res.json({
                success: true,
                data: accounts[0] || null
            });
        }
    } catch (error) {
        console.error('Get safe-to-spend error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating safe-to-spend'
        });
    }
}

module.exports = {
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    getSafeToSpend
};

