const db = require('../db');

async function checkProcesses() {
  try {
    const [rows] = await db.query('SHOW PROCESSLIST');
    console.log('Processes:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkProcesses();
