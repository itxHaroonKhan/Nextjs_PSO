// In-memory data store

const store = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@elites.com',
      password: '$2b$10$YourHashedPasswordHere', // bcrypt hash for 'admin123'
      role: 'admin'
    }
  ],
  products: [
    { id: 1, name: 'Wireless Mouse', category: 'Electronics', sku: 'WM001', barcode: '1234567890', selling_price: 25.99, cost_price: 15.00, stock: 50, threshold: 10, unit_type: 'pcs' },
    { id: 2, name: 'Rice Basmati', category: 'Groceries', sku: 'RB001', barcode: '2345678901', selling_price: 12.50, cost_price: 8.00, stock: 100, threshold: 20, unit_type: 'kg' },
    { id: 3, name: 'Cola Drink', category: 'Beverages', sku: 'CD001', barcode: '3456789012', selling_price: 1.99, cost_price: 0.80, stock: 200, threshold: 50, unit_type: 'pcs' }
  ],
  customers: [
    { id: 1, name: 'Walk-in Customer', email: '', phone: '', address: '', city: '', pincode: '', gst_number: '', total_spent: 0 }
  ],
  sales: [],
  sale_items: [],
  menu_items: [
    { id: 1, name: 'Classic Burger', category: 'Special', price: 8.99, stock: 50, image: '', description: 'Juicy beef burger with fresh veggies', available: true },
    { id: 2, name: 'Tomato Soup', category: 'Soups', price: 5.99, stock: 30, image: '', description: 'Hot and creamy tomato soup', available: true },
    { id: 3, name: 'Chocolate Cake', category: 'Desserts', price: 6.99, stock: 20, image: '', description: 'Rich chocolate layer cake', available: true },
    { id: 4, name: 'Grilled Chicken', category: 'Chickens', price: 12.99, stock: 25, image: '', description: 'Perfectly grilled chicken with spices', available: true }
  ],
  settings: {
    store_name: 'Elites POS',
    store_address: '123 Main Street',
    store_phone: '+1234567890',
    store_email: 'info@elitespos.com',
    store_gstin: '',
    currency: 'PKR',
    tax_rate: 18,
    items_per_page: 10,
    theme: 'light',
    invoice_prefix: 'INV',
    low_stock_alert: true
  },
  purchases: [],
  purchase_items: []
};

// Auto-increment IDs
const counters = {
  users: 2,
  products: 4,
  customers: 2,
  sales: 1,
  sale_items: 1,
  menu_items: 5,
  purchases: 1,
  purchase_items: 1
};

function getNextId(collection) {
  return counters[collection]++;
}

module.exports = { store, getNextId };
