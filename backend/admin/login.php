<?php
/**
 * Admin Login Page
 */

session_start();
require_once '../config/config.php';
require_once '../includes/functions.php';

if (isAuthenticated()) {
    header('Location: index.php');
    exit();
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($username && $password) {
        require_once '../config/database.php';
        $database = new Database();
        $db = $database->getConnection();
        
        try {
            $query = "SELECT id, username, email, password_hash, full_name, role, status FROM admin_users WHERE username = :username OR email = :email LIMIT 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':email', $username);
            $stmt->execute();
            
            $user = $stmt->fetch();
            
            // Check if user was found and password matches (plain text comparison)
            if (!$user) {
                $error = 'User not found. Please check if admin user exists in database.';
            } elseif ($user['password_hash'] !== $password) {
                $error = 'Invalid username or password';
            } else {
                // Password verified successfully
                if ($user['status'] === 'active') {
                    $_SESSION['admin_id'] = $user['id'];
                    $_SESSION['admin_username'] = $user['username'];
                    $_SESSION['admin_role'] = $user['role'];
                    $_SESSION['admin_name'] = $user['full_name'];
                    $_SESSION['admin_token'] = bin2hex(random_bytes(32));
                    
                    // Update last login
                    $update_query = "UPDATE admin_users SET last_login = NOW() WHERE id = :id";
                    $update_stmt = $db->prepare($update_query);
                    $update_stmt->bindParam(':id', $user['id']);
                    $update_stmt->execute();
                    
                    header('Location: index.php');
                    exit();
                } else {
                    $error = 'Account is inactive. Please contact administrator.';
                }
            }
        } catch (Exception $e) {
            // Show detailed error in development mode
            $error_msg = $e->getMessage();
            error_log("Login error: " . $error_msg);
            
            // Check if it's a database connection error
            if (strpos($error_msg, 'Database connection failed') !== false || 
                strpos($error_msg, 'Access denied') !== false ||
                strpos($error_msg, 'SQLSTATE') !== false) {
                $error = 'Database connection failed. Please check your database configuration. Error: ' . htmlspecialchars($error_msg);
            } else {
                $error = 'Login failed. Please try again. Error: ' . htmlspecialchars($error_msg);
            }
        }
    } else {
        $error = 'Please enter username and password';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Duxbed</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            border-radius: 15px;
        }
        .login-header {
            background: linear-gradient(135deg, #E69B0A 0%, #f5b942 100%);
            color: white;
            padding: 2rem;
            border-radius: 15px 15px 0 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-card bg-white">
            <div class="login-header">
                <h2><i class="bi bi-shield-lock"></i> Admin Panel</h2>
                <p class="mb-0">Duxbed Website Management</p>
            </div>
            <div class="card-body p-4">
                <?php if ($error): ?>
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="bi bi-exclamation-triangle"></i> <?php echo htmlspecialchars($error); ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>
                
                <form method="POST" action="">
                    <div class="mb-3">
                        <label for="username" class="form-label">Username or Email</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-person"></i></span>
                            <input type="text" class="form-control" id="username" name="username" required autofocus>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-lock"></i></span>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                    </div>
                    
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="bi bi-box-arrow-in-right"></i> Login
                        </button>
                    </div>
                </form>
                
                <!-- <div class="text-center mt-3">
                    <small class="text-muted">Default: admin / admin123</small>
                </div> -->
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

