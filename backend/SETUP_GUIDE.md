# Duxbed Backend Setup Guide

## Prerequisites
- PHP 7.4 or higher
- MySQL 8.0 (MySQL Workbench)
- Apache/Nginx server OR PHP built-in server
- Node.js & npm (for frontend)

## Step 1: Database Setup

1. Open **MySQL Workbench 8.0**
2. Connect to your MySQL server
3. Open and run the SQL file: `database/schema.sql`
4. Verify database `duxbed_website` is created with all tables

## Step 2: Configure Database Connection

Edit `config/database.php` and update these values:
```php
private $host = "localhost";        // Your MySQL host
private $db_name = "duxbed_website"; // Database name
private $username = "root";          // Your MySQL username
private $password = "";              // Your MySQL password
```

## Step 3: Run PHP Backend

### Option A: Using PHP Built-in Server (Quick Start)

Open terminal in the `backend` folder and run:
```bash
cd backend
php -S localhost:8000
```

The backend will be available at: `http://localhost:8000`

### Option B: Using Apache/XAMPP/WAMP

1. **XAMPP/WAMP Setup:**
   - Install XAMPP or WAMP
   - Copy the entire project to `htdocs` (XAMPP) or `www` (WAMP)
   - Start Apache and MySQL from XAMPP/WAMP control panel
   - Access via: `http://localhost/Duxbed_website_Option_I/backend/`

2. **Virtual Host Setup (Recommended for Production):**
   - Configure Apache virtual host pointing to project root
   - Set DocumentRoot to project directory
   - Enable mod_rewrite in Apache

## Step 4: Test Backend

### Test Admin Login:
1. Open browser: `http://localhost:8000/admin/login.php`
2. Login with:
   - Username: `admin`
   - Password: `admin123`

### Test API Endpoint:
Open: `http://localhost:8000/api/auth/check.php`
Should return JSON response

## Step 5: Configure Frontend to Connect to Backend

The React frontend needs to know where the PHP backend is located.

### Update Frontend Configuration:

1. Create a config file in `src/config/api.ts` (or `.js`)
2. Update API calls in React components to use the backend URL
3. Ensure CORS is properly configured in `backend/config/config.php`

## Step 6: File Permissions (Linux/Mac)

```bash
chmod 755 backend/uploads/
chmod 755 backend/uploads/images/
chmod 755 backend/uploads/videos/
chmod 755 backend/uploads/documents/
chmod 755 backend/uploads/resumes/
```

## Troubleshooting

### Issue: "Connection refused" or "Cannot connect to database"
- Check MySQL is running
- Verify database credentials in `config/database.php`
- Ensure database `duxbed_website` exists

### Issue: "Permission denied" on file uploads
- Check `backend/uploads/` directory permissions
- Ensure PHP has write access to upload directories

### Issue: CORS errors in browser
- Update `FRONTEND_URL` in `backend/config/config.php`
- Ensure backend URL matches your frontend dev server

## Access Points

- **Admin Panel:** `http://localhost:8000/admin/login.php`
- **API Base:** `http://localhost:8000/api/`
- **Frontend:** `http://localhost:5173` (Vite default)

