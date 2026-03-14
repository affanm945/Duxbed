<?php
/**
 * Publish/Unpublish Testimonial API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['is_published'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Testimonial ID and publish status are required']);
    exit();
}

try {
    // Extract values to variables (required for bindParam)
    $id = (int)$data['id'];
    
    // Ensure is_published is a proper integer (0 or 1)
    $is_published = 0;
    if (isset($data['is_published'])) {
        $value = $data['is_published'];
        // Handle various input types: boolean, string, integer
        if ($value === true || $value === 'true' || $value === '1' || $value === 1) {
            $is_published = 1;
        } elseif ($value === false || $value === 'false' || $value === '0' || $value === 0) {
            $is_published = 0;
        } else {
            // Default to 0 if value is empty or invalid
            $is_published = 0;
        }
    }
    
    $query = "UPDATE testimonials SET is_published = :is_published WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->bindParam(':is_published', $is_published, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        // Verify the update was successful by checking the affected rows
        $affectedRows = $stmt->rowCount();
        if ($affectedRows > 0) {
            // Double-check by fetching the updated record
            $verifyQuery = "SELECT id, is_published FROM testimonials WHERE id = :id";
            $verifyStmt = $db->prepare($verifyQuery);
            $verifyStmt->bindParam(':id', $id, PDO::PARAM_INT);
            $verifyStmt->execute();
            $updatedRecord = $verifyStmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Testimonial status updated successfully',
                'is_published' => (int)$updatedRecord['is_published']
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No testimonial found with the given ID']);
        }
    } else {
        $errorInfo = $stmt->errorInfo();
        error_log("Testimonial publish update error: " . print_r($errorInfo, true));
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to update testimonial: ' . ($errorInfo[2] ?? 'Unknown error')]);
    }
} catch (Exception $e) {
    error_log("Testimonial publish error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

