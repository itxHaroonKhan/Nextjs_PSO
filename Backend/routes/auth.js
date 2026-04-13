const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { store, getNextId } = require('../dataStore');

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

      // Check if email already exists
      const existingUser = store.users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: getNextId('users'),
        name,
        email,
        password: hashedPassword,
        role: 'cashier'
      };

      store.users.push(newUser);

      res.json({
        success: true,
        message: "Cashier created successfully",
        data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
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

    // Default admin login
    if (email === 'admin@elites.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, role: 'admin', name: 'Admin' },
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

    // Find user in memory
    const user = store.users.find(u => u.email === email);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

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
      { id: user.id, role: user.role, name: user.name },
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
