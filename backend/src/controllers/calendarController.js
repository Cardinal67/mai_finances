const db = require('../config/database');
const moment = require('moment-timezone');

/**
 * Get calendar data for a date range
 */
async function getCalendar(req, res) {
    const userId = req.user.id;
    const { start_date, end_date, timezone = 'UTC', types } = req.query;

    try {
        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'start_date and end_date are required'
            });
        }

        const includeTypes = types ? types.split(',') : ['payments', 'income', 'reminders'];

        const events = [];

        // Get payments
        if (includeTypes.includes('payments')) {
            const paymentsResult = await db.query(
                `SELECT p.id, p.description as title, p.current_due_date as date, 
                        p.original_amount - COALESCE(
                            (SELECT SUM(pt.amount) 
                             FROM PAYMENT_TRANSACTIONS pt 
                             WHERE pt.payment_id = p.id), 
                            0
                        ) as amount, 
                        p.status, p.payment_type, p.expense_name, p.recipient,
                        c.current_name as contact_name,
                        'payment' as event_type
                 FROM PAYMENTS p
                 LEFT JOIN CONTACTS c ON p.contact_id = c.id
                 WHERE p.user_id = $1
                   AND p.current_due_date BETWEEN $2 AND $3
                   AND p.status NOT IN ('paid_in_full', 'canceled')
                 ORDER BY p.current_due_date ASC`,
                [userId, start_date, end_date]
            );

            events.push(...paymentsResult.rows.map(row => ({
                ...row,
                color: row.payment_type === 'owed_by_me' ? '#ef4444' : '#10b981'
            })));
        }

        // Get income
        if (includeTypes.includes('income')) {
            const incomeResult = await db.query(
                `SELECT i.id, i.source_name as title, i.next_expected_date as date,
                        i.amount, i.source_type,
                        'income' as event_type
                 FROM INCOME_STREAMS i
                 WHERE i.user_id = $1
                   AND i.is_active = true
                   AND i.next_expected_date BETWEEN $2 AND $3
                 ORDER BY i.next_expected_date ASC`,
                [userId, start_date, end_date]
            );

            events.push(...incomeResult.rows.map(row => ({
                ...row,
                color: '#10b981',
                status: 'expected'
            })));
        }

        // Get reminders
        if (includeTypes.includes('reminders')) {
            const remindersResult = await db.query(
                `SELECT r.id, r.message as title, r.reminder_date as date,
                        r.reminder_type, r.is_dismissed,
                        'reminder' as event_type
                 FROM REMINDERS r
                 WHERE r.user_id = $1
                   AND r.reminder_date BETWEEN $2 AND $3
                   AND r.is_dismissed = false
                 ORDER BY r.reminder_date ASC`,
                [userId, start_date, end_date]
            );

            events.push(...remindersResult.rows.map(row => ({
                ...row,
                color: '#f59e0b'
            })));
        }

        // Get spending plans
        if (includeTypes.includes('spending_plans')) {
            const plansResult = await db.query(
                `SELECT sp.id, sp.plan_name as title, sp.planned_date as date,
                        sp.planned_amount as amount, sp.status,
                        'spending_plan' as event_type
                 FROM SPENDING_PLANS sp
                 WHERE sp.user_id = $1
                   AND sp.planned_date BETWEEN $2 AND $3
                   AND sp.status = 'planned'
                 ORDER BY sp.planned_date ASC`,
                [userId, start_date, end_date]
            );

            events.push(...plansResult.rows.map(row => ({
                ...row,
                color: '#8b5cf6'
            })));
        }

        // Sort all events by date
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            success: true,
            data: {
                events,
                date_range: {
                    start: start_date,
                    end: end_date,
                    timezone
                },
                summary: {
                    total_events: events.length,
                    by_type: {
                        payments: events.filter(e => e.event_type === 'payment').length,
                        income: events.filter(e => e.event_type === 'income').length,
                        reminders: events.filter(e => e.event_type === 'reminder').length,
                        spending_plans: events.filter(e => e.event_type === 'spending_plan').length
                    }
                }
            }
        });
    } catch (error) {
        console.error('Get calendar error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving calendar data'
        });
    }
}

module.exports = {
    getCalendar
};

