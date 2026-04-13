-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier') DEFAULT 'cashier',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(50),
    description TEXT,
    selling_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock INT DEFAULT 0,
    threshold INT DEFAULT 10,
    unit_type VARCHAR(20) DEFAULT 'pcs',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    pincode VARCHAR(10),
    gst_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    final_total DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50),
    status ENUM('completed', 'cancelled', 'refunded') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(200) DEFAULT 'Elites POS',
    store_address TEXT,
    store_phone VARCHAR(20),
    store_email VARCHAR(100),
    store_gstin VARCHAR(20),
    currency VARCHAR(10) DEFAULT 'INR',
    tax_rate DECIMAL(5, 2) DEFAULT 18.00,
    items_per_page INT DEFAULT 10,
    theme VARCHAR(20) DEFAULT 'light',
    invoice_prefix VARCHAR(10) DEFAULT 'INV',
    low_stock_alert INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu items table (for POS terminal)
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    image TEXT,
    description TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin', 'admin@elites.com', '$2b$10$rN8VqhK5KzKx9ZxKxKxKxOxKxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'admin');

-- Insert default settings
INSERT IGNORE INTO settings (id, store_name, store_address, store_phone, store_email, store_gstin, currency, tax_rate) VALUES 
(1, 'Elites POS', '123 Main Street', '+91 9876543210', 'info@elites.com', '22AAAAA0000A1Z5', 'INR', 18.00);

-- Insert sample products
INSERT IGNORE INTO products (name, category, sku, selling_price, cost_price, stock, threshold, unit_type) VALUES 
('Sample Product 1', 'Electronics', 'ELEC001', 999.00, 750.00, 50, 10, 'pcs'),
('Sample Product 2', 'Groceries', 'GROC001', 150.00, 120.00, 100, 20, 'pcs'),
('Sample Product 3', 'Beverages', 'BEV001', 50.00, 35.00, 200, 50, 'pcs');

-- Insert sample menu items
INSERT IGNORE INTO menu_items (name, category, price, stock, description) VALUES 
('Special Burger', 'Special', 199.00, 50, 'Delicious special burger'),
('Chicken Soup', 'Soups', 120.00, 30, 'Hot and fresh chicken soup'),
('Chocolate Cake', 'Desserts', 250.00, 20, 'Rich chocolate cake'),
('Grilled Chicken', 'Chickens', 350.00, 25, 'Perfectly grilled chicken');
