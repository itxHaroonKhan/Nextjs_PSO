const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔐 Middleware
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// ===============================
// APPLY AUTH TO ALL ROUTES
// ===============================
router.use(verifyToken);

// ===============================
// GET ALL CUSTOMERS (Admin + Cashier)
// ===============================
router.get('/', checkRole(['admin', 'cashier']), async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(s.id) AS totalOrders,
        IFNULL(SUM(s.final_total), 0) AS totalSpent
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE c.phone IS NOT NULL AND c.phone != ''
      GROUP BY c.id
      ORDER BY c.id DESC
    `;
    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching customers"
    });
  }
});

// ===============================
// GET SINGLE CUSTOMER
// ===============================
router.get('/:id', checkRole(['admin', 'cashier']), async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.*,
        COUNT(s.id) AS totalOrders,
        IFNULL(SUM(s.final_total), 0) AS totalSpent
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE c.id = ?
      GROUP BY c.id
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching customer"
    });
  }
});

// ===============================
// CREATE CUSTOMER
// ===============================
router.post('/', checkRole(['admin', 'cashier']), async (req, res) => {
  try {
    const { name, email, phone, address, city, pincode, gst_number } = req.body;

    // ✅ Basic validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required"
      });
    }

    const [result] = await db.query(
      `INSERT INTO customers 
      (name, email, phone, address, city, pincode, gst_number, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, phone, address, city, pincode, gst_number]
    );

    res.json({
      success: true,
      message: "Customer created successfully",
      id: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error creating customer"
    });
  }
});

// ===============================
// UPDATE CUSTOMER (Admin ONLY)
// ===============================
router.put('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // ✅ Check if customer exists
    const [existing] = await db.query(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // ✅ Build dynamic update query
    const fields = [];
    const values = [];
    const allowedFields = ['name', 'email', 'phone', 'address', 'city', 'pincode', 'gst_number'];

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

    values.push(id);

    const [result] = await db.query(
      `UPDATE customers SET ${fields.join(', ')} WHERE id=?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // ✅ Fetch updated customer
    const [updatedRows] = await db.query(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: updatedRows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating customer"
    });
  }
});

// ===============================
// DELETE CUSTOMER (Admin ONLY)
// ===============================
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM customers WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting customer"
    });
  }
});

module.exports = router;