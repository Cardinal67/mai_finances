// Migration script to add admin role
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('🔗 Connected to database');

        const sqlPath = path.join(__dirname, 'src/migrations/031_add_admin_role.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Running migration: 031_add_admin_role');
        await client.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('👤 Cardinal is now an admin user');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();

