# Elites POS System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn**

## Database Setup

1. **Start MySQL Server**
   - Make sure MySQL is running on your system
   - Default: `localhost:3306`

2. **Create Database and Tables**
   ```bash
   # Open MySQL command line or MySQL Workbench and run:
   mysql -u root -p < database_schema.sql
   ```
   
   Or manually execute the SQL file in MySQL:
   ```sql
   source /path/to/database_schema.sql
   ```

3. **Verify Database**
   ```sql
   USE elites_pos;
   SHOW TABLES;
   ```

## Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd Backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   The `.env` file is already created with default settings. Edit if needed:
   ```env
   PORT=5001
   JWT_SECRET=elites-pos-secret-key-change-in-production-2024
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=elites_pos
   
   FRONTEND_URL=http://localhost:9002
   ```

4. **Start Backend Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   The server will start on: `http://localhost:5001`

## Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   The frontend will start on: `http://localhost:9002`

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Default Login Credentials

**Admin Account:**
- Email: `admin@elites.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Testing the Application

1. **Start Backend** (Terminal 1)
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Open browser and navigate to: `http://localhost:9002`
   - Login with the admin credentials above

## Troubleshooting

### Backend Issues

**Problem: Database connection failed**
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database `elites_pos` exists

**Problem: JWT_SECRET error**
- Make sure `JWT_SECRET` is set in `.env` file
- Use a strong, unique secret in production

**Problem: CORS errors**
- The CORS is configured to allow `http://localhost:9002`
- If frontend runs on different port, update `FRONTEND_URL` in `.env`

### Frontend Issues

**Problem: API calls failing**
- Ensure backend is running on port 5001
- Check browser console for specific errors
- Verify CORS is properly configured

**Problem: Build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

## Project Structure

```
pos-system/
├── Backend/                 # Express.js API server
│   ├── middleware/         # Auth and error handling
│   ├── routes/            # API route handlers
│   ├── db.js              # Database connection
│   ├── index.js           # Main server file
│   └── .env               # Environment variables
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/          # Page components
│   │   ├── components/   # Reusable components
│   │   ├── lib/          # Utilities and API client
│   │   └── contexts/     # React contexts
│   └── public/           # Static assets
├── database_schema.sql    # Database setup script
└── SETUP_GUIDE.md        # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products (protected)
- `GET /api/products/:id` - Get single product (protected)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Sales
- `POST /api/sales` - Create sale (protected)
- `GET /api/sales` - Get all sales (admin only)
- `GET /api/sales/:id` - Get single sale (admin only)
- `PUT /api/sales/:id/cancel` - Cancel sale (admin only)

### Customers
- `GET /api/customers` - Get all customers (protected)
- `POST /api/customers` - Create customer (protected)
- `PUT /api/customers/:id` - Update customer (admin only)
- `DELETE /api/customers/:id` - Delete customer (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (admin only)
- `GET /api/dashboard/recent-sales` - Get recent sales (protected)
- `GET /api/dashboard/top-categories` - Get top categories (admin only)

### Reports
- `GET /api/reports/sales-performance` - Sales performance (admin only)
- `GET /api/reports/category-distribution` - Category distribution (admin only)
- `GET /api/reports/tax-summary` - Tax summary (admin only)
- `GET /api/reports/profit-loss` - Profit & loss (admin only)

### Settings
- `GET /api/settings` - Get settings (admin only)
- `PUT /api/settings` - Update settings (admin only)
- `GET /api/settings/store` - Get store info (protected)
- `PUT /api/settings/store` - Update store info (admin only)

## Security Notes

1. **Change default JWT_SECRET** in production
2. **Change default admin password** after first login
3. **Use strong database passwords** in production
4. **Enable HTTPS** in production
5. **Set NODE_ENV=production** in production environment
6. **Regularly update dependencies** to patch security vulnerabilities

## Support

For issues or questions:
- Check the troubleshooting section above
- Review console logs for specific error messages
- Ensure all prerequisites are met
- Verify database and servers are running
