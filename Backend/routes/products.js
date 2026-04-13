const express = require('express');
const router = express.Router();
const { store, getNextId } = require('../dataStore');

// ===============================
// GET ALL PRODUCTS
// ===============================
router.get('/', (req, res) => {
  const { search = '', category = '' } = req.query;

  let products = [...store.products];

  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  }

  if (category) {
    products = products.filter(p => p.category === category);
  }

  res.json({
    success: true,
    data: products
  });
});

// ===============================
// GET CATEGORIES
// ===============================
router.get('/categories/list', (req, res) => {
  const categories = [...new Set(store.products.map(p => p.category))];

  res.json({
    success: true,
    data: categories
  });
});

// ===============================
// GET SINGLE PRODUCT
// ===============================
router.get('/:id', (req, res) => {
  const product = store.products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({
    success: true,
    data: product
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

  const newProduct = {
    id: getNextId('products'),
    name,
    category: category || '',
    sku: sku || '',
    barcode: barcode || '',
    description: description || '',
    selling_price,
    cost_price: cost_price || 0,
    stock: stock || 0,
    threshold: threshold || 10,
    unit_type: unit_type || 'pcs'
  };

  store.products.push(newProduct);

  res.json({
    success: true,
    message: "Product created",
    data: newProduct
  });
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

  const productIndex = store.products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  store.products[productIndex] = {
    ...store.products[productIndex],
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
  };

  res.json({
    success: true,
    message: "Product updated",
    data: store.products[productIndex]
  });
});

// ===============================
// DELETE PRODUCT
// ===============================
router.delete('/:id', (req, res) => {
  const productIndex = store.products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  store.products.splice(productIndex, 1);

  res.json({
    success: true,
    message: "Product deleted"
  });
});

module.exports = router;
