<?php

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
    exit();
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $query = "SELECT * FROM leadership_profiles WHERE is_active = 1 ORDER BY display_order ASC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(normalize_media_urls_in_array(['success' => true, 'data' => $profiles]));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch leadership profiles']);
        }
        break;
        
    case 'POST':
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || empty($data['name']) || empty($data['position'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name and position are required']);
            exit();
        }
        
        try {
            $name = $data['name'];
            $position = $data['position'];
            $bio = $data['bio'] ?? null;
            $image_url = $data['image_url'] ?? null;
            $email = $data['email'] ?? null;
            $linkedin_url = $data['linkedin_url'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "INSERT INTO leadership_profiles (name, position, bio, image_url, email, linkedin_url, display_order, is_active) 
                     VALUES (:name, :position, :bio, :image_url, :email, :linkedin_url, :display_order, :is_active)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':position', $position);
            $stmt->bindParam(':bio', $bio);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':linkedin_url', $linkedin_url);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                $id = $db->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Leadership profile created successfully', 'id' => $id]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to create leadership profile']);
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
            echo json_encode(['success' => false, 'message' => 'Profile ID is required']);
            exit();
        }
        
        try {
            $id = (int)$data['id'];
            $name = $data['name'];
            $position = $data['position'];
            $bio = $data['bio'] ?? null;
            $image_url = $data['image_url'] ?? null;
            $email = $data['email'] ?? null;
            $linkedin_url = $data['linkedin_url'] ?? null;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "UPDATE leadership_profiles SET 
                     name = :name, 
                     position = :position, 
                     bio = :bio, 
                     image_url = :image_url, 
                     email = :email, 
                     linkedin_url = :linkedin_url, 
                     display_order = :display_order, 
                     is_active = :is_active
                     WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':position', $position);
            $stmt->bindParam(':bio', $bio);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':linkedin_url', $linkedin_url);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Leadership profile updated successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to update leadership profile']);
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
            echo json_encode(['success' => false, 'message' => 'Profile ID is required']);
            exit();
        }
        
        try {
            $query = "DELETE FROM leadership_profiles WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Leadership profile deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to delete leadership profile']);
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