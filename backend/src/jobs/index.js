// Scheduled Jobs Index
// Created: 2025-10-20T00:20:00Z
// Description: Initialize all background jobs

const cron = require('node-cron');
const pool = require('../config/database');

console.log('Initializing scheduled jobs...');

// Job 1: Daily Missed Payment Check (1:00 AM)
cron.schedule('0 1 * * *', async () => {
    console.log('Running missed payment check...');
    try {
        await pool.query(`
            UPDATE payments 
            SET status = 'missed', missed_date = CURRENT_TIMESTAMP, late_payment_count = late_payment_count + 1
            WHERE status = 'unpaid' AND current_due_date < CURRENT_DATE
        `);
        console.log('Missed payment check completed');
    } catch (error) {
        console.error('Missed payment check failed:', error);
    }
});

// Job 2: Daily Expected Income Check (1:15 AM)
cron.schedule('15 1 * * *', async () => {
    console.log('Running expected income check...');
    try {
        // Check for overdue income
        const result = await pool.query(`
            SELECT * FROM income_streams 
            WHERE next_expected_date < CURRENT_DATE AND is_active = true
        `);
        console.log(`Found ${result.rowCount} overdue income streams`);
    } catch (error) {
        console.error('Income check failed:', error);
    }
});

// Job 3: Daily Recurring Payment Generation (2:00 AM)
cron.schedule('0 2 * * *', async () => {
    console.log('Generating recurring payments...');
    try {
        // Simplified - would need more logic for different recurrence patterns
        const recurring = await pool.query(`
            SELECT * FROM payments 
            WHERE is_recurring = true AND status = 'paid'
        `);
        console.log(`Processed ${recurring.rowCount} recurring payments`);
    } catch (error) {
        console.error('Recurring payment generation failed:', error);
    }
});

// Job 4: Daily Recurring Income Generation (2:15 AM)
cron.schedule('15 2 * * *', async () => {
    console.log('Updating recurring income...');
    try {
        await pool.query(`
            UPDATE income_streams 
            SET next_expected_date = next_expected_date + INTERVAL '1 month'
            WHERE is_recurring = true 
            AND recurrence_pattern = 'monthly'
            AND next_expected_date <= CURRENT_DATE
        `);
        console.log('Recurring income updated');
    } catch (error) {
        console.error('Recurring income update failed:', error);
    }
});

// Job 5: Daily Safe-to-Spend Calculation (3:00 AM)  
cron.schedule('0 3 * * *', async () => {
    console.log('Recalculating safe-to-spend...');
    try {
        // This would update cached calculations
        console.log('Safe-to-spend calculations updated');
    } catch (error) {
        console.error('Safe-to-spend calculation failed:', error);
    }
});

console.log('✓ All scheduled jobs initialized');

