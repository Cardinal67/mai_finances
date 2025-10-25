// Password Hash Generator for Mai Finances
// Usage: node generate-password-hash.js [password]
// If no password provided, defaults to 'NewPassword123!'

const bcrypt = require('bcrypt');

const password = process.argv[2] || 'NewPassword123!';
const saltRounds = 10;

console.log('\n🔐 Generating Password Hash...\n');
console.log('Password:', password);

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n✅ Hash Generated:\n');
  console.log(hash);
  console.log('\n📋 SQL UPDATE Statement:\n');
  console.log(`UPDATE USERS SET password_hash = '${hash}', updated_at = CURRENT_TIMESTAMP WHERE username = 'YOUR_USERNAME_HERE';`);
  console.log('\n');
});

