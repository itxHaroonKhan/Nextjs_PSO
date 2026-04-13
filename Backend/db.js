const mysql = require("mysql2");
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pos_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.log("⚠️  The server will continue running, but database queries will fail.");
    console.log("💡 Make sure MySQL is running and credentials in .env are correct.");
    // Don't exit - allow server to start for development
  } else {
    console.log("✅ Database connected");
    connection.release();
  }
});

module.exports = db;
