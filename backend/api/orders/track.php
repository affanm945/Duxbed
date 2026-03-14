<?php
/**
 * Order Tracking API (Public - No authentication required)
 */

require_once '../../config/config.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$order_number = $_GET['order_number'] ?? null;

if (!$order_number) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Order number is required']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Get order details
    $query = "SELECT * FROM orders WHERE order_number = :order_number LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':order_number', $order_number);
    $stmt->execute();
    $order = $stmt->fetch();
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit();
    }
    
    // Get order items
    $items_query = "SELECT * FROM order_items WHERE order_id = :order_id";
    $items_stmt = $db->prepare($items_query);
    $items_stmt->bindParam(':order_id', $order['id']);
    $items_stmt->execute();
    $items = $items_stmt->fetchAll();
    
    // Get tracking history
    $history_query = "SELECT * FROM order_tracking_history WHERE order_id = :order_id ORDER BY created_at ASC";
    $history_stmt = $db->prepare($history_query);
    $history_stmt->bindParam(':order_id', $order['id']);
    $history_stmt->execute();
    $history = $history_stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'order' => $order,
        'items' => $items,
        'tracking_history' => $history
    ]);
} catch (Exception $e) {
    error_log("Order tracking error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

