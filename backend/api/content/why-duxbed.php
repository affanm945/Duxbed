<?php
/**
 * Why Duxbed USPs API
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
            // Public API - always show only active USPs
            $query = "SELECT * FROM why_duxbed_usps WHERE is_active = 1 ORDER BY display_order ASC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $usps = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(normalize_media_urls_in_array(['success' => true, 'data' => $usps]));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch USPs']);
        }
        break;
        
    case 'POST':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || empty($data['title'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title is required']);
            exit();
        }
        
        try {
            $icon = $data['icon'] ?? null;
            $title = $data['title'];
            $description = $data['description'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "INSERT INTO why_duxbed_usps (icon, title, description, display_order, is_active) 
                     VALUES (:icon, :title, :description, :display_order, :is_active)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':icon', $icon);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                $id = $db->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'USP created successfully', 'id' => $id]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to create USP']);
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
            echo json_encode(['success' => false, 'message' => 'USP ID is required']);
            exit();
        }
        
        try {
            $id = (int)$data['id'];
            $icon = $data['icon'] ?? null;
            $title = $data['title'];
            $description = $data['description'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "UPDATE why_duxbed_usps SET 
                     icon = :icon, 
                     title = :title, 
                     description = :description, 
                     display_order = :display_order, 
                     is_active = :is_active
                     WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':icon', $icon);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'USP updated successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to update USP']);
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
            echo json_encode(['success' => false, 'message' => 'USP ID is required']);
            exit();
        }
        
        try {
            $query = "DELETE FROM why_duxbed_usps WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'USP deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to delete USP']);
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

