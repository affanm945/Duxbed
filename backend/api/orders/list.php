<?php
/**
 * Get All Orders API (Admin Only)
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$pagination = getPaginationParams();
$search = $_GET['search'] ?? '';
$status = $_GET['status'] ?? '';

try {
    $query = "SELECT o.*, COUNT(oi.id) as item_count 
              FROM orders o 
              LEFT JOIN order_items oi ON o.id = oi.order_id 
              WHERE 1=1";
    $params = [];
    
    if ($search) {
        $query .= " AND (o.order_number LIKE :search OR o.customer_name LIKE :search OR o.customer_email LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if ($status) {
        $query .= " AND o.order_status = :status";
        $params[':status'] = $status;
    }
    
    $query .= " GROUP BY o.id ORDER BY o.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
    $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
    $stmt->execute();
    
    $orders = $stmt->fetchAll();
    
    // Get total count
    $count_query = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
    if ($search) {
        $count_query .= " AND (order_number LIKE :search OR customer_name LIKE :search OR customer_email LIKE :search)";
    }
    if ($status) {
        $count_query .= " AND order_status = :status";
    }
    
    $count_stmt = $db->prepare($count_query);
    foreach ($params as $key => $value) {
        if ($key !== ':limit' && $key !== ':offset') {
            $count_stmt->bindValue($key, $value);
        }
    }
    $count_stmt->execute();
    $total = $count_stmt->fetch()['total'];
    
    echo json_encode([
        'success' => true,
        'data' => $orders,
        'pagination' => [
            'page' => $pagination['page'],
            'limit' => $pagination['limit'],
            'total' => $total,
            'pages' => ceil($total / $pagination['limit'])
        ]
    ]);
} catch (Exception $e) {
    error_log("Orders list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

