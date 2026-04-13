@echo off
echo ====================================
echo MySQL Database Setup for POS System
echo ====================================
echo.

REM Try common passwords
set /p MYSQL_PASSWORD="Enter your MySQL root password (press Enter if no password): "

if "%MYSQL_PASSWORD%"=="" (
    set MYSQL_CMD=mysql -u root
) else (
    set MYSQL_CMD=mysql -u root -p%MYSQL_PASSWORD%
)

echo.
echo Testing connection...
cd "C:\Program Files\MySQL\MySQL Server 8.4\bin"
%MYSQL_CMD% -e "SELECT 1" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Cannot connect to MySQL with provided password.
    echo.
    echo To reset your MySQL root password:
    echo 1. Open Services (Win+R, type: services.msc)
    echo 2. Stop MySQL84 service
    echo 3. Open Command Prompt as Administrator
    echo 4. Run: mysqld --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" --init-file="C:\mysql-init.txt"
    echo.
    echo Or update the .env file with the correct password.
    pause
    exit /b 1
)

echo [OK] Connected to MySQL successfully!
echo.

REM Check if database exists
%MYSQL_CMD% -e "CREATE DATABASE IF NOT EXISTS pos_system;" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database 'pos_system' created or already exists.
) else (
    echo [ERROR] Failed to create database.
    pause
    exit /b 1
)

echo.
REM Update .env file with correct password
cd /d "%~dp0"
if "%MYSQL_PASSWORD%"=="" (
    (
        echo # Server Configuration
        echo PORT=5001
        echo NODE_ENV=development
        echo.
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=pos_system
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=mysecretkey12345
    ) > Backend\.env
) else (
    (
        echo # Server Configuration
        echo PORT=5001
        echo NODE_ENV=development
        echo.
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=%MYSQL_PASSWORD%
        echo DB_NAME=pos_system
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=mysecretkey12345
    ) > Backend\.env
)

echo [OK] Updated Backend\.env file.
echo.

REM Create tables
echo Creating database tables...
%MYSQL_CMD% pos_system < setup_database.sql 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Tables created successfully!
) else (
    echo [WARNING] Some tables may already exist or there was an error.
)

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Start backend: cd Backend ^&^& node index.js
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo.
pause
