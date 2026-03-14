<?php
/**
 * Product Categories API (for managing category header images)
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // List all categories
        $query = "SELECT * FROM product_categories ORDER BY display_order ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        echo json_encode(normalize_media_urls_in_array(['success' => true, 'data' => $categories]));
    } elseif ($method === 'PUT') {
        // Update category (requires auth)
        requireAuth();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['category_name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Category name is required']);
            exit();
        }
        
        $category_name = $data['category_name'];
        $update_fields = [];
        $params = [':category_name' => $category_name];
        
        if (isset($data['header_image_url'])) {
            $update_fields[] = "header_image_url = :header_image_url";
            $params[':header_image_url'] = $data['header_image_url'];
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
        
        $query = "UPDATE product_categories SET " . implode(', ', $update_fields) . " WHERE category_name = :category_name";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            if (strpos($key, ':is_active') !== false || strpos($key, ':display_order') !== false) {
                $stmt->bindValue($key, $value, is_bool($value) ? PDO::PARAM_BOOL : PDO::PARAM_INT);
            } else {
                $stmt->bindValue($key, $value);
            }
        }
        
        $stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Category updated successfully']);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("Category API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
