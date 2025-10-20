const db = require('../config/database');
const moment = require('moment-timezone');

/**
 * Get comprehensive dashboard summary
 */
async function getDashboardSummary(req, res) {
    const userId = req.user.id;
    const { days_ahead = 30, timezone = 'UTC' } = req.query;

    try {
        // Get user preferences
        const prefsResult = await db.query(
            `SELECT date_range_preference, timezone, safety_buffer_type, safety_buffer_amount, 
                    default_currency
             FROM USER_PREFERENCES WHERE user_id = $1`,
            [userId]
        );

        const prefs = prefsResult.rows[0] || {
            date_range_preference: 30,
            timezone: 'UTC',
            safety_buffer_type: 'fixed',
            safety_buffer_amount: 0,
            default_currency: 'USD'
        };

        const effectiveDaysAhead = days_ahead || prefs.date_range_preference;
        const effectiveTimezone = timezone || prefs.timezone;

        // Calculate date range
        const now = moment().tz(effectiveTimezone);
        const endDate = moment(now).add(effectiveDaysAhead, 'days');

        // Get upcoming bills (payments owed by me)
        const upcomingBills = await db.query(
            `SELECT p.*, c.current_name as contact_name
             FROM PAYMENTS p
             JOIN CONTACTS c ON p.contact_id = c.id
             WHERE p.user_id = $1
               AND p.payment_type = 'owed_by_me'
               AND p.status NOT IN ('paid_in_full', 'canceled')
               AND p.current_due_date BETWEEN $2 AND $3
             ORDER BY p.current_due_date ASC
             LIMIT 10`,
            [userId, now.toISOString(), endDate.toISOString()]
        );

        // Get upcoming income
        const upcomingIncome = await db.query(
            `SELECT i.*, a.account_name as to_account_name
             FROM INCOME_STREAMS i
             LEFT JOIN ACCOUNTS a ON i.to_account_id = a.id
             WHERE i.user_id = $1
               AND i.is_active = true
               AND i.next_expected_date BETWEEN $2 AND $3
             ORDER BY i.next_expected_date ASC
             LIMIT 10`,
            [userId, now.toISOString(), endDate.toISOString()]
        );

        // Calculate safe-to-spend
        const accountsResult = await db.query(
            `SELECT 
                SUM(available_balance) as total_available,
                COUNT(*) as account_count
             FROM ACCOUNTS
             WHERE user_id = $1 AND is_active = true`,
            [userId]
        );

        const totalAvailable = parseFloat(accountsResult.rows[0].total_available) || 0;
        const totalUpcomingBills = upcomingBills.rows.reduce((sum, bill) => 
            sum + parseFloat(bill.current_balance), 0
        );
        const totalExpectedIncome = upcomingIncome.rows.reduce((sum, income) => 
            sum + parseFloat(income.amount), 0
        );

        let safetyBuffer = 0;
        if (prefs.safety_buffer_type === 'percentage') {
            safetyBuffer = totalAvailable * (parseFloat(prefs.safety_buffer_amount) / 100);
        } else {
            safetyBuffer = parseFloat(prefs.safety_buffer_amount) || 0;
        }

        const safeToSpend = Math.max(0, totalAvailable - totalUpcomingBills - safetyBuffer + totalExpectedIncome);

        // Get overdue payments
        const overduePayments = await db.query(
            `SELECT p.*, c.current_name as contact_name
             FROM PAYMENTS p
             JOIN CONTACTS c ON p.contact_id = c.id
             WHERE p.user_id = $1
               AND p.payment_type = 'owed_by_me'
               AND p.status IN ('unpaid', 'partially_paid')
               AND p.current_due_date < $2
             ORDER BY p.current_due_date ASC`,
            [userId, now.toISOString()]
        );

        // Get overdue income
        const overdueIncome = await db.query(
            `SELECT i.*, a.account_name as to_account_name
             FROM INCOME_STREAMS i
             LEFT JOIN ACCOUNTS a ON i.to_account_id = a.id
             WHERE i.user_id = $1
               AND i.is_active = true
               AND i.next_expected_date < $2
             ORDER BY i.next_expected_date ASC`,
            [userId, now.toISOString()]
        );

        // Get recent transactions (last 10)
        const recentTransactions = await db.query(
            `(SELECT 
                'payment' as type,
                pt.id,
                pt.transaction_date as date,
                pt.amount,
                p.description,
                c.current_name as counterparty
             FROM PAYMENT_TRANSACTIONS pt
             JOIN PAYMENTS p ON pt.payment_id = p.id
             JOIN CONTACTS c ON p.contact_id = c.id
             WHERE p.user_id = $1)
            UNION ALL
            (SELECT 
                'income' as type,
                it.id,
                it.received_date as date,
                it.amount,
                i.source_name as description,
                i.source_name as counterparty
             FROM INCOME_TRANSACTIONS it
             JOIN INCOME_STREAMS i ON it.income_stream_id = i.id
             WHERE i.user_id = $1)
            ORDER BY date DESC
            LIMIT 10`,
            [userId]
        );

        // Get all accounts summary
        const accounts = await db.query(
            `SELECT id, account_name, account_type, current_balance, available_balance, is_active
             FROM ACCOUNTS
             WHERE user_id = $1
             ORDER BY is_active DESC, account_name ASC`,
            [userId]
        );

        // Generate alerts
        const alerts = [];

        if (overduePayments.rows.length > 0) {
            alerts.push({
                type: 'error',
                title: `${overduePayments.rows.length} Overdue Payment${overduePayments.rows.length > 1 ? 's' : ''}`,
                message: `You have ${overduePayments.rows.length} payment(s) past due.`,
                action: '/payments?status=overdue'
            });
        }

        if (overdueIncome.rows.length > 0) {
            alerts.push({
                type: 'warning',
                title: `${overdueIncome.rows.length} Missing Income`,
                message: `Expected income has not been received.`,
                action: '/income?status=overdue'
            });
        }

        if (safeToSpend < 0) {
            alerts.push({
                type: 'error',
                title: 'Negative Safe-to-Spend',
                message: 'Your upcoming bills exceed your available balance.',
                action: '/accounts'
            });
        } else if (safeToSpend < safetyBuffer) {
            alerts.push({
                type: 'warning',
                title: 'Low Safe-to-Spend',
                message: 'Your safe-to-spend amount is below your safety buffer.',
                action: '/accounts'
            });
        }

        // Response
        res.json({
            success: true,
            data: {
                summary: {
                    total_available: totalAvailable,
                    total_upcoming_bills: totalUpcomingBills,
                    total_expected_income: totalExpectedIncome,
                    safety_buffer: safetyBuffer,
                    safe_to_spend: safeToSpend,
                    account_count: parseInt(accountsResult.rows[0].account_count),
                    days_ahead: parseInt(effectiveDaysAhead),
                    timezone: effectiveTimezone,
                    currency: prefs.default_currency
                },
                upcoming_bills: upcomingBills.rows,
                upcoming_income: upcomingIncome.rows,
                overdue_payments: overduePayments.rows,
                overdue_income: overdueIncome.rows,
                recent_transactions: recentTransactions.rows,
                accounts: accounts.rows,
                alerts
            }
        });
    } catch (error) {
        console.error('Get dashboard summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard data'
        });
    }
}

