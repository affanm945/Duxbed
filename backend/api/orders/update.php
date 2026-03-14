<?php
/**
 * Update Order Status API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['order_id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
    exit();
}

try {
    $db->beginTransaction();
    
    // Update order status
    $update_query = "UPDATE orders SET 
                     order_status = :status,
                     estimated_delivery_date = :estimated_delivery,
                     tracking_number = :tracking_number,
                     notes = :notes
                     WHERE id = :order_id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':order_id', $data['order_id']);
    $update_stmt->bindParam(':status', $data['status']);
    $update_stmt->bindParam(':estimated_delivery', $data['estimated_delivery_date']);
    $update_stmt->bindParam(':tracking_number', $data['tracking_number']);
    $update_stmt->bindParam(':notes', $data['notes']);
    $update_stmt->execute();
    
    // Add to tracking history
    $history_query = "INSERT INTO order_tracking_history (order_id, status, location, description, image_url, updated_by) 
                     VALUES (:order_id, :status, :location, :description, :image_url, :updated_by)";
    $history_stmt = $db->prepare($history_query);
    $image_url = $data['image_url'] ?? null;
    $admin_id = getCurrentAdminId();
    $history_stmt->bindValue(':order_id', $data['order_id'], PDO::PARAM_INT);
    $history_stmt->bindValue(':status', $data['status'], PDO::PARAM_STR);
    $history_stmt->bindValue(':location', $data['location'] ?? null, PDO::PARAM_STR);
    $history_stmt->bindValue(':description', $data['description'] ?? null, PDO::PARAM_STR);
    $history_stmt->bindValue(':image_url', $image_url, $image_url ? PDO::PARAM_STR : PDO::PARAM_NULL);
    $history_stmt->bindValue(':updated_by', $admin_id, $admin_id ? PDO::PARAM_INT : PDO::PARAM_NULL);
    $history_stmt->execute();
    
    $db->commit();
    
    echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
} catch (Exception $e) {
    $db->rollBack();
    error_log("Order update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

