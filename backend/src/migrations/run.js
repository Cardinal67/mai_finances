// Migration Runner
// Created: 2025-10-20T00:06:00Z
// Description: Run all database migrations in order

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigrations() {
    console.log('Starting database migrations...');
    
    // Get all migration files
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
    
    console.log(`Found ${files.length} migration files`);
    
    for (const file of files) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        try {
            await pool.query(sql);
            console.log(`✓ ${file} completed`);
        } catch (error) {
            console.error(`✗ ${file} failed:`, error.message);
            throw error;
        }
    }
    
    console.log('All migrations completed successfully!');
}

runMigrations()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    });

