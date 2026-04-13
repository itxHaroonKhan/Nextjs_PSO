# Elites POS System - Backend API

Express.js backend API with in-memory data storage.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Run Production Server
```bash
npm start
```

Server will start on: **http://localhost:5001**

---

## 📡 API Endpoints

### **Authentication** - `/api/auth`
- `POST /api/auth/login` - Login
- `POST /api/auth/create-cashier` - Create cashier (Admin only)

### **Products** - `/api/products`
- `GET /api/products` - Get all products (with search, filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories/list` - Get all categories

### **Customers** - `/api/customers`
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### **Sales** - `/api/sales`
- `GET /api/sales` - Get all sales (Admin only)
- `GET /api/sales/:id` - Get single sale with items (Admin only)
- `POST /api/sales` - Create new sale (POS checkout)
- `PUT /api/sales/:id/cancel` - Cancel/refund sale (Admin only)

### **Dashboard** - `/api/dashboard`
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-sales` - Get recent sales
- `GET /api/dashboard/top-categories` - Get top categories
- `GET /api/dashboard/insights` - Get AI insights

### **Reports** - `/api/reports`
- `GET /api/reports/sales-performance` - Get sales performance chart data
- `GET /api/reports/category-distribution` - Get category distribution pie chart
- `GET /api/reports/tax-summary` - Get tax summary (GST breakdown)
- `GET /api/reports/profit-loss` - Get profit and loss report
- `GET /api/reports/daily-sales` - Get daily sales report

### **Menu** - `/api/menu`
- `GET /api/menu` - Get all menu items
- `GET /api/menu/categories` - Get menu categories
- `PUT /api/menu/:id/stock` - Update menu item stock

### **Settings** - `/api/settings`
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings
- `GET /api/settings/store` - Get store information
- `PUT /api/settings/store` - Update store information

---

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Default Admin Credentials
- Email: `admin@elites.com`
- Password: `admin123`

---

## 📦 Response Format

All responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

---

## 📝 Query Parameters

### Search & Filter
- `search` - Search term
- `category` - Filter by category (products, menu)

---

## 🔧 Tech Stack
- **Framework:** Express.js
- **Authentication:** JWT + bcrypt
- **Data Storage:** In-memory (no database)
- **Role-based Access:** Admin & Cashier

---

## 📌 Example Requests

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elites.com",
    "password": "admin123"
  }'
```

### Get Products
```bash
curl http://localhost:5001/api/products
```

### Create Product (requires auth)
```bash
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "New Product",
    "category": "Electronics",
    "sku": "TEST001",
    "selling_price": 999,
    "cost_price": 500,
    "stock": 50
  }'
```

---

**Built with Express.js for Elites POS System**
