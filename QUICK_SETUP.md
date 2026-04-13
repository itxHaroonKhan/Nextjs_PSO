# 🚀 Quick Database Setup

## Current Status
- ✅ Backend server: Running on http://localhost:5001
- ✅ Frontend server: Running on http://localhost:9002
- ❌ Database: Not connected (MySQL password needed)

## Problem
Your MySQL root password is unknown. The backend cannot access the database.

## Solution (Choose ONE method)

### Method 1: Reset MySQL Password (Recommended)

1. **Open Command Prompt as Administrator** (Search "cmd" in Windows → Right-click → "Run as administrator")

2. **Stop MySQL service:**
   ```
   net stop MySQL84
   ```

3. **Create a text file** `C:\mysql-init.txt` with exactly these 2 lines:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
   FLUSH PRIVILEGES;
   ```

4. **Start MySQL with password reset:**
   ```
   "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" --init-file="C:\mysql-init.txt" --console
   ```
   Wait 10 seconds, then press `Ctrl+C`

5. **Start MySQL normally:**
   ```
   net start MySQL84
   ```

6. **Test connection:**
   ```
   "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql" -u root -ppassword
   ```
   If you see `mysql>`, it worked! Type `exit` to quit.

### Method 2: Use MySQL Workbench to Reset Password

1. Open **MySQL Workbench**
2. Click your local connection
3. Go to **Server** → **Users and Privileges**
4. Click on **root** user
5. Set new password to: `password`
6. Click **Apply**

## After Setting Password

### Step 1: Create Database & Tables

Open Command Prompt and run:

```bash
cd "C:\Program Files\MySQL\MySQL Server 8.4\bin"
mysql -u root -ppassword
```

In MySQL, run these commands:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS pos_system;
USE pos_system;

-- Run setup script
source C:/Users/Digital Lucent/Desktop/pos-system/setup_database.sql
```

### Step 2: Restart Backend

Stop the backend (press `Ctrl+C` in its terminal), then restart:

```bash
cd C:\Users\Digital Lucent\Desktop\pos-system\Backend
node index.js
```

You should see:
```
✅ Database connected
🚀 Server running on http://localhost:5001
```

### Step 3: Refresh Frontend

Refresh your browser at http://localhost:9002/inventory

## Alternative: Skip Database (Development Mode)

If you just want to test the UI without database:

The backend is already running and will respond to requests, but database queries will return errors. The frontend UI components will still load and display.

## Need Help?

If MySQL setup fails, check:
- `SETUP_INSTRUCTIONS.md` in project root for detailed guide
- MySQL service status: `sc query MySQL84`
- MySQL logs: `C:\ProgramData\MySQL\MySQL Server 8.4\Data\*.err`
