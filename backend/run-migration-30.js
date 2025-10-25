// Run migration 030 - Security Questions
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  try {
    console.log('\n🔐 Running Migration 030: Security Questions\n');
    
    const migration = fs.readFileSync(
      path.join(__dirname, 'src/migrations/030_security_questions.sql'),
      'utf8'
    );
    
    await pool.query(migration);
    
    console.log('✅ Migration 030 completed successfully!\n');
    console.log('📋 Created:');
    console.log('   - SECURITY_QUESTIONS table');
    console.log('   - Index on user_id\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

runMigration();

