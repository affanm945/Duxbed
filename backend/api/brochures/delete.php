<?php
/**
 * Delete Brochure API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Brochure ID is required']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Get brochure info to potentially delete file
    $select_query = "SELECT file_path FROM brochures WHERE id = :id";
    $select_stmt = $db->prepare($select_query);
    $select_stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $select_stmt->execute();
    $brochure = $select_stmt->fetch();
    
    // Delete from database
    $query = "DELETE FROM brochures WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        // Optionally delete the file (uncomment if you want to delete files when brochure is deleted)
        // if ($brochure && $brochure['file_path']) {
        //     $file_path = UPLOAD_PATH . 'documents/' . $brochure['file_path'];
        //     if (file_exists($file_path)) {
        //         unlink($file_path);
        //     }
        // }
        
        echo json_encode(['success' => true, 'message' => 'Brochure deleted successfully']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to delete brochure']);
    }
} catch (Exception $e) {
    error_log("Brochure delete error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
