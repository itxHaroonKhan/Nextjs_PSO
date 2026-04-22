const db = require('./db');

async function test() {
  try {
    console.log('--- Checking users table ---');
    const [columns] = await db.query("SHOW COLUMNS FROM users");
    console.log('Columns:', columns.map(c => ({ field: c.Field, type: c.Type })));
    
    console.log('--- Checking for admin user ---');
    const [rows] = await db.query("SELECT id, name, email, role FROM users LIMIT 5");
    console.log('Users:', rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
