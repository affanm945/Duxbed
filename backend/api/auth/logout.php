<?php
/**
 * Admin Logout API
 */

require_once '../../config/config.php';

header('Content-Type: application/json');

session_start();

if (isset($_SESSION['admin_id'])) {
    // Destroy session
    session_unset();
    session_destroy();
    
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
}

