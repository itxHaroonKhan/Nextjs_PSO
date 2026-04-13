const express = require('express');
const router = express.Router();
const { store } = require('../dataStore');

// ===============================
// DASHBOARD STATS
// ===============================
router.get('/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayStart = new Date(today).getTime();

  const todaySales = store.sales.filter(s => {
    const saleDate = new Date(s.created_at).getTime();
    return saleDate >= todayStart;
  });

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.final_total, 0);
  const todaySalesCount = todaySales.length;
  const totalCustomers = store.customers.length;
  const lowStock = store.products.filter(p => p.stock <= p.threshold).length;

  // Week revenue
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRevenue = store.sales
    .filter(s => new Date(s.created_at) >= weekAgo)
    .reduce((sum, s) => sum + s.final_total, 0);

  // Month revenue
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthRevenue = store.sales
    .filter(s => new Date(s.created_at) >= monthAgo)
    .reduce((sum, s) => sum + s.final_total, 0);

  res.json({
    success: true,
    data: {
      todayRevenue,
      todaySales: todaySalesCount,
      totalCustomers,
      lowStock,
      weekRevenue,
      monthRevenue
    }
  });
});

// ===============================
// RECENT SALES
// ===============================
router.get('/recent-sales', (req, res) => {
  const recentSales = store.sales
    .map(sale => {
      const customer = store.customers.find(c => c.id === sale.customer_id);
      return {
        id: sale.id,
        final_total: sale.final_total,
        payment_method: sale.payment_method,
        created_at: sale.created_at,
        customer_name: customer ? customer.name : 'Walk-in Customer'
      };
    })
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  res.json({
    success: true,
    data: recentSales
  });
});

// ===============================
// TOP CATEGORIES
// ===============================
router.get('/top-categories', (req, res) => {
  const categoryMap = {};

  store.sale_items.forEach(si => {
    const product = store.products.find(p => p.id === si.product_id);
    if (product) {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = {
          category: product.category,
          total_items_sold: 0,
          total_revenue: 0
        };
      }
      categoryMap[product.category].total_items_sold += si.quantity;
      categoryMap[product.category].total_revenue += si.quantity * si.price;
    }
  });

  const categories = Object.values(categoryMap)
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);

  res.json({
    success: true,
    data: categories
  });
});

// ===============================
// AI INSIGHTS
// ===============================
router.get('/insights', (req, res) => {
  const lowStockProducts = store.products
    .filter(p => p.stock <= p.threshold)
    .slice(0, 3);

  const insights = [
    {
      type: 'info',
      title: 'System Running',
      message: 'POS system is working fine'
    }
  ];

  if (lowStockProducts.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Some products are low in stock',
      items: lowStockProducts
    });
  }

  res.json({
    success: true,
    data: insights
  });
});

module.exports = router;
