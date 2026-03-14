@echo off
echo ========================================
echo Duxbed Website - Database Setup Helper
echo ========================================
echo.
echo This script will help you set up the database.
echo.
echo PREREQUISITES:
echo 1. MySQL must be installed and running
echo 2. You need to know your MySQL username and password
echo 3. MySQL command line client should be accessible
echo.
pause

echo.
echo Please provide your MySQL credentials:
echo.
set /p DB_USER="MySQL Username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="MySQL Password (press Enter if no password): "

echo.
echo Attempting to create database and tables...
echo.

if "%DB_PASS%"=="" (
    mysql -u %DB_USER% < backend\database\schema.sql
) else (
    mysql -u %DB_USER% -p%DB_PASS% < backend\database\schema.sql
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Database setup completed successfully!
    echo ========================================
    echo.
    echo The database 'duxbed_website' has been created.
    echo Default admin credentials:
    echo   Username: admin
    echo   Password: admin123
    echo.
    echo IMPORTANT: Change the admin password after first login!
    echo.
) else (
    echo.
    echo ========================================
    echo Database setup FAILED!
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. MySQL is not running
    echo 2. Incorrect username/password
    echo 3. MySQL command line client not found in PATH
    echo.
    echo MANUAL SETUP:
    echo 1. Open MySQL Workbench or phpMyAdmin
    echo 2. Connect to your MySQL server
    echo 3. Open the file: backend\database\schema.sql
    echo 4. Execute the SQL script
    echo.
)

pause

