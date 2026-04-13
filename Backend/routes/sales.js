const express = require('express');
const router = express.Router();
const db = require('../db');

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

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ success: false, message: 'Transaction failed' });

    // INSERT SALE
    const saleQuery = `
      INSERT INTO sales
      (customer_id, subtotal, discount, tax, final_total, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      saleQuery,
      [customer_id, subtotal, discount, tax, final_total, payment_method],
      (err, result) => {
        if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Failed to create sale' }));

        const sale_id = result.insertId;

        // INSERT ITEMS
        const itemPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            const q = `
              INSERT INTO sale_items
              (sale_id, product_id, quantity, price)
              VALUES (?, ?, ?, ?)
            `;
            db.query(q, [sale_id, item.product_id, item.quantity, item.price], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });

        Promise.all(itemPromises)
          .then(() => {
            // UPDATE STOCK
            const stockPromises = items.map(item => {
              return new Promise((resolve, reject) => {
                const q = `
                  UPDATE products
                  SET stock = stock - ?
                  WHERE id = ?
                `;
                db.query(q, [item.quantity, item.product_id], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
            });

            return Promise.all(stockPromises);
          })
          .then(() => {
            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Failed to commit sale' }));

              res.json({
                success: true,
                message: "Sale completed",
                sale_id,
                final_total,
                change
              });
            });
          })
          .catch(err => {
            db.rollback(() => res.status(500).json({ success: false, message: 'Sale failed', error: 'Internal server error' }));
          });
      }
    );
  });
});

// ===============================
// GET ALL SALES (Admin only)
// ===============================
router.get('/', verifyToken, checkRole(['admin']), (req, res) => {
  const query = `
    SELECT s.*, c.name AS customer_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    ORDER BY s.id DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch sales' });

    res.json({
      success: true,
      data: result
    });
  });
});

// ===============================
// GET SINGLE SALE (Admin only)
// ===============================
router.get('/:id', verifyToken, checkRole(['admin']), (req, res) => {
  const saleQuery = "SELECT * FROM sales WHERE id=?";

  db.query(saleQuery, [req.params.id], (err, saleResult) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch sale' });

    if (saleResult.length === 0) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    const itemsQuery = "SELECT * FROM sale_items WHERE sale_id=?";

    db.query(itemsQuery, [req.params.id], (err, itemsResult) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to fetch sale items' });

      res.json({
        success: true,
        data: {
          sale: saleResult[0],
          items: itemsResult
        }
      });
    });
  });
});

// ===============================
// CANCEL SALE (Admin only) - RESTORES STOCK
// ===============================
router.put('/:id/cancel', verifyToken, checkRole(['admin']), (req, res) => {
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ success: false, message: 'Transaction failed' });

    // Get sale items to restore stock
    db.query("SELECT * FROM sale_items WHERE sale_id=?", [req.params.id], (err, items) => {
      if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Failed to fetch sale items' }));

      // Update sale status
      db.query("UPDATE sales SET status='cancelled' WHERE id=?", [req.params.id], (err) => {
        if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Failed to cancel sale' }));

        // Restore stock for each item
        const stockPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.query(
              "UPDATE products SET stock = stock + ? WHERE id = ?",
              [item.quantity, item.product_id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(stockPromises)
          .then(() => {
            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).json({ success: false, message: 'Failed to commit cancellation' }));

              res.json({
                success: true,
                message: "Sale cancelled and stock restored"
              });
            });
          })
          .catch(() => {
            db.rollback(() => res.status(500).json({ success: false, message: 'Failed to restore stock' }));
          });
      });
    });
  });
});

module.exports = router;