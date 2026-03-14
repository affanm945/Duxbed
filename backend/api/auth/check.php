<?php
/**
 * Check Authentication Status API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

session_start();

if (isset($_SESSION['admin_id'])) {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT id, username, email, full_name, role, status FROM admin_users WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_SESSION['admin_id']);
        $stmt->execute();
        
        $user = $stmt->fetch();
        
        if ($user && $user['status'] === 'active') {
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            session_destroy();
            http_response_code(401);
            echo json_encode(['success' => false, 'authenticated' => false, 'message' => 'Account is inactive']);
        }
    } catch (Exception $e) {
        session_destroy();
        http_response_code(401);
        echo json_encode(['success' => false, 'authenticated' => false, 'message' => 'Authentication check failed']);
    }
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'authenticated' => false, 'message' => 'Not authenticated']);
}

