const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔐 Middleware
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// ===============================
// APPLY AUTH + ADMIN ONLY
// ===============================
router.use(verifyToken);
router.use(checkRole(['admin']));

// ===============================
// 📊 GET ALL REPORTS DATA (Combined)
// ===============================
router.get('/all', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateCondition = 'sales.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    if (period === 'today') dateCondition = 'DATE(sales.created_at) = CURDATE()';
    else if (period === 'month') dateCondition = 'sales.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
    else if (period === 'year') dateCondition = 'sales.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    else if (period === 'all') dateCondition = '1=1';

    const [
      [salesRows],
      [categoryRows],
      [taxRows],
      [profitRows]
    ] = await Promise.all([
      db.query(`
        SELECT DATE(created_at) AS date, SUM(final_total) AS revenue, COUNT(*) AS total_sales
        FROM sales WHERE ${dateCondition}
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      db.query(`
        SELECT p.category AS name, SUM(si.quantity * si.price) AS value
        FROM sale_items si 
        JOIN products p ON si.product_id = p.id
        JOIN sales ON si.sale_id = sales.id
        WHERE ${dateCondition}
        GROUP BY p.category ORDER BY value DESC
      `),
      db.query(`
        SELECT IFNULL(SUM(final_total - tax), 0) AS total_taxable_amount, IFNULL(SUM(tax), 0) AS total_tax
        FROM sales WHERE status = 'completed' AND ${dateCondition}
      `),
      db.query(`
        SELECT IFNULL(SUM(si.price * si.quantity), 0) AS total_revenue, IFNULL(SUM(p.cost_price * si.quantity), 0) AS total_cost
        FROM sale_items si 
        JOIN products p ON si.product_id = p.id
        JOIN sales ON si.sale_id = sales.id
        WHERE ${dateCondition}
      `)
    ]);

    const total_tax = taxRows[0].total_tax;
    const revenue = profitRows[0].total_revenue;
    const cost = profitRows[0].total_cost;
    const profit = revenue - cost;

    res.json({
      success: true,
      data: {
        salesPerformance: salesRows,
        categoryDistribution: categoryRows,
        taxSummary: {
          total_taxable_amount: taxRows[0].total_taxable_amount,
          cgst: total_tax / 2,
          sgst: total_tax / 2,
          total_tax: total_tax
        },
        profitLoss: {
          total_revenue: revenue,
          total_cost: cost,
          gross_profit: profit,
          profit_margin: revenue ? ((profit / revenue) * 100).toFixed(2) : 0,
          net_profit: profit
        }
      }
    });

  } catch (err) {
    console.error('❌ Error fetching all reports data:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching reports data"
    });
  }
});

// ===============================
// 📊 1. SALES PERFORMANCE (Last 7 Days)
// ===============================
router.get('/sales-performance', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at) AS date,
        SUM(final_total) AS revenue,
        COUNT(*) AS total_sales
      FROM sales
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching sales performance"
    });
  }
});

// ===============================
// 🥧 2. CATEGORY DISTRIBUTION
// ===============================
router.get('/category-distribution', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.category AS name,
        SUM(si.quantity * si.price) AS value
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY p.category
      ORDER BY value DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching category distribution"
    });
  }
});

// ===============================
// 💰 3. TAX SUMMARY
// ===============================
router.get('/tax-summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        IFNULL(SUM(final_total - tax), 0) AS total_taxable_amount,
        IFNULL(SUM(tax), 0) AS total_tax
      FROM sales
      WHERE status = 'completed'
    `);

    const total_tax = rows[0].total_tax;

    res.json({
      success: true,
      data: {
        total_taxable_amount: rows[0].total_taxable_amount,
        cgst: total_tax / 2,
        sgst: total_tax / 2,
        total_tax: total_tax
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching tax summary"
    });
  }
});

// ===============================
// 📈 4. PROFIT & LOSS
// ===============================
router.get('/profit-loss', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        IFNULL(SUM(si.price * si.quantity), 0) AS total_revenue,
        IFNULL(SUM(p.cost_price * si.quantity), 0) AS total_cost
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
    `);

    const revenue = rows[0].total_revenue;
    const cost = rows[0].total_cost;
    const profit = revenue - cost;

    res.json({
      success: true,
      data: {
        total_revenue: revenue,
        total_cost: cost,
        gross_profit: profit,
        profit_margin: revenue ? ((profit / revenue) * 100).toFixed(2) : 0,
        net_profit: profit
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching profit/loss"
    });
  }
});

// ===============================
// 📅 5. DAILY SALES (Last 7 Days)
// ===============================
router.get('/daily-sales', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS sales_count,
        SUM(final_total) AS revenue
      FROM sales
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching daily sales"
    });
  }
});

module.exports = router;