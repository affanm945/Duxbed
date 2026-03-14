<?php
/**
 * Create Franchise Location API
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

if (!isset($data['name']) || !isset($data['address'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name and address are required']);
    exit();
}

try {
    // Prepare data with proper types
    $name = $data['name'];
    $address = $data['address'];
    $city = $data['city'] ?? null;
    $state = $data['state'] ?? null;
    $pincode = $data['pincode'] ?? null;
    $phone = $data['phone'] ?? null;
    $email = $data['email'] ?? null;
    $map_query = $data['map_query'] ?? null;
    $latitude = isset($data['latitude']) && $data['latitude'] !== '' ? (float)$data['latitude'] : null;
    $longitude = isset($data['longitude']) && $data['longitude'] !== '' ? (float)$data['longitude'] : null;
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
    $display_order = isset($data['display_order']) ? (int)$data['display_order'] : 0;
    
    $query = "INSERT INTO franchise_locations 
             (name, address, city, state, pincode, phone, email, map_query, latitude, longitude, is_active, display_order) 
             VALUES (:name, :address, :city, :state, :pincode, :phone, :email, :map_query, :latitude, :longitude, :is_active, :display_order)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':city', $city);
    $stmt->bindParam(':state', $state);
    $stmt->bindParam(':pincode', $pincode);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':map_query', $map_query);
    $stmt->bindParam(':latitude', $latitude);
    $stmt->bindParam(':longitude', $longitude);
    $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
    $stmt->bindParam(':display_order', $display_order, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        $id = $db->lastInsertId();
        echo json_encode(['success' => true, 'message' => 'Location created successfully', 'id' => $id]);
    } else {
        http_response_code(400);
        $errorInfo = $stmt->errorInfo();
        echo json_encode(['success' => false, 'message' => 'Failed to create location: ' . ($errorInfo[2] ?? 'Database error')]);
    }
} catch (Exception $e) {
    error_log("Location create error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

