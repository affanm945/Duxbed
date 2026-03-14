<?php
/**
 * Homepage Videos Management API
 */

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
        // Get all videos (public endpoint for frontend)
        try {
            // Public API - always show only active videos
            $query = "SELECT * FROM homepage_videos WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $videos = $stmt->fetchAll();
            
            echo json_encode(normalize_media_urls_in_array(['success' => true, 'data' => $videos]));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch videos', 'error' => $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Create new video (requires authentication)
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
            exit();
        }
        
        if (empty($data['video_url'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Video URL is required']);
            exit();
        }
        
        try {
            $query = "INSERT INTO homepage_videos (video_url, video_type, thumbnail_url, title, description, is_active, display_order) 
                     VALUES (:video_url, :video_type, :thumbnail_url, :title, :description, :is_active, :display_order)";
            $stmt = $db->prepare($query);
            
            $video_url = $data['video_url'];
            $video_type = 'youtube';
            $thumbnail_url = $data['thumbnail_url'] ?? null;
            $title = $data['title'] ?? null;
            $description = $data['description'] ?? null;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
            
            $stmt->bindParam(':video_url', $video_url);
            $stmt->bindParam(':video_type', $video_type);
            $stmt->bindParam(':thumbnail_url', $thumbnail_url);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                $id = $db->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Video created successfully', 'id' => $id]);
            } else {
                http_response_code(400);
                $errorInfo = $stmt->errorInfo();
                echo json_encode(['success' => false, 'message' => 'Failed to create video: ' . ($errorInfo[2] ?? 'Database error')]);
            }
        } catch (Exception $e) {
            error_log("Video create error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Update video (requires authentication)
        requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Video ID is required']);
            exit();
        }
        
        try {
            $query = "UPDATE homepage_videos SET 
                     video_url = :video_url, 
                     video_type = :video_type,
                     thumbnail_url = :thumbnail_url,
                     title = :title,
                     description = :description,
                     is_active = :is_active,
                     display_order = :display_order
                     WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':video_url', $data['video_url']);
            $stmt->bindValue(':video_type', 'youtube');
            $stmt->bindParam(':thumbnail_url', $data['thumbnail_url']);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':is_active', $data['is_active']);
            $stmt->bindParam(':display_order', $data['display_order']);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Video updated successfully']);
            } else {
                http_response_code(400);
                $errorInfo = $stmt->errorInfo();
                echo json_encode(['success' => false, 'message' => 'Failed to update video: ' . ($errorInfo[2] ?? 'Database error')]);
            }
        } catch (Exception $e) {
            error_log("Video update error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Delete video (requires authentication)
        requireAuth();
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Video ID is required']);
            exit();
        }
        
        try {
            $query = "DELETE FROM homepage_videos WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Video deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to delete video']);
            }
        } catch (Exception $e) {
            error_log("Video delete error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

