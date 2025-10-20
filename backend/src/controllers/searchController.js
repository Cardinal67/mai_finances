const db = require('../config/database');

/**
 * Global search across payments, contacts, income, categories
 */
async function globalSearch(req, res) {
    const userId = req.user.id;
    const { q, types, limit = 50 } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Search query must be at least 2 characters'
        });
    }

    const searchTerm = `%${q.trim()}%`;
    const includeTypes = types ? types.split(',') : ['payments', 'contacts', 'income', 'categories'];
    const results = {};

    try {
        // Search payments
        if (includeTypes.includes('payments')) {
            const paymentsResult = await db.query(
                `SELECT p.id, p.description, p.original_amount, p.current_balance, 
                        p.due_date, p.status, p.payment_type,
                        c.current_name as contact_name,
                        'payment' as result_type
                 FROM PAYMENTS p
                 JOIN CONTACTS c ON p.contact_id = c.id
                 WHERE p.user_id = $1
                   AND (p.description ILIKE $2 OR c.current_name ILIKE $2 OR p.notes ILIKE $2)
                 ORDER BY p.updated_at DESC
                 LIMIT $3`,
                [userId, searchTerm, limit]
            );
            results.payments = paymentsResult.rows;
        }

        // Search contacts
        if (includeTypes.includes('contacts')) {
            const contactsResult = await db.query(
                `SELECT c.id, c.current_name, c.contact_type, c.email, c.phone, c.status,
                        'contact' as result_type
                 FROM CONTACTS c
                 WHERE c.user_id = $1
                   AND (c.current_name ILIKE $2 OR c.email ILIKE $2 OR c.notes ILIKE $2)
                 ORDER BY c.updated_at DESC
                 LIMIT $3`,
                [userId, searchTerm, limit]
            );
            results.contacts = contactsResult.rows;
        }

        // Search income streams
        if (includeTypes.includes('income')) {
            const incomeResult = await db.query(
                `SELECT i.id, i.source_name, i.source_type, i.amount, i.is_active,
                        i.next_expected_date,
                        'income' as result_type
                 FROM INCOME_STREAMS i
                 WHERE i.user_id = $1
                   AND (i.source_name ILIKE $2 OR i.notes ILIKE $2)
                 ORDER BY i.updated_at DESC
                 LIMIT $3`,
                [userId, searchTerm, limit]
            );
            results.income = incomeResult.rows;
        }

        // Search categories
        if (includeTypes.includes('categories')) {
            const categoriesResult = await db.query(
                `SELECT c.id, c.name, c.color_code, c.icon, c.is_active,
                        'category' as result_type
                 FROM CATEGORIES c
                 WHERE c.user_id = $1
                   AND c.name ILIKE $2
                 ORDER BY c.name ASC
                 LIMIT $3`,
                [userId, searchTerm, limit]
            );
            results.categories = categoriesResult.rows;
        }

        // Search accounts
        if (includeTypes.includes('accounts')) {
            const accountsResult = await db.query(
                `SELECT a.id, a.account_name, a.account_type, a.institution_name,
                        a.current_balance, a.is_active,
                        'account' as result_type
                 FROM ACCOUNTS a
                 WHERE a.user_id = $1
                   AND (a.account_name ILIKE $2 OR a.institution_name ILIKE $2 OR a.notes ILIKE $2)
                 ORDER BY a.updated_at DESC
                 LIMIT $3`,
                [userId, searchTerm, limit]
            );
            results.accounts = accountsResult.rows;
        }

        // Calculate total results
        const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

        res.json({
            success: true,
            data: {
                query: q,
                results,
                summary: {
                    total: totalResults,
                    by_type: Object.fromEntries(
                        Object.entries(results).map(([key, value]) => [key, value.length])
                    )
                }
            }
        });
    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search'
        });
    }
}

module.exports = {
    globalSearch
};

