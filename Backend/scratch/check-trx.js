const db = require('../db');

async function checkTrx() {
  try {
    const [rows] = await db.query('SELECT * FROM information_schema.innodb_trx');
    console.log('Transactions:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTrx();