/**
 * Calculate what-if spending scenario
 */
async function calculateWhatIfSpending(req, res) {
    const userId = req.user.id;
    const { planned_amount, planned_date, from_account_id, days_ahead = 30 } = req.body;

    try {
        // Get user preferences
        const prefsResult = await db.query(
            'SELECT safety_buffer_type, safety_buffer_amount FROM USER_PREFERENCES WHERE user_id = $1',
            [userId]
        );

        const prefs = prefsResult.rows[0] || { safety_buffer_type: 'fixed', safety_buffer_amount: 0 };

        const now = moment();
        const spendDate = planned_date ? moment(planned_date) : now;
        const endDate = moment(spendDate).add(days_ahead, 'days');

        // Get account balance
        let accountBalance = 0;
        if (from_account_id) {
            const accountResult = await db.query(
                'SELECT available_balance FROM ACCOUNTS WHERE id = $1 AND user_id = $2',
                [from_account_id, userId]
            );

            if (accountResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }

            accountBalance = parseFloat(accountResult.rows[0].available_balance);
        } else {
            // Calculate total across all accounts
            const totalResult = await db.query(
                'SELECT SUM(available_balance) as total FROM ACCOUNTS WHERE user_id = $1 AND is_active = true',
                [userId]
            );
            accountBalance = parseFloat(totalResult.rows[0].total) || 0;
        }

        // Get upcoming bills between now and planned spend date + days_ahead
        const upcomingBillsResult = await db.query(
            `SELECT SUM(current_balance) as total
             FROM PAYMENTS
             WHERE user_id = $1
               AND payment_type = 'owed_by_me'
               AND status NOT IN ('paid_in_full', 'canceled')
               AND current_due_date BETWEEN $2 AND $3`,
            [userId, now.toISOString(), endDate.toISOString()]
        );

        const upcomingBills = parseFloat(upcomingBillsResult.rows[0].total) || 0;

        // Get expected income
        const expectedIncomeResult = await db.query(
            `SELECT SUM(amount) as total
             FROM INCOME_STREAMS
             WHERE user_id = $1
               AND is_active = true
               AND next_expected_date BETWEEN $2 AND $3`,
            [userId, now.toISOString(), endDate.toISOString()]
        );

        const expectedIncome = parseFloat(expectedIncomeResult.rows[0].total) || 0;

        // Calculate safety buffer
        let safetyBuffer = 0;
        if (prefs.safety_buffer_type === 'percentage') {
            safetyBuffer = accountBalance * (parseFloat(prefs.safety_buffer_amount) / 100);
        } else {
            safetyBuffer = parseFloat(prefs.safety_buffer_amount) || 0;
        }

        // Calculations
        const beforeSpending = accountBalance - upcomingBills - safetyBuffer + expectedIncome;
        const afterSpending = beforeSpending - parseFloat(planned_amount);
        const impact = parseFloat(planned_amount);
        const canAfford = afterSpending >= 0;

        res.json({
            success: true,
            data: {
                scenario: {
                    planned_amount: parseFloat(planned_amount),
                    planned_date: spendDate.format('YYYY-MM-DD'),
                    from_account_id: from_account_id || 'all',
                    days_ahead: parseInt(days_ahead)
                },
                current_state: {
                    account_balance: accountBalance,
                    upcoming_bills: upcomingBills,
                    expected_income: expectedIncome,
                    safety_buffer: safetyBuffer,
                    safe_to_spend_now: beforeSpending
                },
                after_spending: {
                    remaining_balance: accountBalance - impact,
                    safe_to_spend: afterSpending,
                    impact,
                    can_afford: canAfford
                },
                recommendation: canAfford 
                    ? 'You can afford this purchase while maintaining your safety buffer.'
                    : 'This purchase would exceed your safe-to-spend amount.',
                warning: afterSpending < 0 ? 'This would result in a negative safe-to-spend balance.' : null
            }
        });
    } catch (error) {
        console.error('Calculate what-if spending error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating what-if scenario'
        });
    }
}

module.exports = {
    getDashboardSummary,
    calculateWhatIfSpending
};

