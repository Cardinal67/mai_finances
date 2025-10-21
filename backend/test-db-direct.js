const db = require('./src/config/database');

async function testDirect() {
  console.log('🔍 Direct Database Test\n');
  
  try {
    // 1. Check if balance_masked column exists
    console.log('1️⃣ Checking if balance_masked column exists...');
    const columnCheck = await db.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_preferences' 
      AND column_name = 'balance_masked'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ balance_masked column does NOT exist!');
      process.exit(1);
    }
    
    console.log('✅ Column exists:', JSON.stringify(columnCheck.rows[0], null, 2));
    
    // 2. Create a test user and preferences
    console.log('\n2️⃣ Creating test user...');
    const userResult = await db.query(`
      INSERT INTO users (username, email, password_hash)
      VALUES ('dbtest${Date.now()}', 'dbtest${Date.now()}@test.com', '$2b$10$test')
      RETURNING id
    `);
    const userId = userResult.rows[0].id;
    console.log(`✅ User created: ${userId}`);
    
    //3. Create preferences with balance_masked
    console.log('\n3️⃣ Creating preferences with balance_masked=TRUE...');
    await db.query(`
      INSERT INTO user_preferences (user_id, timezone, balance_masked)
      VALUES ($1, 'UTC', TRUE)
    `, [userId]);
    console.log('✅ Preferences created');
    
    // 4. Read back the value
    console.log('\n4️⃣ Reading balance_masked value...');
    const readResult = await db.query(`
      SELECT balance_masked FROM user_preferences WHERE user_id = $1
    `, [userId]);
    console.log('Current value:', readResult.rows[0].balance_masked);
    
    // 5. Update to FALSE
    console.log('\n5️⃣ Updating balance_masked to FALSE...');
    const updateResult = await db.query(`
      UPDATE user_preferences 
      SET balance_masked = FALSE 
      WHERE user_id = $1
      RETURNING balance_masked
    `, [userId]);
    console.log('✅ Updated! New value:', updateResult.rows[0].balance_masked);
    
    // 6. Verify the update
    console.log('\n6️⃣ Verifying update...');
    const verifyResult = await db.query(`
      SELECT balance_masked FROM user_preferences WHERE user_id = $1
    `, [userId]);
    console.log('Verified value:', verifyResult.rows[0].balance_masked);
    
    if (verifyResult.rows[0].balance_masked === false) {
      console.log('\n🎉 SUCCESS! Database operations work correctly!');
      console.log('\nThis means the issue is in the backend controller, not the database.');
    } else {
      console.log('\n❌ FAILED! Value did not update correctly.');
    }
    
    // Cleanup
    await db.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('\n🧹 Cleanup complete');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testDirect();

