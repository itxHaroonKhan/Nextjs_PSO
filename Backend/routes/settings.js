const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔐 Middleware
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// ===============================
// GET FULL SETTINGS (Admin + Cashier)
// ===============================
router.get('/', verifyToken, checkRole(['admin', 'cashier']), async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM settings WHERE id = 1");

    res.json({
      success: true,
      data: rows[0] || {}
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching settings"
    });
  }
});

// ===============================
// UPDATE FULL SETTINGS (Admin ONLY)
// ===============================
router.put('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const updates = req.body;

    // ✅ Build dynamic update query
    const fields = [];
    const values = [];
    const allowedFields = ['store_name', 'store_address', 'store_phone', 'store_email', 'store_gstin', 'currency', 'tax_rate', 'items_per_page', 'theme', 'invoice_prefix', 'low_stock_alert'];

    for (const field of allowedFields) {
      if (field in updates) {
        fields.push(`${field} = ?`);
        values.push(updates[field] === '' ? null : updates[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(1);

    const [result] = await db.query(
      `UPDATE settings SET ${fields.join(', ')} WHERE id=?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Settings not found"
      });
    }

    // ✅ Fetch updated settings
    const [updatedRows] = await db.query(
      "SELECT * FROM settings WHERE id = 1"
    );

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: updatedRows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating settings"
    });
  }
});

// ===============================
// GET STORE INFO (Admin + Cashier)
// ===============================
router.get('/store', verifyToken, checkRole(['admin', 'cashier']), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        store_name,
        store_address,
        store_phone,
        store_email,
        store_gstin
      FROM settings
      WHERE id = 1
    `);

    res.json({
      success: true,
      data: rows[0] || {}
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching store info"
    });
  }
});

// ===============================
// UPDATE STORE INFO (Admin ONLY)
// ===============================
router.put('/store', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const {
      store_name,
      store_address,
      store_phone,
      store_email,
      store_gstin
    } = req.body;

    await db.query(`
      UPDATE settings SET 
        store_name = ?, 
        store_address = ?, 
        store_phone = ?, 
        store_email = ?, 
        store_gstin = ?
      WHERE id = 1
    `, [
      store_name,
      store_address,
      store_phone,
      store_email,
      store_gstin
    ]);

    res.json({
      success: true,
      message: "Store info updated successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating store info"
    });
  }
});

// ===============================
// RESET DASHBOARD DATA (Admin ONLY)
// ===============================
router.post('/reset-data', verifyToken, checkRole(['admin']), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Clear sale items first (Foreign Key constraint)
    await connection.query("DELETE FROM sale_items");
    
    // 2. Clear sales
    await connection.query("DELETE FROM sales");

    // Optional: Reset auto-increment
    await connection.query("ALTER TABLE sale_items AUTO_INCREMENT = 1");
    await connection.query("ALTER TABLE sales AUTO_INCREMENT = 1");

    await connection.commit();

    res.json({
      success: true,
      message: "All sales data has been reset to zero successfully."
    });

  } catch (err) {
    await connection.rollback();
    console.error('❌ Reset error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to reset sales data"
    });
  } finally {
    connection.release();
  }
});

module.exports = router;