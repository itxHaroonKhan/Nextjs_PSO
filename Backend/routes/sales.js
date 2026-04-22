const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔐 Middleware
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// ===============================
// CREATE SALE (Admin + Cashier)
// ===============================
router.post('/', verifyToken, checkRole(['admin', 'cashier']), async (req, res) => {
  const { customer_id: provided_id, items, discount = 0, payment_method, amount_paid, tax: frontendTax, customer_name, customer_phone } = req.body;

  console.log('📥 Sale request received:', {
    items: items?.length,
    payment_method,
    amount_paid,
    customer_id: provided_id || 'Walk-in',
    customer_name,
    customer_phone
  });

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No items provided in cart"
    });
  }

  // ✅ Validate amount_paid
  if (amount_paid === undefined || amount_paid === null || typeof amount_paid !== 'number') {
    return res.status(400).json({
      success: false,
      message: "Valid payment amount is required"
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let customer_id = provided_id;

    // ✅ Auto-create/find customer if name provided
    if (customer_name && !customer_id) {
      // Check if customer exists with this phone (if provided)
      if (customer_phone) {
        const [existing] = await connection.query(
          "SELECT id FROM customers WHERE phone = ?",
          [customer_phone]
        );
        if (existing.length > 0) {
          customer_id = existing[0].id;
        }
      }

      // If still no ID, create new customer
      if (!customer_id) {
        const [newCustomer] = await connection.query(
          "INSERT INTO customers (name, phone, created_at) VALUES (?, ?, NOW())",
          [customer_name, customer_phone || null]
        );
        customer_id = newCustomer.insertId;
      }
    }

    // ✅ Calculate totals
    let subtotal = 0;
    for (let item of items) {
      subtotal += item.quantity * item.price;
    }

    // Use frontend tax if provided, otherwise default to 0 or calculate
    let tax = frontendTax !== undefined ? frontendTax : 0;
    
    // trust the amount_paid 
    const final_total = amount_paid;

    // ✅ Insert Sale (handle null customer_id)
    const [saleResult] = await connection.query(
      `INSERT INTO sales
      (customer_id, total, discount, tax, final_total, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [customer_id || null, subtotal, discount, tax, final_total, payment_method]
    );

    const sale_id = saleResult.insertId;

    // ✅ Insert Sale Items + Update Stock
    for (let item of items) {
      // 🔍 Check stock first
      const [productRows] = await connection.query(
        "SELECT stock, name FROM products WHERE id = ?",
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product not found (ID: ${item.product_id})`);
      }

      const currentStock = productRows[0].stock;
      const productName = productRows[0].name;

      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${productName}. Available: ${currentStock}`);
      }

      // 🧾 Insert item
      await connection.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [sale_id, item.product_id, item.quantity, item.price]
      );

      // 📦 Update stock
      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Sale completed successfully",
      sale_id,
      final_total,
      change: 0 // Frontend handles change calculation display
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('❌ Sale Error:', err.message);

    res.status(400).json({
      success: false,
      message: err.message || "Sale failed"
    });

  } finally {
    if (connection) connection.release();
  }
});

// ===============================
// GET ALL SALES (Admin ONLY)
// ===============================
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*, 
        c.name AS customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.id DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching sales"
    });
  }
});

// ===============================
// GET SINGLE SALE (Admin ONLY)
// ===============================
router.get('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [saleRows] = await db.query(
      "SELECT * FROM sales WHERE id = ?",
      [id]
    );

    if (saleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      });
    }

    const [itemsRows] = await db.query(
      `SELECT 
        si.*, 
        p.name AS product_name 
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        sale: saleRows[0],
        items: itemsRows
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching sale"
    });
  }
});

// ===============================
// CANCEL SALE (Admin ONLY)
// ===============================
router.put('/:id/cancel', verifyToken, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 🔍 Check sale
    const [saleRows] = await connection.query(
      "SELECT * FROM sales WHERE id = ?",
      [id]
    );

    if (saleRows.length === 0) {
      throw new Error("Sale not found");
    }

    if (saleRows[0].status === 'cancelled') {
      throw new Error("Sale already cancelled");
    }

    // 🔍 Get items
    const [items] = await connection.query(
      "SELECT * FROM sale_items WHERE sale_id = ?",
      [id]
    );

    // 📦 Restore stock
    for (let item of items) {
      await connection.query(
        `UPDATE products 
         SET stock = stock + ? 
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // ❌ Cancel sale
    await connection.query(
      "UPDATE sales SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Sale cancelled and stock restored"
    });

  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(400).json({
      success: false,
      message: err.message || "Cancel failed"
    });

  } finally {
    connection.release();
  }
});

module.exports = router;