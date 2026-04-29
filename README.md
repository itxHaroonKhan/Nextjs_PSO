# Elites POS System

Full-stack Point of Sale system — Next.js frontend + Node.js/Express backend + MySQL database.

---

## Database Status

Aapka `pos_system` database already bana hua hai aur saari tables bhi exist karti hain.
Saare columns manually add kar liye gaye hain — database fully ready hai.

---

## Code Changes (Database Setup Code Hata Diya)

`Backend/routes/auth.js` se `ensureUserColumns()` function remove kar diya gaya.

Yeh function server start hone pe automatically `users` table mein yeh columns add karne ki koshish karta tha:
- `permissions TEXT`
- `failedAttempts INT DEFAULT 0`
- `lockUntil DATETIME NULL`

Chunki yeh columns ab manually add ho gaye hain, yeh function zaroorat nahi tha.
Agar kabhi fresh database pe project setup karna ho to yeh columns manually add karne honge (neeche queries di gayi hain).

---

## MySQL Workbench mein yeh queries run karo — Columns check/fix karne ke liye

MySQL Workbench kholo → `pos_system` select karo → Query 1 tab mein paste karo → Run karo.

---

### 1. users table

```sql
USE pos_system;

-- Check karo kaunse columns hain
DESCRIBE users;

-- Agar koi column missing ho to yeh run karo:
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin','cashier') DEFAULT 'cashier';
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failedAttempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lockUntil DATETIME NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT NOW();
```

---

### 2. products table

```sql
-- Check karo
DESCRIBE products;

-- Missing columns add karo:
ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS threshold INT DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50) DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT NOW();
```

---

### 3. customers table

```sql
-- Check karo
DESCRIBE customers;

-- Missing columns add karo:
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT NOW();
```

---

### 4. sales table

```sql
-- Check karo
DESCRIBE sales;

-- Missing columns add karo:
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS final_total DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status ENUM('completed','cancelled') DEFAULT 'completed';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT NOW();
```

---

### 5. sale_items table

```sql
-- Check karo
DESCRIBE sale_items;

-- Missing columns add karo:
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS sale_id INT NOT NULL DEFAULT 0;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS product_id INT NOT NULL DEFAULT 0;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 0;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0;
```

---

### 6. settings table

```sql
-- Check karo
DESCRIBE settings;

-- Missing columns add karo:
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_name VARCHAR(200) DEFAULT 'Elites POS';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_address TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_phone VARCHAR(50);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_email VARCHAR(100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_gstin VARCHAR(50);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'PKR';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS items_per_page INT DEFAULT 10;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'dark';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS invoice_prefix VARCHAR(20) DEFAULT 'INV';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS low_stock_alert INT DEFAULT 5;

-- Settings mein ek default row hona chahiye (id=1)
INSERT IGNORE INTO settings (id, store_name, currency, tax_rate, items_per_page, theme, invoice_prefix, low_stock_alert)
VALUES (1, 'Elites POS', 'PKR', 0, 10, 'dark', 'INV', 5);
```

---

### 7. Default Admin User banao (agar nahi hai)

```sql
-- Email: admin@elites.com | Password: admin123
INSERT IGNORE INTO users (name, email, password, role, permissions)
VALUES (
  'Admin',
  'admin@elites.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  '[]'
);
```

---

## Backend .env File

`Backend/.env` mein yeh hona chahiye:

```env
PORT=5001
JWT_SECRET=elites-pos-secret-key-change-in-production-2024
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=abc12345
DB_NAME=pos_system
FRONTEND_URL=http://localhost:9002
```

> `DB_PASSWORD` mein apna MySQL root password likho.

---

## Project Run Karne Ka Tarika

### Backend:
```bash
cd Backend
npm install
npm start
```

### Frontend (naya terminal):
```bash
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:5001
- Frontend: http://localhost:9002

---

## Default Login

| Field | Value |
|---|---|
| Email | admin@elites.com |
| Password | admin123 |

---

## Common Errors

| Error | Solution |
|---|---|
| `Database connection failed` | MySQL service start karo, `.env` password check karo |
| `Table doesn't exist` | Upar di gayi ALTER TABLE queries run karo |
| `Unknown column` | Us table ki ALTER TABLE queries run karo |
| `Cannot connect to 5001` | `cd Backend && npm start` run karo |
| `Cannot connect to 9002` | `cd frontend && npm run dev` run karo |

---

## Sales Data Reset & Order Number 1 Se Start Karna

Agar purana sales data delete karke order number dobara `INV-000001` se start karna ho to MySQL Workbench mein yeh queries run karo:

```sql
USE pos_system;

-- Sales aur sale_items ka data clear karo
DELETE FROM sale_items;
DELETE FROM sales;

-- Auto-increment reset karo 1 se
ALTER TABLE sales AUTO_INCREMENT = 1;
ALTER TABLE sale_items AUTO_INCREMENT = 1;
```

> **Warning:** Yeh saara purana sales data permanently delete kar dega. Agar sirf order number reset karna hai aur data rakhna hai to sirf `ALTER TABLE` wali 2 lines run karo — lekin next order number tab bhi last ID ke baad se shuru hoga.
