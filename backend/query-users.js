// Query Users from Database
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function queryUsers() {
  try {
    console.log('\n🔍 Querying database for users...\n');
    
    const result = await pool.query(`
      SELECT id, username, email, created_at 
      FROM USERS 
      ORDER BY created_at DESC
    `);
    
    console.log('📊 USERS IN DATABASE:\n');
    console.log('='.repeat(60));
    
    if (result.rows.length === 0) {
      console.log('\n❌ No users found in database.');
      console.log('\n💡 Create a new user by registering at:');
      console.log('   http://localhost:3000/register\n');
    } else {
      result.rows.forEach((user, i) => {
        console.log(`\n${i + 1}. USERNAME: ${user.username}`);
        console.log(`   Email:    ${user.email}`);
        console.log(`   Created:  ${user.created_at.toLocaleString()}`);
        console.log(`   User ID:  ${user.id}`);
      });
      
      console.log('\n' + '='.repeat(60));
      console.log(`\n✅ Total Users: ${result.rows.length}\n`);
      
      console.log('🔐 Password Information:');
      console.log('   - Passwords are bcrypt hashed and cannot be retrieved');
      console.log('   - To reset a password, use: node reset-user-password.js [username]\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error querying database:', error.message);
  } finally {
    await pool.end();
  }
}

queryUsers();

