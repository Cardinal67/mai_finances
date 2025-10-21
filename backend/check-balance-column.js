const db = require('./src/config/database');

db.query(`
  SELECT column_name, data_type, column_default 
  FROM information_schema.columns 
  WHERE table_name = 'user_preferences' 
  AND column_name LIKE '%balance%'
`).then(result => {
  console.log('Balance-related columns in USER_PREFERENCES:');
  console.log(JSON.stringify(result.rows, null, 2));
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

