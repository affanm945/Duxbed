<?php
/**
 * Create Product API
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

if (!isset($data['name']) || !isset($data['category']) || !isset($data['thumbnail_url']) || !isset($data['full_image_url'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, category, thumbnail_url, and full_image_url are required']);
    exit();
}

try {
    $name = $data['name'];
    $category = $data['category'];
    $subcategory = $data['subcategory'] ?? null;
    $thumbnail_url = $data['thumbnail_url'];
    $full_image_url = $data['full_image_url'];
    $whatsapp_text = $data['whatsapp_text'] ?? '';
    $description = $data['description'] ?? null;
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
    $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
    
    // Validate category
    $valid_categories = ['Space saving furniture', 'Duxpod', 'Interior designing', 'Modular kitchen'];
    if (!in_array($category, $valid_categories)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid category']);
        exit();
    }
    
    // Insert product
    $query = "INSERT INTO products (category, subcategory, name, thumbnail_url, full_image_url, whatsapp_text, description, is_active, display_order) 
             VALUES (:category, :subcategory, :name, :thumbnail_url, :full_image_url, :whatsapp_text, :description, :is_active, :display_order)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':subcategory', $subcategory);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':thumbnail_url', $thumbnail_url);
    $stmt->bindParam(':full_image_url', $full_image_url);
    $stmt->bindParam(':whatsapp_text', $whatsapp_text);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
    $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
    
    $stmt->execute();
    $product_id = $db->lastInsertId();
    
    echo json_encode(['success' => true, 'message' => 'Product created successfully', 'id' => $product_id]);
} catch (Exception $e) {
    error_log("Product create error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
