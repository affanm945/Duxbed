<?php
/**
 * Our Story Timeline API
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
            // Public API - always show only active timeline events
            $query = "SELECT * FROM story_timeline WHERE is_active = 1 ORDER BY year ASC, display_order ASC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(normalize_media_urls_in_array(['success' => true, 'data' => $events]));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch timeline']);
        }
        break;
        
    case 'POST':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || empty($data['year']) || empty($data['title'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Year and title are required']);
            exit();
        }
        
        try {
            $year = (int)$data['year'];
            $title = $data['title'];
            $description = $data['description'] ?? null;
            $image_url = $data['image_url'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "INSERT INTO story_timeline (year, title, description, image_url, display_order, is_active) 
                     VALUES (:year, :title, :description, :image_url, :display_order, :is_active)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':year', $year, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                $id = $db->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Timeline event created successfully', 'id' => $id]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to create timeline event']);
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
            echo json_encode(['success' => false, 'message' => 'Event ID is required']);
            exit();
        }
        
        try {
            $id = (int)$data['id'];
            $year = (int)$data['year'];
            $title = $data['title'];
            $description = $data['description'] ?? null;
            $image_url = $data['image_url'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "UPDATE story_timeline SET 
                     year = :year, 
                     title = :title, 
                     description = :description, 
                     image_url = :image_url, 
                     display_order = :display_order, 
                     is_active = :is_active
                     WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':year', $year, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Timeline event updated successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to update timeline event']);
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
            echo json_encode(['success' => false, 'message' => 'Event ID is required']);
            exit();
        }
        
        try {
            $query = "DELETE FROM story_timeline WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Timeline event deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to delete timeline event']);
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

