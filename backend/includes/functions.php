<?php
/**
 * Common Functions
 */

/**
 * Verify admin authentication
 */
function isAuthenticated() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['admin_id']) && isset($_SESSION['admin_token']);
}

/**
 * Require authentication (redirect if not authenticated)
 */
function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit();
    }
}

/**
 * Get current admin ID
 */
function getCurrentAdminId() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return $_SESSION['admin_id'] ?? null;
}

/**
 * Check if user is super admin
 */
function isSuperAdmin() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['admin_role']) && $_SESSION['admin_role'] === 'super_admin';
}

/**
 * Upload file helper
 */
function uploadFile($file, $destination_dir, $allowed_types = null) {
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return ['success' => false, 'message' => 'No file uploaded'];
    }
    
    $file_size = $file['size'];
    $max_size_mb = round(MAX_FILE_SIZE / 1048576, 1);
    if ($file_size > MAX_FILE_SIZE) {
        $file_size_mb = round($file_size / 1048576, 2);
        return ['success' => false, 'message' => "File size ({$file_size_mb}MB) exceeds maximum limit of {$max_size_mb}MB"];
    }
    
    if ($allowed_types && !in_array($file['type'], $allowed_types)) {
        return ['success' => false, 'message' => 'File type not allowed'];
    }
    
    $file_ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = uniqid() . '_' . time() . '.' . $file_ext;
    $destination = $destination_dir . $new_filename;
    
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        // Normalize path separators for URL generation (Windows uses backslashes)
        $normalized_destination = str_replace('\\', '/', $destination);
        $normalized_upload_path = str_replace('\\', '/', UPLOAD_PATH);
        $url = str_replace($normalized_upload_path, UPLOAD_URL, $normalized_destination);
        
        return [
            'success' => true,
            'filename' => $new_filename,
            'path' => $destination,
            'url' => $url
        ];
    }
    
    return ['success' => false, 'message' => 'Failed to upload file'];
}

/**
 * Generate order number
 */
function generateOrderNumber() {
    return 'DXB' . date('Ymd') . strtoupper(substr(uniqid(), -6));
}

/**
 * Validate email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Sanitize input
 */
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * JSON response helper
 */
function jsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

/**
 * Pagination helper
 */
function getPaginationParams() {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
    $offset = ($page - 1) * $limit;
    
    return [
        'page' => max(1, $page),
        'limit' => max(1, min(100, $limit)),
        'offset' => max(0, $offset)
    ];
}

