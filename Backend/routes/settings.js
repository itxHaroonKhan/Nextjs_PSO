const express = require('express');
const router = express.Router();
const db = require('../db');

// ===============================
// GET SETTINGS
// ===============================
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`SELECT * FROM settings LIMIT 1`);

    res.json({
      success: true,
      data: rows[0] || {}
    });
  } catch (err) {
    console.error('Fetch settings error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// ===============================
// UPDATE SETTINGS
// ===============================
router.put('/', async (req, res) => {
  try {
    const data = req.body;

    await db.promise().query(`
      UPDATE settings SET
        store_name = ?,
        store_address = ?,
        store_phone = ?,
        store_email = ?,
        store_gstin = ?,
        currency = ?,
        tax_rate = ?,
        items_per_page = ?,
        theme = ?,
        invoice_prefix = ?,
        low_stock_alert = ?
      WHERE id = 1
    `, [
      data.store_name,
      data.store_address,
      data.store_phone,
      data.store_email,
      data.store_gstin,
      data.currency,
      data.tax_rate,
      data.items_per_page,
      data.theme,
      data.invoice_prefix,
      data.low_stock_alert
    ]);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (err) {
    console.error('Update settings error:', err.message);
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
});

// ===============================
// GET STORE INFO
// ===============================
router.get('/store', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        store_name,
        store_address,
        store_phone,
        store_email,
        store_gstin
      FROM settings
      LIMIT 1
    `);

    res.json({
      success: true,
      data: rows[0] || {}
    });
  } catch (err) {
    console.error('Fetch store info error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching store info' });
  }
});

// ===============================
// UPDATE STORE INFO
// ===============================
router.put('/store', async (req, res) => {
  try {
    const data = req.body;

    await db.promise().query(`
      UPDATE settings SET
        store_name = ?,
        store_address = ?,
        store_phone = ?,
        store_email = ?,
        store_gstin = ?
      WHERE id = 1
    `, [
      data.store_name,
      data.store_address,
      data.store_phone,
      data.store_email,
      data.store_gstin
    ]);

    res.json({
      success: true,
      message: 'Store info updated successfully'
    });
  } catch (err) {
    console.error('Update store info error:', err.message);
    res.status(500).json({ success: false, message: 'Error updating store info' });
  }
});

module.exports = router;
