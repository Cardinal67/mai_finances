const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

async function runMigration() {
    try {
        console.log('Running migration 028...');
        
        const migrationPath = path.join(__dirname, 'src/migrations/028_expenses_recipient.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        await db.query(sql);
        
        console.log('✅ Migration 028 completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration 028 failed:', error.message);
        process.exit(1);
    }
}

runMigration();

