const express = require('express');
const router = express.Router();
const db = require('../db');

// ===============================
// GET ALL PRODUCTS
// ===============================
router.get('/', (req, res) => {
  const { search = '', category = '' } = req.query;

  let sql = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (search) {
    sql += " AND (name LIKE ? OR sku LIKE ? OR category LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Fetch products error:', err.message);
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: result
    });
  });
});

// ===============================
// GET CATEGORIES
// ===============================
router.get('/categories/list', (req, res) => {
  const sql = "SELECT DISTINCT category FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Fetch categories error:', err.message);
      return res.json({ success: true, data: [] });
    }

    const categories = result.map(r => r.category);

    res.json({
      success: true,
      data: categories
    });
  });
});

// ===============================
// GET SINGLE PRODUCT
// ===============================
router.get('/:id', (req, res) => {
  const sql = "SELECT * FROM products WHERE id=?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Fetch product error:', err.message);
      return res.json({ success: true, data: null });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      data: result[0]
    });
  });
});

// ===============================
// CREATE PRODUCT
// ===============================
router.post('/', (req, res) => {
  const {
    name,
    category,
    sku,
    barcode,
    description,
    selling_price,
    cost_price,
    stock,
    threshold,
    unit_type
  } = req.body;

  if (!name || selling_price == null) {
    return res.status(400).json({
      success: false,
      message: 'Product name and selling price are required'
    });
  }

  const sql = `
    INSERT INTO products
    (name, category, sku, barcode, description, selling_price, cost_price, stock, threshold, unit_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [name, category, sku, barcode, description, selling_price, cost_price, stock || 0, threshold || 10, unit_type],
    (err, result) => {
      if (err) {
        console.error('Create product error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to create product' });
      }

      // Return the created product
      db.query("SELECT * FROM products WHERE id = ?", [result.insertId], (err2, rows) => {
        res.json({
          success: true,
          message: "Product created",
          data: rows[0] || { id: result.insertId, name, category, sku, selling_price, stock: stock || 0 }
        });
      });
    }
  );
});

// ===============================
// UPDATE PRODUCT
// ===============================
router.put('/:id', (req, res) => {
  const {
    name,
    category,
    sku,
    barcode,
    description,
    selling_price,
    cost_price,
    stock,
    threshold,
    unit_type
  } = req.body;

  if (!name || selling_price == null) {
    return res.status(400).json({
      success: false,
      message: 'Product name and selling price are required'
    });
  }

  const sql = `
    UPDATE products
    SET name=?, category=?, sku=?, barcode=?, description=?, selling_price=?, cost_price=?, stock=?, threshold=?, unit_type=?
    WHERE id=?
  `;

  db.query(
    sql,
    [name, category, sku, barcode, description, selling_price, cost_price, stock || 0, threshold || 10, unit_type, req.params.id],
    (err) => {
      if (err) {
        console.error('Update product error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to update product' });
      }

      // Return the updated product
      db.query("SELECT * FROM products WHERE id = ?", [req.params.id], (err2, rows) => {
        res.json({
          success: true,
          message: "Product updated",
          data: rows[0] || { id: req.params.id, name, category, sku, selling_price, stock: stock || 0 }
        });
      });
    }
  );
});

// ===============================
// DELETE PRODUCT
// ===============================
router.delete('/:id', (req, res) => {
  const sql = "DELETE FROM products WHERE id=?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error('Delete product error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to delete product' });
    }

    res.json({
      success: true,
      message: "Product deleted"
    });
  });
});

module.exports = router;