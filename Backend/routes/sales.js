const express = require('express');
const router = express.Router();
const { store, getNextId } = require('../dataStore');

// 🔐 Middleware
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// ===============================
// CREATE SALE (Admin + Cashier)
// ===============================
router.post('/', verifyToken, checkRole(['admin', 'cashier']), (req, res) => {
  const { customer_id, items, discount = 0, payment_method, amount_paid } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Items required" });
  }

  if (typeof amount_paid !== 'number' || amount_paid < 0) {
    return res.status(400).json({ success: false, message: "Invalid payment amount" });
  }

  let subtotal = 0;
  let tax = 0;

  items.forEach(item => {
    const total = item.quantity * item.price;
    subtotal += total;
    tax += (total * 18) / 100;
  });

  const final_total = subtotal + tax - discount;
  const change = amount_paid - final_total;

  if (change < 0) {
    return res.status(400).json({ success: false, message: "Insufficient payment" });
  }

  try {
    // Create sale
    const sale = {
      id: getNextId('sales'),
      customer_id,
      subtotal,
      discount,
      tax,
      final_total,
      payment_method,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    store.sales.push(sale);

    // Create sale items and update stock
    const saleItems = items.map(item => {
      const saleItem = {
        id: getNextId('sale_items'),
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      };

      store.sale_items.push(saleItem);

      // Update product stock
      const product = store.products.find(p => p.id === item.product_id);
      if (product) {
        product.stock -= item.quantity;
      }

      return saleItem;
    });

    res.json({
      success: true,
      message: "Sale completed",
      sale_id: sale.id,
      final_total,
      change
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sale failed', error: 'Internal server error' });
  }
});

// ===============================
// GET ALL SALES (Admin only)
// ===============================
router.get('/', verifyToken, checkRole(['admin']), (req, res) => {
  const salesWithCustomer = store.sales.map(sale => {
    const customer = store.customers.find(c => c.id === sale.customer_id);
    return {
      ...sale,
      customer_name: customer ? customer.name : 'Walk-in Customer'
    };
  }).sort((a, b) => b.id - a.id);

  res.json({
    success: true,
    data: salesWithCustomer
  });
});

// ===============================
// GET SINGLE SALE (Admin only)
// ===============================
router.get('/:id', verifyToken, checkRole(['admin']), (req, res) => {
  const sale = store.sales.find(s => s.id === parseInt(req.params.id));

  if (!sale) {
    return res.status(404).json({ success: false, message: "Sale not found" });
  }

  const items = store.sale_items.filter(si => si.sale_id === sale.id);

  res.json({
    success: true,
    data: {
      sale,
      items
    }
  });
});

// ===============================
// CANCEL SALE (Admin only) - RESTORES STOCK
// ===============================
router.put('/:id/cancel', verifyToken, checkRole(['admin']), (req, res) => {
  const sale = store.sales.find(s => s.id === parseInt(req.params.id));

  if (!sale) {
    return res.status(404).json({ success: false, message: "Sale not found" });
  }

  const items = store.sale_items.filter(si => si.sale_id === sale.id);

  // Restore stock
  items.forEach(item => {
    const product = store.products.find(p => p.id === item.product_id);
    if (product) {
      product.stock += item.quantity;
    }
  });

  // Update sale status
  sale.status = 'cancelled';

  res.json({
    success: true,
    message: "Sale cancelled and stock restored"
  });
});

module.exports = router;
