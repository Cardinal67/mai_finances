const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigrations() {
    try {
        console.log('🔄 Starting database migrations...\n');

        // Create migrations tracking table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get all migration files
        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files\n`);

        // Check which migrations have already been run
        const { rows: executedMigrations } = await db.query(
            'SELECT migration_name FROM schema_migrations ORDER BY id'
        );
        const executedSet = new Set(executedMigrations.map(m => m.migration_name));

        let executed = 0;
        let skipped = 0;

        for (const file of files) {
            if (executedSet.has(file)) {
                console.log(`⏭️  Skipping: ${file} (already executed)`);
                skipped++;
                continue;
            }

            console.log(`▶️  Running: ${file}`);
            
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            // Execute the migration
            await db.query(sql);

            // Record the migration
            await db.query(
                'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
                [file]
            );

            console.log(`✅ Completed: ${file}\n`);
            executed++;
        }

        console.log('\n🎉 Migration summary:');
        console.log(`   ✅ Executed: ${executed}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   📊 Total: ${files.length}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();

