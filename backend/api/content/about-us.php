<?php
/**
 * About Us Content API
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

$database = new Database();
$db = $database->getConnection();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            // Public API - always show only active content
            $query = "SELECT * FROM about_us_content WHERE is_active = 1 ORDER BY display_order ASC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $content = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(normalize_media_urls_in_array(['success' => true, 'data' => $content]));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch content']);
        }
        break;
        
    case 'POST':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || empty($data['section_key'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Section key is required']);
            exit();
        }
        
        try {
            $section_key = $data['section_key'];
            $title = $data['title'] ?? null;
            $content = $data['content'] ?? null;
            $image_url = $data['image_url'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "INSERT INTO about_us_content (section_key, title, content, image_url, display_order, is_active) 
                     VALUES (:section_key, :title, :content, :image_url, :display_order, :is_active)
                     ON DUPLICATE KEY UPDATE 
                     title = VALUES(title), 
                     content = VALUES(content), 
                     image_url = VALUES(image_url), 
                     display_order = VALUES(display_order), 
                     is_active = VALUES(is_active)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':section_key', $section_key);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':content', $content);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                $id = $db->lastInsertId() ?: $db->query("SELECT id FROM about_us_content WHERE section_key = '$section_key'")->fetch()['id'];
                echo json_encode(['success' => true, 'message' => 'Content saved successfully', 'id' => $id]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to save content']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Content ID is required']);
            exit();
        }
        
        try {
            $id = (int)$data['id'];
            $title = $data['title'] ?? null;
            $content = $data['content'] ?? null;
            $image_url = $data['image_url'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "UPDATE about_us_content SET 
                     title = :title, 
                     content = :content, 
                     image_url = :image_url, 
                     display_order = :display_order, 
                     is_active = :is_active
                     WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':content', $content);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Content updated successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to update content']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        requireAuth();
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Content ID is required']);
            exit();
        }
        
        try {
            $query = "DELETE FROM about_us_content WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Content section deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to delete content section']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

