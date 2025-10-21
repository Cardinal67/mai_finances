const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running migration 029_expense_enhancements.sql...');
        
        const migrationPath = path.join(__dirname, 'src', 'migrations', '029_expense_enhancements.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        await db.query(sql);
        
        console.log('✅ Migration 029_expense_enhancements.sql completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Details:', error);
        process.exit(1);
    }
}

runMigration();

