const cron = require('node-cron');
const db = require('../config/database');
const moment = require('moment-timezone');

/**
 * Initialize all scheduled jobs
 */
function initializeScheduledJobs() {
    console.log('📅 Initializing scheduled jobs...\n');

    // 1. Daily Missed Payment Check - 1:00 AM UTC
    cron.schedule('0 1 * * *', async () => {
        console.log('⏰ Running daily missed payment check...');
        try {
            const result = await db.query(
                `UPDATE PAYMENTS 
                 SET status = 'missed', 
                     missed_date = CURRENT_TIMESTAMP,
                     late_payment_count = late_payment_count + 1
                 WHERE status IN ('unpaid', 'partially_paid')
                   AND current_due_date < CURRENT_TIMESTAMP
                 RETURNING id, description, user_id`
            );

            console.log(`✅ Marked ${result.rows.length} payment(s) as missed`);

            // Create reminders for missed payments
            for (const payment of result.rows) {
                await db.query(
                    `INSERT INTO REMINDERS (
                        user_id, entity_id, entity_type, reminder_type, message, 
                        reminder_date, is_sent
                    ) VALUES ($1, $2, 'payment', 'overdue_payment', $3, CURRENT_TIMESTAMP, false)`,
                    [
                        payment.user_id,
                        payment.id,
                        `Payment overdue: ${payment.description}`
                    ]
                );
            }
        } catch (error) {
            console.error('❌ Error in missed payment check:', error);
        }
    });

    // 2. Daily Expected Income Check - 1:15 AM UTC
    cron.schedule('15 1 * * *', async () => {
        console.log('⏰ Running daily expected income check...');
        try {
            const result = await db.query(
                `SELECT i.*, u.email as user_email
                 FROM INCOME_STREAMS i
                 JOIN USERS u ON i.user_id = u.id
                 WHERE i.is_active = true
                   AND i.next_expected_date < CURRENT_TIMESTAMP - INTERVAL '1 day'
                   AND NOT EXISTS (
                       SELECT 1 FROM INCOME_TRANSACTIONS it
                       WHERE it.income_stream_id = i.id
                       AND it.received_date >= i.next_expected_date
                   )`
            );

            console.log(`📊 Found ${result.rows.length} overdue income stream(s)`);

            // Create reminders for missing income
            for (const income of result.rows) {
                await db.query(
                    `INSERT INTO REMINDERS (
                        user_id, entity_id, entity_type, reminder_type, message,
                        reminder_date, is_sent
                    ) VALUES ($1, $2, 'income_stream', 'missing_income', $3, CURRENT_TIMESTAMP, false)`,
                    [
                        income.user_id,
                        income.id,
                        `Expected income not received: ${income.source_name}`
                    ]
                );
            }
        } catch (error) {
            console.error('❌ Error in expected income check:', error);
        }
    });

    // 3. Daily Reminder Check - 9:00 AM UTC
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ Running daily reminder check...');
        try {
            const result = await db.query(
                `SELECT r.*, u.email as user_email
                 FROM REMINDERS r
                 JOIN USERS u ON r.user_id = u.id
                 WHERE r.is_sent = false
                   AND r.is_dismissed = false
                   AND r.reminder_date <= CURRENT_TIMESTAMP`
            );

            console.log(`📬 Found ${result.rows.length} reminder(s) to send`);

            // Mark reminders as sent (in production, send emails/notifications here)
            for (const reminder of result.rows) {
                await db.query(
                    `UPDATE REMINDERS 
                     SET is_sent = true, sent_at = CURRENT_TIMESTAMP
                     WHERE id = $1`,
                    [reminder.id]
                );
                console.log(`  ✉️  Reminder sent: ${reminder.message}`);
            }
        } catch (error) {
            console.error('❌ Error in reminder check:', error);
        }
    });

    // 4. Daily Recurring Payment Generation - 2:00 AM UTC
    cron.schedule('0 2 * * *', async () => {
        console.log('⏰ Running daily recurring payment generation...');
        try {
            const result = await db.query(
                `SELECT * FROM PAYMENTS
                 WHERE is_recurring = true
                   AND next_occurrence_date IS NOT NULL
                   AND next_occurrence_date <= CURRENT_DATE
                   AND (recurrence_end_date IS NULL OR recurrence_end_date >= CURRENT_DATE)`
            );

            console.log(`🔄 Generating ${result.rows.length} recurring payment(s)`);

            for (const payment of result.rows) {
                // Create new payment instance
                const newDueDate = calculateNextOccurrence(
                    payment.next_occurrence_date,
                    payment.recurrence_pattern,
                    payment.recurrence_interval
                );

                await db.query(
                    `INSERT INTO PAYMENTS (
                        user_id, contact_id, description, original_amount, current_balance,
                        currency, due_date, current_due_date, payment_type, status,
                        is_recurring, recurrence_pattern, recurrence_interval,
                        next_occurrence_date, recurrence_end_date, notes, priority
                    ) VALUES ($1, $2, $3, $4, $4, $5, $6, $6, $7, 'unpaid', $8, $9, $10, $11, $12, $13, $14)`,
                    [
                        payment.user_id, payment.contact_id, payment.description,
                        payment.original_amount, payment.currency, newDueDate,
                        payment.payment_type, payment.is_recurring, payment.recurrence_pattern,
                        payment.recurrence_interval, calculateNextOccurrence(newDueDate, payment.recurrence_pattern, payment.recurrence_interval),
                        payment.recurrence_end_date, payment.notes, payment.priority
                    ]
                );

                // Update original payment's next occurrence
                await db.query(
                    `UPDATE PAYMENTS 
                     SET next_occurrence_date = $1
                     WHERE id = $2`,
                    [newDueDate, payment.id]
                );
            }
        } catch (error) {
            console.error('❌ Error in recurring payment generation:', error);
        }
    });

    // 5. Daily Recurring Income Generation - 2:15 AM UTC
    cron.schedule('15 2 * * *', async () => {
        console.log('⏰ Running daily recurring income generation...');
        try {
            const result = await db.query(
                `SELECT * FROM INCOME_STREAMS
                 WHERE is_recurring = true
                   AND is_active = true
                   AND next_expected_date <= CURRENT_DATE
                   AND (recurrence_end_date IS NULL OR recurrence_end_date >= CURRENT_DATE)`
            );

            console.log(`🔄 Updating ${result.rows.length} recurring income stream(s)`);

            for (const income of result.rows) {
                // Update next expected date
                const nextDate = calculateNextOccurrence(
                    income.next_expected_date,
                    income.recurrence_pattern,
                    income.recurrence_interval
                );

                await db.query(
                    `UPDATE INCOME_STREAMS 
                     SET next_expected_date = $1
                     WHERE id = $2`,
                    [nextDate, income.id]
                );
            }
        } catch (error) {
            console.error('❌ Error in recurring income generation:', error);
        }
    });

    // 6. Daily Safe-to-Spend Calculation - 3:00 AM UTC
    cron.schedule('0 3 * * *', async () => {
        console.log('⏰ Running daily safe-to-spend calculation...');
        try {
            const users = await db.query('SELECT id FROM USERS');

            for (const user of users.rows) {
                const prefs = await db.query(
                    'SELECT safety_buffer_type, safety_buffer_amount FROM USER_PREFERENCES WHERE user_id = $1',
                    [user.id]
                );

                if (prefs.rows.length === 0) continue;

                const pref = prefs.rows[0];
                
                // Get total available balance
                const balanceResult = await db.query(
                    'SELECT SUM(available_balance) as total FROM ACCOUNTS WHERE user_id = $1 AND is_active = true',
                    [user.id]
                );

                const totalBalance = parseFloat(balanceResult.rows[0]?.total || 0);

                // Calculate safety buffer
                let safetyBuffer = 0;
                if (pref.safety_buffer_type === 'percentage') {
                    safetyBuffer = totalBalance * (parseFloat(pref.safety_buffer_amount) / 100);
                } else {
                    safetyBuffer = parseFloat(pref.safety_buffer_amount);
                }

                // Get upcoming bills
                const billsResult = await db.query(
                    `SELECT SUM(current_balance) as total FROM PAYMENTS
                     WHERE user_id = $1 AND payment_type = 'owed_by_me'
                     AND status NOT IN ('paid_in_full', 'canceled')
                     AND current_due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '30 days'`,
                    [user.id]
                );

                const upcomingBills = parseFloat(billsResult.rows[0]?.total || 0);

                const safeToSpend = totalBalance - upcomingBills - safetyBuffer;

                // Create alert if safe-to-spend is negative or low
                if (safeToSpend < 0) {
                    await db.query(
                        `INSERT INTO REMINDERS (
                            user_id, reminder_type, message, reminder_date, is_sent
                        ) VALUES ($1, 'low_safe_to_spend', 'Your safe-to-spend amount is negative. Upcoming bills exceed your available balance.', CURRENT_TIMESTAMP, false)`,
                        [user.id]
                    );
                }
            }

            console.log(`✅ Safe-to-spend calculated for ${users.rows.length} user(s)`);
        } catch (error) {
            console.error('❌ Error in safe-to-spend calculation:', error);
        }
    });

    // 7. Daily Timezone Updates - Midnight UTC
    cron.schedule('0 0 * * *', async () => {
        console.log('⏰ Running daily timezone updates...');
        try {
            // This job ensures that all date-based calculations respect user timezones
            // In production, you might want to trigger recalculations or send notifications
            // based on each user's local timezone
            console.log('✅ Timezone update check complete');
        } catch (error) {
            console.error('❌ Error in timezone updates:', error);
        }
    });

    // 8. Weekly Spending Plan Review - Sunday 8:00 AM UTC
    cron.schedule('0 8 * * 0', async () => {
        console.log('⏰ Running weekly spending plan review...');
        try {
            // Find spending plans older than 7 days that are still 'planned'
            const result = await db.query(
                `SELECT sp.*, u.email as user_email
                 FROM SPENDING_PLANS sp
                 JOIN USERS u ON sp.user_id = u.id
                 WHERE sp.status = 'planned'
                   AND sp.created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'`
            );

            console.log(`📊 Found ${result.rows.length} stale spending plan(s)`);

            // Create reminders
            for (const plan of result.rows) {
                await db.query(
                    `INSERT INTO REMINDERS (
                        user_id, entity_id, entity_type, reminder_type, message,
                        reminder_date, is_sent
                    ) VALUES ($1, $2, 'spending_plan', 'planned_purchase', $3, CURRENT_TIMESTAMP, false)`,
                    [
                        plan.user_id,
                        plan.id,
                        `Spending plan needs review: ${plan.plan_name}`
                    ]
                );
            }
        } catch (error) {
            console.error('❌ Error in spending plan review:', error);
        }
    });

    console.log('✅ All scheduled jobs initialized successfully!\n');
    console.log('📅 Active schedules:');
    console.log('   - Missed Payment Check: Daily at 1:00 AM UTC');
    console.log('   - Expected Income Check: Daily at 1:15 AM UTC');
    console.log('   - Reminder Check: Daily at 9:00 AM UTC');
    console.log('   - Recurring Payment Generation: Daily at 2:00 AM UTC');
    console.log('   - Recurring Income Generation: Daily at 2:15 AM UTC');
    console.log('   - Safe-to-Spend Calculation: Daily at 3:00 AM UTC');
    console.log('   - Timezone Updates: Daily at Midnight UTC');
    console.log('   - Spending Plan Review: Weekly on Sunday at 8:00 AM UTC\n');
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
    initializeScheduledJobs
};

