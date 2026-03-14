<?php
/**
 * Create Premium Project API
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

if (!isset($data['title']) || !isset($data['thumbnail_url'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Title and thumbnail are required']);
    exit();
}

try {
    $db->beginTransaction();
    
    // Prepare data with proper types
    $title = $data['title'];
    $category = $data['category'] ?? 'Residential';
    $thumbnail_url = $data['thumbnail_url'];
    $type = $data['type'] ?? 'gallery';
    $video_url = $data['video_url'] ?? null;
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
    $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
    
    // Insert project
    $query = "INSERT INTO premium_projects (title, category, thumbnail_url, type, video_url, is_active, display_order) 
             VALUES (:title, :category, :thumbnail_url, :type, :video_url, :is_active, :display_order)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':thumbnail_url', $thumbnail_url);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':video_url', $video_url);
    $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
    $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
    
    $stmt->execute();
    $project_id = $db->lastInsertId();
    
    // Insert images if provided
    if (isset($data['images']) && is_array($data['images']) && count($data['images']) > 0) {
        $image_query = "INSERT INTO project_images (project_id, image_url, alt_text, display_order) 
                       VALUES (:project_id, :image_url, :alt_text, :display_order)";
        $image_stmt = $db->prepare($image_query);
        
        foreach ($data['images'] as $index => $image) {
            if (!isset($image['url']) || empty($image['url'])) {
                continue; // Skip invalid images
            }
            $image_url = $image['url'];
            $alt_text = $image['alt'] ?? '';
            $display_order = $index;
            
            $image_stmt->bindParam(':project_id', $project_id, PDO::PARAM_INT);
            $image_stmt->bindParam(':image_url', $image_url);
            $image_stmt->bindParam(':alt_text', $alt_text);
            $image_stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
            $image_stmt->execute();
        }
    }
    
    $db->commit();
    
    echo json_encode(['success' => true, 'message' => 'Project created successfully', 'id' => $project_id]);
} catch (Exception $e) {
    // Only rollback if transaction is still active
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Project create error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

