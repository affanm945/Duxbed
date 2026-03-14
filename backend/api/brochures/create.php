<?php
/**
 * Create Brochure API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
if (empty($data['title']) || empty($data['file_path']) || empty($data['file_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Title, file_path, and file_name are required']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $title = $data['title'];
    $description = $data['description'] ?? null;
    $file_path = $data['file_path'];
    $file_name = $data['file_name'];
    $file_size = isset($data['file_size']) ? (int)$data['file_size'] : null;
    $file_type = $data['file_type'] ?? 'application/pdf';
    $sector = $data['sector'] ?? null;
    $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
    
    $query = "INSERT INTO brochures 
              (title, description, file_path, file_name, file_size, file_type, sector, display_order, is_active) 
              VALUES 
              (:title, :description, :file_path, :file_name, :file_size, :file_type, :sector, :display_order, :is_active)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':file_path', $file_path);
    $stmt->bindParam(':file_name', $file_name);
    $stmt->bindParam(':file_size', $file_size, PDO::PARAM_INT);
    $stmt->bindParam(':file_type', $file_type);
    $stmt->bindParam(':sector', $sector);
    $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
    $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
    
    if ($stmt->execute()) {
        $id = $db->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Brochure created successfully',
            'id' => $id
        ]);
    } else {
        http_response_code(400);
        $errorInfo = $stmt->errorInfo();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create brochure: ' . ($errorInfo[2] ?? 'Database error')
        ]);
    }
} catch (Exception $e) {
    error_log("Brochure create error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
