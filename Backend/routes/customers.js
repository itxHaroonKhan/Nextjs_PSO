const express = require('express');
const router = express.Router();
const { store, getNextId } = require('../dataStore');

// ===============================
// GET ALL CUSTOMERS
// ===============================
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: store.customers
  });
});

// ===============================
// GET SINGLE CUSTOMER
// ===============================
router.get('/:id', (req, res) => {
  const customer = store.customers.find(c => c.id === parseInt(req.params.id));

  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  res.json({ success: true, data: customer });
});

// ===============================
// CREATE CUSTOMER
// ===============================
router.post('/', (req, res) => {
  const { name, email, phone, address, city, pincode, gst_number } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required'
    });
  }

  const newCustomer = {
    id: getNextId('customers'),
    name,
    email: email || '',
    phone: phone || '',
    address: address || '',
    city: city || '',
    pincode: pincode || '',
    gst_number: gst_number || '',
    total_spent: 0
  };

  store.customers.push(newCustomer);

  res.json({
    success: true,
    message: "Customer added successfully",
    data: newCustomer
  });
});

// ===============================
// UPDATE CUSTOMER
// ===============================
router.put('/:id', (req, res) => {
  const { name, email, phone, address, city, pincode, gst_number } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required'
    });
  }

  const customerIndex = store.customers.findIndex(c => c.id === parseInt(req.params.id));

  if (customerIndex === -1) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  store.customers[customerIndex] = {
    ...store.customers[customerIndex],
    name,
    email,
    phone,
    address,
    city,
    pincode,
    gst_number
  };

  res.json({
    success: true,
    message: "Customer updated successfully",
    data: store.customers[customerIndex]
  });
});

// ===============================
// DELETE CUSTOMER
// ===============================
router.delete('/:id', (req, res) => {
  const customerIndex = store.customers.findIndex(c => c.id === parseInt(req.params.id));

  if (customerIndex === -1) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  store.customers.splice(customerIndex, 1);

  res.json({
    success: true,
    message: "Customer deleted successfully"
  });
});

module.exports = router;
