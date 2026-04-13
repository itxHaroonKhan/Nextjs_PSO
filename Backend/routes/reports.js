const express = require('express');
const router = express.Router();
const { store } = require('../dataStore');

// ===============================
// SALES PERFORMANCE
// ===============================
router.get('/sales-performance', (req, res) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const salesByDay = {};

  store.sales
    .filter(s => new Date(s.created_at) >= weekAgo)
    .forEach(s => {
      const dayName = days[new Date(s.created_at).getDay()];
      if (!salesByDay[dayName]) {
        salesByDay[dayName] = { day: dayName, revenue: 0 };
      }
      salesByDay[dayName].revenue += s.final_total;
    });

  res.json({ success: true, data: Object.values(salesByDay) });
});

// ===============================
// CATEGORY DISTRIBUTION
// ===============================
router.get('/category-distribution', (req, res) => {
  const categoryMap = {};

  store.sale_items.forEach(si => {
    const product = store.products.find(p => p.id === si.product_id);
    if (product) {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = { name: product.category, value: 0 };
      }
      categoryMap[product.category].value += si.quantity * si.price;
    }
  });

  res.json({ success: true, data: Object.values(categoryMap) });
});

// ===============================
// TAX SUMMARY
// ===============================
router.get('/tax-summary', (req, res) => {
  const totalTax = store.sales.reduce((sum, s) => sum + s.tax, 0);
  const totalTaxableAmount = store.sales.reduce((sum, s) => sum + s.final_total, 0);

  res.json({
    success: true,
    data: {
      total_taxable_amount: totalTaxableAmount,
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      total_tax: totalTax
    }
  });
});

// ===============================
// PROFIT & LOSS
// ===============================
router.get('/profit-loss', (req, res) => {
  let totalRevenue = 0;
  let totalCost = 0;

  store.sale_items.forEach(si => {
    const product = store.products.find(p => p.id === si.product_id);
    if (product) {
      totalRevenue += si.price * si.quantity;
      totalCost += product.cost_price * si.quantity;
    }
  });

  const profit = totalRevenue - totalCost;

  res.json({
    success: true,
    data: {
      total_revenue: totalRevenue,
      total_cost: totalCost,
      gross_profit: profit,
      profit_margin: totalRevenue ? (profit / totalRevenue) * 100 : 0,
      net_profit: profit
    }
  });
});

// ===============================
// DAILY SALES REPORT
// ===============================
router.get('/daily-sales', (req, res) => {
  const salesByDate = {};

  store.sales.forEach(s => {
    const date = new Date(s.created_at).toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = { date, sales_count: 0, revenue: 0 };
    }
    salesByDate[date].sales_count += 1;
    salesByDate[date].revenue += s.final_total;
  });

  const dailySales = Object.values(salesByDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  res.json({ success: true, data: dailySales });
});

module.exports = router;
