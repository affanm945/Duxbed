<?php
/**
 * Update Contact Details API
 */

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

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Contact ID is required']);
    exit();
}

// Validate required fields
if (
    empty($data['address_line1']) ||
    empty($data['address_line2']) ||
    empty($data['phone']) ||
    empty($data['email']) ||
    empty($data['whatsapp_number'])
) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Address Line 1, Address Line 2, Phone, Email and WhatsApp Number are required'
    ]);
    exit();
}

try {
    $id = (int)$data['id'];
    $address_line1 = $data['address_line1'];
    $address_line2 = $data['address_line2'];
    $phone = $data['phone'];
    $email = $data['email'];
    $whatsapp_number = $data['whatsapp_number'];
    $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;

    $query = "UPDATE contact_details SET
                address_line1 = :address_line1,
                address_line2 = :address_line2,
                phone = :phone,
                email = :email,
                whatsapp_number = :whatsapp_number,
                is_active = :is_active,
                updated_at = NOW()
              WHERE id = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->bindParam(':address_line1', $address_line1);
    $stmt->bindParam(':address_line2', $address_line2);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':whatsapp_number', $whatsapp_number);
    $stmt->bindValue(':is_active', $is_active, PDO::PARAM_BOOL);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Contact details updated successfully']);
    } else {
        $errorInfo = $stmt->errorInfo();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update contact details: ' . ($errorInfo[2] ?? 'Database error')
        ]);
    }
} catch (Exception $e) {
    error_log("Contact details update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

