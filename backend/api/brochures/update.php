<?php
/**
 * Update Brochure API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Brochure ID is required']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $id = (int)$data['id'];
    $title = $data['title'];
    $description = $data['description'] ?? null;
    $sector = $data['sector'] ?? null;
    $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
    
    // Build update query dynamically based on provided fields
    $update_fields = [
        'title = :title',
        'description = :description',
        'sector = :sector',
        'display_order = :display_order',
        'is_active = :is_active'
    ];
    
    $params = [
        ':id' => $id,
        ':title' => $title,
        ':description' => $description,
        ':sector' => $sector,
        ':display_order' => $display_order,
        ':is_active' => $is_active
    ];
    
    // Update file fields only if provided
    if (isset($data['file_path']) && isset($data['file_name'])) {
        $update_fields[] = 'file_path = :file_path';
        $update_fields[] = 'file_name = :file_name';
        $params[':file_path'] = $data['file_path'];
        $params[':file_name'] = $data['file_name'];
        
        if (isset($data['file_size'])) {
            $update_fields[] = 'file_size = :file_size';
            $params[':file_size'] = (int)$data['file_size'];
        }
        
        if (isset($data['file_type'])) {
            $update_fields[] = 'file_type = :file_type';
            $params[':file_type'] = $data['file_type'];
        }
    }
    
    $query = "UPDATE brochures SET " . implode(', ', $update_fields) . " WHERE id = :id";
    
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        if ($key === ':file_size' || $key === ':display_order') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } elseif ($key === ':is_active') {
            $stmt->bindValue($key, $value, PDO::PARAM_BOOL);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Brochure updated successfully']);
    } else {
        http_response_code(400);
        $errorInfo = $stmt->errorInfo();
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update brochure: ' . ($errorInfo[2] ?? 'Database error')
        ]);
    }
} catch (Exception $e) {
    error_log("Brochure update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
