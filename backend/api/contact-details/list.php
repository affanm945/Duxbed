<?php
/**
 * Public Contact Details List API
 * Returns active contact details for frontend Contact page.
 */

require_once '../../config/config.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, address_line1, address_line2, phone, email, whatsapp_number, is_active
              FROM contact_details
              WHERE is_active = 1
              ORDER BY id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $rows
    ]);
} catch (Exception $e) {
    error_log("Contact details list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}

