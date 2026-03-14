<?php
/**
 * Update Media Item API
 */

// Suppress warnings to prevent breaking JSON response
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

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Media item ID is required']);
    exit();
}

try {
    // Prepare data with proper types
    $id = (int)$data['id'];
    $type = $data['type'];
    $title = $data['title'];
    $description = $data['description'] ?? null;
    $content = $data['content'] ?? null;
    $image_url = $data['image_url'] ?? null;
    $video_url = $data['video_url'] ?? null;
    $event_date = $data['event_date'] ?? null;
    $is_published = isset($data['is_published']) ? (bool)$data['is_published'] : false;
    
    $query = "UPDATE media_items SET 
             type = :type,
             title = :title,
             description = :description,
             content = :content,
             image_url = :image_url,
             video_url = :video_url,
             event_date = :event_date,
             is_published = :is_published
             WHERE id = :id";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':content', $content);
    $stmt->bindParam(':image_url', $image_url);
    $stmt->bindParam(':video_url', $video_url);
    $stmt->bindParam(':event_date', $event_date);
    $stmt->bindParam(':is_published', $is_published, PDO::PARAM_BOOL);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Media item updated successfully']);
    } else {
        http_response_code(400);
        $errorInfo = $stmt->errorInfo();
        echo json_encode(['success' => false, 'message' => 'Failed to update media item: ' . ($errorInfo[2] ?? 'Database error')]);
    }
} catch (Exception $e) {
    error_log("Media update error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

