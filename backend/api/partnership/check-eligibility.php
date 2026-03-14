<?php
/**
 * Check Partnership Eligibility API (Public)
 */

require_once '../../config/config.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['district']) || !isset($data['space_availability'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'District and space availability are required']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$district = trim($data['district']);
$state = isset($data['state']) ? trim($data['state']) : 'Kerala';
$space = (int)$data['space_availability'];

try {
    $query = "SELECT * FROM eligible_locations WHERE district = :district AND state = :state AND is_active = 1 LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':district', $district);
    $stmt->bindParam(':state', $state);
    $stmt->execute();
    $location = $stmt->fetch();
    
    if ($location && $space >= $location['min_space_sqft']) {
        echo json_encode([
            'success' => true,
            'eligible' => true,
            'message' => 'Your location is eligible for partnership',
            'location' => $location
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'eligible' => false,
            'message' => $location 
                ? "Minimum space required is {$location['min_space_sqft']} sqft"
                : 'Location currently not eligible for partnership'
        ]);
    }
} catch (Exception $e) {
    error_log("Eligibility check error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

