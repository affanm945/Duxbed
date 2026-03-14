<?php
/**
 * Premium Projects List API (Public for frontend)
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// require_once '../../config/config.php';
// require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if tables exist
    $table_check = $db->query("SHOW TABLES LIKE 'premium_projects'");
    if ($table_check->rowCount() == 0) {
        // Return empty array if table doesn't exist yet
        echo json_encode([
            'success' => true, 
            'data' => [],
            'message' => 'No projects table found. Please run database migrations.'
        ]);
        exit();
    }
    
    $query = "SELECT id, title, category, thumbnail_url, type, video_url, is_active, display_order, created_at 
              FROM premium_projects 
              WHERE is_active = 1 
              ORDER BY display_order ASC, created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get images for each project
    foreach ($projects as &$project) {
        $images_query = "SELECT id, project_id, image_url, alt_text, display_order 
                         FROM project_images 
                         WHERE project_id = :project_id 
                         ORDER BY display_order ASC";
        $images_stmt = $db->prepare($images_query);
        $images_stmt->bindParam(':project_id', $project['id'], PDO::PARAM_INT);
        $images_stmt->execute();
        $images = $images_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format images array for frontend
        if ($project['type'] === 'gallery' && !empty($images)) {
            $project['images'] = array_map(function($img) {
                return $img['image_url'];
            }, $images);
        } else {
            $project['images'] = [];
        }
        
        // Add videoUrl for video type projects
        if ($project['type'] === 'video' && !empty($project['video_url'])) {
            $project['videoUrl'] = $project['video_url'];
        }
        
        // Ensure thumbnail is set
        if (empty($project['thumbnail_url']) && !empty($project['images'][0])) {
            $project['thumbnail'] = $project['images'][0];
        } else {
            $project['thumbnail'] = $project['thumbnail_url'];
        }
    }
    
    // Unset reference to avoid issues
    unset($project);
    
    echo json_encode(normalize_media_urls_in_array([
        'success' => true, 
        'data' => $projects,
        'count' => count($projects)
    ]), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Database error in projects/list.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error occurred',
        'error' => (error_reporting() ? $e->getMessage() : 'Internal server error')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Error in projects/list.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to fetch projects',
        'error' => (error_reporting() ? $e->getMessage() : 'Internal server error')
    ]);
}

