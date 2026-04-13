@echo off
echo ====================================
echo MySQL Root Password Reset Tool
echo ====================================
echo.
echo This will reset your MySQL root password to 'password'
echo.
echo IMPORTANT: Make sure MySQL is running as a service
echo.
pause

echo.
echo Step 1: Stopping MySQL service...
net stop MySQL84
if %ERRORLEVEL% NEQ 0 (
    echo Failed to stop MySQL. Make sure you're running as Administrator.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating temporary init file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'password'; > C:\mysql-init.txt
echo FLUSH PRIVILEGES; >> C:\mysql-init.txt

echo.
echo Step 3: Starting MySQL with init file...
echo Starting MySQL... (this may take a moment)
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" --init-file="C:\mysql-init.txt" --console

timeout /t 10 /nobreak >nul

echo.
echo Step 4: Stopping MySQL...
taskkill /F /IM mysqld.exe >nul 2>&1

echo.
echo Step 5: Starting MySQL service normally...
net start MySQL84

echo.
echo Step 6: Cleaning up...
del C:\mysql-init.txt

echo.
echo ====================================
echo Password Reset Complete!
echo ====================================
echo.
echo New password: password
echo.
echo The Backend\.env file has been updated.
echo.
echo Next steps:
echo 1. Start backend: cd Backend ^&^& node index.js
echo 2. Run database setup: setup_database.sql
echo 3. Start frontend: cd frontend ^&^& npm run dev
echo.
pause
