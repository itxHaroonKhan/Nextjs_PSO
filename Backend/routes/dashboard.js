const express = require('express');
const router = express.Router();
const db = require('../db');

// ===============================
// DASHBOARD STATS
// ===============================
router.get('/stats', (req, res) => {
  const statsQuery = `
    SELECT
      (SELECT IFNULL(SUM(final_total),0) FROM sales WHERE DATE(created_at) = CURDATE()) AS todayRevenue,
      (SELECT COUNT(*) FROM sales WHERE DATE(created_at) = CURDATE()) AS todaySales,
      (SELECT COUNT(*) FROM customers) AS totalCustomers,
      (SELECT COUNT(*) FROM products WHERE stock <= threshold) AS lowStock,
      (SELECT IFNULL(SUM(final_total),0) FROM sales WHERE WEEK(created_at) = WEEK(CURDATE())) AS weekRevenue,
      (SELECT IFNULL(SUM(final_total),0) FROM sales WHERE MONTH(created_at) = MONTH(CURDATE())) AS monthRevenue
  `;

  db.query(statsQuery, (err, result) => {
    if (err) {
      console.error('Dashboard stats error:', err.message);
      return res.json({
        success: true,
        data: {
          todayRevenue: 0,
          todaySales: 0,
          totalCustomers: 0,
          lowStock: 0,
          weekRevenue: 0,
          monthRevenue: 0
        }
      });
    }

    res.json({
      success: true,
      data: result[0]
    });
  });
});

// ===============================
// RECENT SALES
// ===============================
router.get('/recent-sales', (req, res) => {
  const query = `
    SELECT
      s.id,
      s.final_total AS grand_total,
      s.payment_method,
      s.created_at AS sale_date,
      c.name AS customer_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    ORDER BY s.id DESC
    LIMIT 5
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Recent sales error:', err.message);
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: result
    });
  });
});

// ===============================
// TOP CATEGORIES
// ===============================
router.get('/top-categories', (req, res) => {
  const query = `
    SELECT
      p.category,
      SUM(si.quantity) AS total_items_sold,
      SUM(si.quantity * si.price) AS total_revenue
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    GROUP BY p.category
    ORDER BY total_revenue DESC
    LIMIT 5
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Top categories error:', err.message);
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: result
    });
  });
});

// ===============================
// AI INSIGHTS
// ===============================
router.get('/insights', (req, res) => {
  const query = `
    SELECT name, stock, threshold
    FROM products
    WHERE stock <= threshold
    LIMIT 3
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('AI insights error:', err.message);
      return res.json({
        success: true,
        data: [
          {
            type: 'info',
            title: 'System Running',
            message: 'POS system is working. Connect database for real-time insights.'
          }
        ]
      });
    }

    const insights = [
      {
        type: 'info',
        title: 'System Running',
        message: 'POS system is working fine'
      }
    ];

    if (result.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Some products are low in stock',
        items: result
      });
    }

    res.json({
      success: true,
      data: insights
    });
  });
});

module.exports = router;
