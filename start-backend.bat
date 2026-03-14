@echo off
echo Starting PHP Backend Server...
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

echo Using PHP: %PHP_EXE%
%PHP_EXE% --version
echo.

REM Check if upload directories exist
if not exist backend\uploads mkdir backend\uploads >nul 2>&1
if not exist backend\uploads\images mkdir backend\uploads\images >nul 2>&1
if not exist backend\uploads\videos mkdir backend\uploads\videos >nul 2>&1
if not exist backend\uploads\documents mkdir backend\uploads\documents >nul 2>&1
if not exist backend\uploads\thumbnails mkdir backend\uploads\thumbnails >nul 2>&1
if not exist backend\uploads\resumes mkdir backend\uploads\resumes >nul 2>&1

echo Backend will be available at: http://localhost:8000
echo Admin Panel: http://localhost:8000/admin/login.php
echo API Base: http://localhost:8000/api/
echo.
echo Press Ctrl+C to stop the server
echo.
cd backend
%PHP_EXE% -S localhost:8000 router.php

