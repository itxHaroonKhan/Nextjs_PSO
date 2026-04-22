const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔐 Middleware
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

/**
 * 🛠 Helper to ensure columns exist
 */
async function ensureUserColumns() {
  try {
    console.log('🔍 Checking users table structure...');
    const [columns] = await db.query("SHOW COLUMNS FROM users");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('permissions')) {
      await db.query("ALTER TABLE users ADD COLUMN permissions TEXT");
      console.log('✅ Added permissions column');
    }
    if (!columnNames.includes('failedAttempts')) {
      await db.query("ALTER TABLE users ADD COLUMN failedAttempts INT DEFAULT 0");
      console.log('✅ Added failedAttempts column');
    }
    if (!columnNames.includes('lockUntil')) {
      await db.query("ALTER TABLE users ADD COLUMN lockUntil DATETIME NULL");
      console.log('✅ Added lockUntil column');
    }
  } catch (err) {
    console.warn('⚠️ Warning: Could not verify users table structure:', err.message);
  }
}

// Run check on startup, but don't block
ensureUserColumns().catch(e => console.error('Background check failed:', e));

// ===============================
// CREATE USER (Admin ONLY)
// ===============================
router.post(
  '/create-cashier',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      let { name, email, password, role, permissions } = req.body;
      console.log('📥 Registration request:', { name, email, role });

      // Trim inputs
      name = name?.trim();
      email = email?.trim()?.toLowerCase();
      password = password?.trim();

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required."
        });
      }

      // Check if user exists
      const [existing] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists."
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'cashier';
      const userPermissions = JSON.stringify(permissions || []);

      await db.query(
        "INSERT INTO users (name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, userRole, userPermissions]
      );

      res.json({
        success: true,
        message: "User created successfully"
      });

    } catch (err) {
      console.error('❌ Registration Error:', err);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: err.message
      });
    }
  }
);

// ===============================
// LOGIN (WITH LOCK SYSTEM)
// ===============================
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // Trim and normalize
    email = email?.trim()?.toLowerCase();
    password = password?.trim();

    console.log('📥 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required." });
    }

    // 1. Find user
    console.log('🔍 Searching for user in DB...');
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (!rows || rows.length === 0) {
      console.log('❌ User not found');
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const user = rows[0];
    console.log('✅ User found, ID:', user.id);

    // 2. Check lock
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      console.log('🔒 Account is locked');
      return res.status(403).json({ success: false, message: "Account locked. Try again later." });
    }

    // 3. Compare password
    console.log('🔐 Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const attempts = (user.failedAttempts || 0) + 1;
      console.log(`❌ Wrong password. Attempt: ${attempts}`);

      if (attempts >= 3) {
        await db.query("UPDATE users SET failedAttempts = ?, lockUntil = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?", [attempts, user.id]);
        return res.status(403).json({ success: false, message: "Account locked for 30 mins." });
      }

      await db.query("UPDATE users SET failedAttempts = ? WHERE id = ?", [attempts, user.id]);
      return res.status(401).json({ success: false, message: `Invalid password (${attempts}/3).` });
    }

    // 4. Success -> Reset failed attempts
    console.log('✅ Password matched. Resetting attempts...');
    await db.query("UPDATE users SET failedAttempts = 0, lockUntil = NULL WHERE id = ?", [user.id]);

    // 5. Generate Token
    console.log('🎟️ Generating JWT...');
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from .env');
    }

    const permissions = JSON.parse(user.permissions || '[]');

    const token = jwt.sign(
      { id: user.id, role: user.role, permissions },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('🚀 Login successful for:', email);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        permissions
      }
    });

  } catch (err) {
    console.error('❌ LOGIN CRASH:', err);
    res.status(500).json({
      success: false,
      message: "Server login error",
      error: err.message
    });
  }
});

// ===============================
// GET PROFILE
// ===============================
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, role, permissions FROM users WHERE id = ?", [req.user.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    
    const user = rows[0];
    res.json({ 
      success: true, 
      data: {
        ...user,
        permissions: JSON.parse(user.permissions || '[]')
      } 
    });
  } catch (err) {
    console.error('❌ Profile Error:', err);
    res.status(500).json({ success: false, message: "Profile fetch failed", error: err.message });
  }
});

module.exports = router;
