<?php
/**
 * Update Product API
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

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit();
}

try {
    $id = (int)$data['id'];
    
    // Build update query dynamically
    $update_fields = [];
    $params = [':id' => $id];
    
    if (isset($data['name'])) {
        $update_fields[] = "name = :name";
        $params[':name'] = $data['name'];
    }
    
    if (isset($data['category'])) {
        $valid_categories = ['Space saving furniture', 'Duxpod', 'Interior designing', 'Modular kitchen'];
        if (!in_array($data['category'], $valid_categories)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid category']);
            exit();
        }
        $update_fields[] = "category = :category";
        $params[':category'] = $data['category'];
    }
    
    if (isset($data['subcategory'])) {
        $update_fields[] = "subcategory = :subcategory";
        $params[':subcategory'] = $data['subcategory'];
    }
    
    if (isset($data['thumbnail_url'])) {
        $update_fields[] = "thumbnail_url = :thumbnail_url";
        $params[':thumbnail_url'] = $data['thumbnail_url'];
    }
    
    if (isset($data['full_image_url'])) {
        $update_fields[] = "full_image_url = :full_image_url";
        $params[':full_image_url'] = $data['full_image_url'];
    }
    
    if (isset($data['whatsapp_text'])) {
        $update_fields[] = "whatsapp_text = :whatsapp_text";
        $params[':whatsapp_text'] = $data['whatsapp_text'];
    }
    
    if (isset($data['description'])) {
        $update_fields[] = "description = :description";
        $params[':description'] = $data['description'];
    }
    
    if (isset($data['display_order'])) {
        $update_fields[] = "display_order = :display_order";
        $params[':display_order'] = (int)$data['display_order'];
    }
    
    if (isset($data['is_active'])) {
        $update_fields[] = "is_active = :is_active";
        $params[':is_active'] = (bool)$data['is_active'];
    }
    
    if (empty($update_fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit();
    }
    
    $query = "UPDATE products SET " . implode(', ', $update_fields) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        if (strpos($key, ':is_active') !== false || strpos($key, ':display_order') !== false) {
            $stmt->bindValue($key, $value, is_bool($value) ? PDO::PARAM_BOOL : PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    $stmt->execute();
    
    echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
} catch (Exception $e) {
    error_log("Product update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
