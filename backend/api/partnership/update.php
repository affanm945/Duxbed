<?php
/**
 * Update Partnership Inquiry API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Inquiry ID and status are required']);
    exit();
}

try {
    $query = "UPDATE partnership_inquiries SET 
             status = :status,
             notes = :notes
             WHERE id = :id";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':status', $data['status']);
    $stmt->bindParam(':notes', $data['notes']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Inquiry updated successfully']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to update inquiry']);
    }
} catch (Exception $e) {
    error_log("Partnership update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

