const express = require('express');
const router = express.Router();
const db = require('../db');

// ===============================
// SALES PERFORMANCE
// ===============================
router.get('/sales-performance', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        DAYNAME(created_at) as day,
        SUM(final_total) as revenue
      FROM sales
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DAYNAME(created_at)
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Sales performance error:', err.message);
    res.json({ success: true, data: [] });
  }
});

// ===============================
// CATEGORY DISTRIBUTION
// ===============================
router.get('/category-distribution', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        p.category as name,
        SUM(si.quantity * si.price) as value
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY p.category
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Category distribution error:', err.message);
    res.json({ success: true, data: [] });
  }
});

// ===============================
// TAX SUMMARY
// ===============================
router.get('/tax-summary', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        SUM(final_total) as total_taxable_amount,
        SUM(tax) as total_tax
      FROM sales
    `);

    const total_tax = rows[0]?.total_tax || 0;

    res.json({
      success: true,
      data: {
        total_taxable_amount: rows[0]?.total_taxable_amount || 0,
        cgst: total_tax / 2,
        sgst: total_tax / 2,
        total_tax: total_tax
      }
    });
  } catch (err) {
    console.error('Tax summary error:', err.message);
    res.json({
      success: true,
      data: { total_taxable_amount: 0, cgst: 0, sgst: 0, total_tax: 0 }
    });
  }
});

// ===============================
// PROFIT & LOSS
// ===============================
router.get('/profit-loss', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        SUM(si.price * si.quantity) as total_revenue,
        SUM(p.cost_price * si.quantity) as total_cost
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
    `);

    const revenue = rows[0]?.total_revenue || 0;
    const cost = rows[0]?.total_cost || 0;
    const profit = revenue - cost;

    res.json({
      success: true,
      data: {
        total_revenue: revenue,
        total_cost: cost,
        gross_profit: profit,
        profit_margin: revenue ? (profit / revenue) * 100 : 0,
        net_profit: profit
      }
    });
  } catch (err) {
    console.error('Profit/loss error:', err.message);
    res.json({
      success: true,
      data: { total_revenue: 0, total_cost: 0, gross_profit: 0, profit_margin: 0, net_profit: 0 }
    });
  }
});

// ===============================
// DAILY SALES REPORT
// ===============================
router.get('/daily-sales', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as sales_count,
        SUM(final_total) as revenue
      FROM sales
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Daily sales error:', err.message);
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
