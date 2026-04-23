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
      return res.json({ success: false, message: "Invalid email or password." });
    }

    const user = rows[0];
    console.log('✅ User found, ID:', user.id);

    // 2. Check lock
    const now = new Date();
    // Ensure it's a Date object regardless of driver behavior
    let lockTime = null;
    if (user.lockUntil) {
      lockTime = (user.lockUntil instanceof Date) ? user.lockUntil : new Date(user.lockUntil);
    }
    
    if (lockTime && (lockTime.getTime() > (now.getTime() - 2000))) { // 2s buffer
      const remainingMs = lockTime.getTime() - now.getTime();
      const remainingMins = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      console.log(`🔒 Account is locked for ${remainingMins} more mins`);
      return res.json({ 
        success: false, 
        message: `Account locked. Please try again in ${remainingMins} minutes.`,
        lockUntil: lockTime.getTime()
      });
    }

    // 3. Compare password
    console.log('🔐 Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // ✅ Ensure we have a number
      const currentAttempts = parseInt(user.failedAttempts) || 0;
      const newAttempts = currentAttempts + 1;
      
      console.log(`❌ Password mismatch for ${email}. New attempt count: ${newAttempts}`);

      if (newAttempts >= 3) {
        const lockDuration = 30 * 60 * 1000;
        const lockUntil = new Date(Date.now() + lockDuration);
        await db.query("UPDATE users SET failedAttempts = ?, lockUntil = ? WHERE id = ?", [newAttempts, lockUntil, user.id]);
        console.log(`🔒 Account ${email} is now LOCKED for 30 mins.`);
        return res.json({ 
          success: false, 
          message: "Account locked for 30 mins due to 3 failed attempts.",
          lockUntil: lockUntil.getTime()
        });
      }

      await db.query("UPDATE users SET failedAttempts = ? WHERE id = ?", [newAttempts, user.id]);
      return res.json({ 
        success: false, 
        message: `Invalid password. Attempt ${newAttempts} of 3.` 
      });
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
