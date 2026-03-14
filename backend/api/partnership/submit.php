<?php
/**
 * Submit Partnership Inquiry API (Public)
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields (district for eligibility; pincode required from user)
$required = ['name', 'email', 'phone', 'location', 'district', 'pincode', 'space_availability'];
foreach ($required as $field) {
    if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "$field is required"]);
        exit();
    }
}

$pincode = trim($data['pincode']);
if (!preg_match('/^[0-9]{6}$/', $pincode)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Pincode must be exactly 6 digits']);
    exit();
}

if (!isValidEmail($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Check eligibility by district
    $district = trim($data['district']);
    $state = isset($data['state']) ? trim($data['state']) : 'Kerala';
    $space = (int)$data['space_availability'];
    
    $eligibility_query = "SELECT * FROM eligible_locations WHERE district = :district AND state = :state AND is_active = 1 LIMIT 1";
    $eligibility_stmt = $db->prepare($eligibility_query);
    $eligibility_stmt->bindParam(':district', $district);
    $eligibility_stmt->bindParam(':state', $state);
    $eligibility_stmt->execute();
    $eligible_location = $eligibility_stmt->fetch();
    
    $eligibility_status = 'not_eligible';
    if ($eligible_location && $space >= $eligible_location['min_space_sqft']) {
        $eligibility_status = 'eligible';
    }
    
    // Insert inquiry (district and pincode required; eligibility = district in eligible_locations)
    $query = "INSERT INTO partnership_inquiries 
              (name, email, phone, location, district, pincode, space_availability, eligibility_status) 
              VALUES (:name, :email, :phone, :location, :district, :pincode, :space_availability, :eligibility_status)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':phone', $data['phone']);
    $stmt->bindParam(':location', $data['location']);
    $stmt->bindParam(':district', $district);
    $stmt->bindParam(':pincode', $pincode);
    $stmt->bindParam(':space_availability', $space);
    $stmt->bindParam(':eligibility_status', $eligibility_status);
    
    if ($stmt->execute()) {
        $id = $db->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Inquiry submitted successfully',
            'eligible' => $eligibility_status === 'eligible',
            'id' => $id
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to submit inquiry']);
    }
} catch (Exception $e) {
    error_log("Partnership submit error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

