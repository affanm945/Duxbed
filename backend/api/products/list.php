<?php
/**
 * List Products API
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
    exit();
}

try {
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $subcategory = isset($_GET['subcategory']) ? $_GET['subcategory'] : null;
    $active_only = isset($_GET['active_only']) && $_GET['active_only'] === 'true';
    
    $query = "SELECT * FROM products WHERE 1=1";
    $params = [];
    
    if ($category) {
        $query .= " AND category = :category";
        $params[':category'] = $category;
    }
    
    if ($subcategory) {
        $query .= " AND subcategory = :subcategory";
        $params[':subcategory'] = $subcategory;
    }
    
    if ($active_only) {
        $query .= " AND is_active = 1";
    }
    
    $query .= " ORDER BY category, display_order ASC, created_at DESC";
    
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    echo json_encode(normalize_media_urls_in_array(['success' => true, 'data' => $products]));
} catch (Exception $e) {
    error_log("Product list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
