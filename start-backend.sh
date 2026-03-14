#!/bin/bash

echo "Starting PHP Backend Server..."
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "Admin Panel: http://localhost:8000/admin/login.php"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd backend
php -S localhost:8000

