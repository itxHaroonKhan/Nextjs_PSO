const express = require('express');
const router = express.Router();
const db = require('../db');

// ===============================
// GET ALL CUSTOMERS
// ===============================
router.get('/', (req, res) => {
  const sql = "SELECT * FROM customers";

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Fetch customers error:', err.message);
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: result
    });
  });
});

// ===============================
// GET SINGLE CUSTOMER
// ===============================
router.get('/:id', (req, res) => {
  const sql = "SELECT * FROM customers WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Fetch customer error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to fetch customer' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, data: result[0] });
  });
});

// ===============================
// CREATE CUSTOMER
// ===============================
router.post('/', (req, res) => {
  const { name, email, phone, address, city, pincode, gst_number } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required'
    });
  }

  const sql = `
    INSERT INTO customers
    (name, email, phone, address, city, pincode, gst_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [name, email, phone, address, city, pincode, gst_number], (err, result) => {
    if (err) {
      console.error('Create customer error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to create customer' });
    }

    // Return the created customer
    db.query("SELECT * FROM customers WHERE id = ?", [result.insertId], (err2, rows) => {
      res.json({
        success: true,
        message: "Customer added successfully",
        data: rows[0] || { id: result.insertId, name, email, phone, address, city, pincode, gst_number }
      });
    });
  });
});

// ===============================
// UPDATE CUSTOMER
// ===============================
router.put('/:id', (req, res) => {
  const { name, email, phone, address, city, pincode, gst_number } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required'
    });
  }

  const sql = `
    UPDATE customers
    SET name=?, email=?, phone=?, address=?, city=?, pincode=?, gst_number=?
    WHERE id=?
  `;

  db.query(sql, [name, email, phone, address, city, pincode, gst_number, req.params.id], (err) => {
    if (err) {
      console.error('Update customer error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to update customer' });
    }

    // Return the updated customer
    db.query("SELECT * FROM customers WHERE id = ?", [req.params.id], (err2, rows) => {
      res.json({
        success: true,
        message: "Customer updated successfully",
        data: rows[0] || { id: req.params.id, name, email, phone, address, city, pincode, gst_number }
      });
    });
  });
});

// ===============================
// DELETE CUSTOMER
// ===============================
router.delete('/:id', (req, res) => {
  const sql = "DELETE FROM customers WHERE id=?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error('Delete customer error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to delete customer' });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully"
    });
  });
});

module.exports = router;
