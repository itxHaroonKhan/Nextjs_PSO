const express = require('express');
const router = express.Router();
const { store } = require('../dataStore');

// ===============================
// GET SETTINGS
// ===============================
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: store.settings
  });
});

// ===============================
// UPDATE SETTINGS
// ===============================
router.put('/', (req, res) => {
  const data = req.body;

  store.settings = {
    ...store.settings,
    store_name: data.store_name || store.settings.store_name,
    store_address: data.store_address || store.settings.store_address,
    store_phone: data.store_phone || store.settings.store_phone,
    store_email: data.store_email || store.settings.store_email,
    store_gstin: data.store_gstin !== undefined ? data.store_gstin : store.settings.store_gstin,
    currency: data.currency || store.settings.currency,
    tax_rate: data.tax_rate !== undefined ? data.tax_rate : store.settings.tax_rate,
    items_per_page: data.items_per_page || store.settings.items_per_page,
    theme: data.theme || store.settings.theme,
    invoice_prefix: data.invoice_prefix || store.settings.invoice_prefix,
    low_stock_alert: data.low_stock_alert !== undefined ? data.low_stock_alert : store.settings.low_stock_alert
  };

  res.json({
    success: true,
    message: 'Settings updated successfully'
  });
});

// ===============================
// GET STORE INFO
// ===============================
router.get('/store', (req, res) => {
  res.json({
    success: true,
    data: {
      store_name: store.settings.store_name,
      store_address: store.settings.store_address,
      store_phone: store.settings.store_phone,
      store_email: store.settings.store_email,
      store_gstin: store.settings.store_gstin
    }
  });
});

// ===============================
// UPDATE STORE INFO
// ===============================
router.put('/store', (req, res) => {
  const data = req.body;

  store.settings = {
    ...store.settings,
    store_name: data.store_name || store.settings.store_name,
    store_address: data.store_address || store.settings.store_address,
    store_phone: data.store_phone || store.settings.store_phone,
    store_email: data.store_email || store.settings.store_email,
    store_gstin: data.store_gstin !== undefined ? data.store_gstin : store.settings.store_gstin
  };

  res.json({
    success: true,
    message: 'Store info updated successfully'
  });
});

module.exports = router;
