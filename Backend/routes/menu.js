const express = require('express');
const router = express.Router();
const { store, getNextId } = require('../dataStore');

// ===============================
// GET ALL MENU ITEMS
// ===============================
router.get('/', (req, res) => {
  const { search = '', category = '' } = req.query;

  let items = [...store.menu_items];

  if (search) {
    const searchLower = search.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  }

  if (category && category !== 'all') {
    items = items.filter(item => item.category === category);
  }

  res.json({
    success: true,
    data: {
      items
    }
  });
});

// ===============================
// GET CATEGORIES
// ===============================
router.get('/categories', (req, res) => {
  const categories = [...new Set(store.menu_items.map(item => item.category))];

  res.json({
    success: true,
    data: categories
  });
});

// ===============================
// UPDATE STOCK
// ===============================
router.put('/:id/stock', (req, res) => {
  const { id } = req.params;
  const { quantity, operation } = req.body;

  if (!quantity || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: "Valid quantity required"
    });
  }

  const itemIndex = store.menu_items.findIndex(item => item.id === parseInt(id));

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  let newStock = store.menu_items[itemIndex].stock;

  if (operation === 'decrease') {
    if (store.menu_items[itemIndex].stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    newStock -= quantity;
  } else if (operation === 'increase') {
    newStock += quantity;
  } else {
    newStock = quantity;
  }

  store.menu_items[itemIndex].stock = newStock;

  res.json({
    success: true,
    message: "Stock updated successfully",
    data: { id: parseInt(id), stock: newStock }
  });
});

module.exports = router;
