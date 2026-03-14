<?php
/**
 * Brochure Download API (Public - No authentication required)
 * Handles file download and increments download count
 */

require_once '../../config/config.php';
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Brochure ID is required']);
    exit();
}

try {
    // Get brochure details
    $query = "SELECT * FROM brochures WHERE id = :id AND is_active = 1 LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $brochure = $stmt->fetch();
    
    if (!$brochure) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Brochure not found']);
        exit();
    }
    
    $file_path = UPLOAD_PATH . 'documents/' . $brochure['file_path'];
    
    // Check if file exists
    if (!file_exists($file_path)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'File not found on server']);
        exit();
    }
    
    // Increment download count
    $update_query = "UPDATE brochures SET download_count = download_count + 1 WHERE id = :id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $update_stmt->execute();
    
    // Set headers for file download
    header('Content-Type: ' . $brochure['file_type']);
    header('Content-Disposition: attachment; filename="' . $brochure['file_name'] . '"');
    header('Content-Length: ' . filesize($file_path));
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    
    // Output file
    readfile($file_path);
    exit();
    
} catch (Exception $e) {
    error_log("Brochure download error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit();
}

