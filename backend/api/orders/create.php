<?php
/**
 * Create Order API
 */

// Start output buffering to catch any unwanted output
ob_start();

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

// Clear any output that might have been sent
ob_clean();

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['customer_name']) || !isset($data['items'])) {
    http_response_code(400);
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Customer name and items are required']);
    ob_end_flush();
    exit();
}

try {
    $db->beginTransaction();
    
    $order_number = generateOrderNumber();
    
    // Prepare values
    $order_status = $data['order_status'] ?? 'placed';
    $customer_email = $data['customer_email'] ?? null;
    $customer_phone = $data['customer_phone'] ?? null;
    $delivery_address = $data['delivery_address'] ?? null;
    $notes = $data['notes'] ?? null;
    
    // Create order
    $query = "INSERT INTO orders 
             (order_number, customer_name, customer_email, customer_phone, order_status, delivery_address, notes) 
             VALUES (:order_number, :customer_name, :customer_email, :customer_phone, :order_status, :delivery_address, :notes)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':order_number', $order_number);
    $stmt->bindParam(':customer_name', $data['customer_name']);
    $stmt->bindParam(':customer_email', $customer_email);
    $stmt->bindParam(':customer_phone', $customer_phone);
    $stmt->bindParam(':order_status', $order_status);
    $stmt->bindParam(':delivery_address', $delivery_address);
    $stmt->bindParam(':notes', $notes);
    
    $stmt->execute();
    $order_id = $db->lastInsertId();
    
    // Add initial tracking history
    $history_query = "INSERT INTO order_tracking_history (order_id, status, description, updated_by) 
                     VALUES (:order_id, :status, :description, :updated_by)";
    $history_stmt = $db->prepare($history_query);
    $description = 'Order placed';
    $admin_id = getCurrentAdminId();
    // Allow NULL for updated_by if admin_id is null
    $history_stmt->bindValue(':order_id', $order_id, PDO::PARAM_INT);
    $history_stmt->bindValue(':status', $order_status, PDO::PARAM_STR);
    $history_stmt->bindValue(':description', $description, PDO::PARAM_STR);
    $history_stmt->bindValue(':updated_by', $admin_id, $admin_id ? PDO::PARAM_INT : PDO::PARAM_NULL);
    $history_stmt->execute();
    
    // Add order items
    if (is_array($data['items']) && count($data['items']) > 0) {
        $item_query = "INSERT INTO order_items (order_id, product_name, quantity, price, image_url) 
                      VALUES (:order_id, :product_name, :quantity, :price, :image_url)";
        $item_stmt = $db->prepare($item_query);
        
        foreach ($data['items'] as $item) {
            $item_stmt->bindParam(':order_id', $order_id);
            $item_stmt->bindParam(':product_name', $item['product_name']);
            $item_stmt->bindParam(':quantity', $item['quantity']);
            $item_stmt->bindParam(':price', $item['price']);
            $item_stmt->bindParam(':image_url', $item['image_url']);
            $item_stmt->execute();
        }
    }
    
    $db->commit();
    
    // Clear output buffer before sending JSON
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'order_id' => $order_id,
        'order_number' => $order_number
    ]);
    ob_end_flush();
    exit();
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Order create error: " . $e->getMessage());
    http_response_code(500);
    // Clear output buffer before sending JSON
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    ob_end_flush();
    exit();
}

