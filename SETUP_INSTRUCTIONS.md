# MySQL Database Setup Guide for POS System

## Problem
Your MySQL root password is unknown. The backend cannot connect to the database.

## Solution: Reset MySQL Root Password

### Method 1: Using MySQL Installer (Easiest)
1. Open **Windows Settings** → **Apps**
2. Find **MySQL Server 8.4**
3. Click **Modify** or **Change**
4. Follow the wizard to reset the root password
5. Set password to: `password`
6. Complete the wizard

### Method 2: Manual Reset (Requires Administrator)
1. **Open Command Prompt as Administrator**

2. **Stop MySQL service:**
   ```
   net stop MySQL84
   ```

3. **Create init file** - Create `C:\mysql-init.txt` with this content:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
   FLUSH PRIVILEGES;
   ```

4. **Start MySQL with init file:**
   ```
   "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" --init-file="C:\mysql-init.txt" --console
   ```

5. **Wait 10 seconds**, then press `Ctrl+C`

6. **Start MySQL normally:**
   ```
   net start MySQL84
   ```

7. **Test connection:**
   ```
   "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql" -u root -ppassword
   ```

## After Password is Set

### Step 1: Update Backend .env
Make sure `Backend\.env` has:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=pos_system
```

### Step 2: Create Database
```bash
cd "C:\Program Files\MySQL\MySQL Server 8.4\bin"
mysql -u root -ppassword
```

Then run these SQL commands:
```sql
CREATE DATABASE pos_system;
USE pos_system;
```

### Step 3: Create Tables
Copy the content of `setup_database.sql` and paste it in the MySQL console, or run:
```bash
mysql -u root -ppassword pos_system < setup_database.sql
```

### Step 4: Start the Application
**Backend:**
```bash
cd Backend
node index.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Quick Test
After setup, test your MySQL connection:
```bash
mysql -u root -ppassword -e "SHOW DATABASES;"
```

You should see `pos_system` in the list.

## Troubleshooting
- **Service won't start?** Check Windows Services (services.msc) for MySQL84
- **Access denied?** Double-check the password in .env matches your MySQL root password
- **Database doesn't exist?** Run the CREATE DATABASE command above
