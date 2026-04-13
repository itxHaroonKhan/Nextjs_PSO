const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// CREATE CASHIER
router.post(
  '/create-cashier',
  verifyToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.promise().query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'cashier')",
        [name, email, hashedPassword]
      );

      res.json({
        success: true,
        message: "Cashier created successfully"
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Error creating cashier',
        error: 'Internal server error'
      });
    }
  }
);

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Allow default admin login without database
    if (email === 'admin@elites.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: 1,
          name: 'Admin',
          role: 'admin'
        }
      });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {
      if (err) {
        console.error('Database login error:', err.message);
        // Return user not found instead of 500 error
        return res.json({
          success: false,
          message: "Invalid email or password. Database connection error."
        });
      }

      if (result.length === 0) {
        return res.json({ success: false, message: "User not found" });
      }

      const user = result[0];

      try {
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.json({ success: false, message: "Invalid password" });
        }
      } catch (compareErr) {
        return res.status(500).json({
          success: false,
          message: 'Authentication error',
          error: 'Internal server error'
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: 'Internal server error'
    });
  }
});

module.exports = router;