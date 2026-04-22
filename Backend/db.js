const mysql = require("mysql2");
require('dotenv').config();

// Validate required environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Missing required database configuration in .env file');
  console.error('Required: DB_HOST, DB_USER, DB_NAME');
  process.exit(1);
}

// Create a connection pool (supports transactions via getConnection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the promise-based version
const promisePool = pool.promise();

// Test connection
promisePool.getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    console.error("Please check:");
    console.error("1. MySQL is running");
    console.error("2. Database 'elites_pos' exists");
    console.error("3. Credentials in .env are correct");
  });

module.exports = promisePool;