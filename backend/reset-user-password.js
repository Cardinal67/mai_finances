// Reset User Password
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const username = process.argv[2];
const newPassword = process.argv[3] || 'NewPassword123!';

async function resetPassword() {
  if (!username) {
    console.log('\n❌ Error: Username required\n');
    console.log('Usage: node reset-user-password.js [username] [new-password]');
    console.log('Example: node reset-user-password.js testuser MyNewPass123!\n');
    console.log('If no password provided, defaults to: NewPassword123!\n');
    process.exit(1);
  }

  try {
    console.log('\n🔐 Resetting password...\n');
    console.log(`Username: ${username}`);
    console.log(`New Password: ${newPassword}`);
    console.log('\n⏳ Generating hash...');
    
    // Check if user exists
    const checkUser = await pool.query(
      'SELECT id, username, email FROM USERS WHERE username = $1',
      [username]
    );
    
    if (checkUser.rows.length === 0) {
      console.log(`\n❌ User "${username}" not found in database.\n`);
      console.log('💡 To see all users, run: node query-users.js\n');
      await pool.end();
      process.exit(1);
    }
    
    const user = checkUser.rows[0];
    
    // Generate hash
    const hash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE USERS SET password_hash = $1 WHERE username = $2',
      [hash, username]
    );
    
    console.log('\n✅ Password reset successfully!\n');
    console.log('User Details:');
    console.log(`  Username: ${user.username}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  User ID:  ${user.id}`);
    console.log(`\n🔓 New Password: ${newPassword}`);
    console.log('\n💡 You can now login at: http://localhost:3000/login\n');
    
  } catch (error) {
    console.error('\n❌ Error resetting password:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();

