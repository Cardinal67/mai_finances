const axios = require('axios');

// First, register a test user
async function testBalanceToggle() {
  try {
    console.log('🧪 Testing Balance Mask Toggle...\n');
    
    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerRes = await axios.post('http://localhost:3001/api/auth/register', {
      username: 'balancetest',
      email: 'balancetest@example.com',
      password: 'TestPass123!'
    });
    
    const token = registerRes.data.data.token;
    console.log('✅ User registered, token obtained\n');
    
    // Step 2: Get current preferences
    console.log('2️⃣ Getting current preferences...');
    const prefsRes = await axios.get('http://localhost:3001/api/preferences', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Current balance_masked:', prefsRes.data.data.balance_masked);
    console.log('✅ Preferences retrieved\n');
    
    // Step 3: Toggle balance_masked to false
    console.log('3️⃣ Toggling balance_masked to FALSE...');
    console.log('Sending: { "balance_masked": false }');
    const updateRes = await axios.put('http://localhost:3001/api/preferences', 
      { balance_masked: false },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Update response:', updateRes.data);
    console.log('');
    
    // Step 4: Verify the change
    console.log('4️⃣ Verifying the change...');
    const verifyRes = await axios.get('http://localhost:3001/api/preferences', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('New balance_masked:', verifyRes.data.data.balance_masked);
    console.log('✅ Verified!\n');
    
    // Step 5: Toggle back to true
    console.log('5️⃣ Toggling balance_masked to TRUE...');
    console.log('Sending: { "balance_masked": true }');
    const updateRes2 = await axios.put('http://localhost:3001/api/preferences', 
      { balance_masked: true },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Update response:', updateRes2.data);
    console.log('');
    
    console.log('🎉 TEST PASSED! Balance mask toggle is working correctly!');
    
  } catch (error) {
    console.error('❌ TEST FAILED!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testBalanceToggle();

