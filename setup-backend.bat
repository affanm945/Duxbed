@echo off
echo ========================================
echo Duxbed Website - Backend Setup Script
echo ========================================
echo.

REM Try to find PHP - check XAMPP first, then system PATH
set PHP_EXE=
if exist "C:\xampp\php\php.exe" (
    set PHP_EXE=C:\xampp\php\php.exe
) else if exist "C:\xamp\php\php.exe" (
    set PHP_EXE=C:\xamp\php\php.exe
) else (
    REM Try system PATH
    php --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PHP_EXE=php
    )
)

if "%PHP_EXE%"=="" (
    echo ERROR: PHP is not installed or not in PATH
    echo.
    echo Please either:
    echo 1. Install XAMPP at C:\xampp\ or C:\xamp\
    echo 2. Add PHP to your system PATH
    echo 3. Or install PHP from https://www.php.net/downloads
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking PHP installation...
echo Using PHP: %PHP_EXE%
%PHP_EXE% --version
echo.

REM Create upload directories
echo [2/4] Creating upload directories...
if not exist backend\uploads mkdir backend\uploads
if not exist backend\uploads\images mkdir backend\uploads\images
if not exist backend\uploads\videos mkdir backend\uploads\videos
if not exist backend\uploads\documents mkdir backend\uploads\documents
if not exist backend\uploads\thumbnails mkdir backend\uploads\thumbnails
if not exist backend\uploads\resumes mkdir backend\uploads\resumes
echo Upload directories created.
echo.

REM Check database configuration
echo [3/4] Checking database configuration...
echo.
echo Current database settings in backend\config\database.php:
echo.
findstr /C:"private $host" backend\config\database.php
findstr /C:"private $db_name" backend\config\database.php
findstr /C:"private $username" backend\config\database.php
findstr /C:"private $password" backend\config\database.php
echo.

set /p SETUP_DB="Do you want to set up the database now? (y/n): "
if /i "%SETUP_DB%"=="y" (
    call setup-database.bat
)

REM Check if MySQL is accessible
echo.
echo [4/4] Testing database connection...
%PHP_EXE% -r "try { $db = new PDO('mysql:host=localhost', 'root', ''); echo 'MySQL connection successful!'; } catch(Exception $e) { echo 'MySQL connection failed: ' . $e->getMessage(); }"
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. If database setup was skipped, run: setup-database.bat
echo 2. Start the backend server: start-backend.bat
echo 3. Or manually run: cd backend ^&^& %PHP_EXE% -S localhost:8000 -t . router.php
echo.
echo The backend will be available at: http://localhost:8000
echo Admin panel: http://localhost:8000/admin/login.php
echo.
pause