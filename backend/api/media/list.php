<?php
/**
 * Media Items List API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
    exit();
}

$type = $_GET['type'] ?? '';
$pagination = getPaginationParams();

try {
    $query = "SELECT * FROM media_items WHERE 1=1";
    $params = [];
    
    if ($type && in_array($type, ['news', 'event', 'award'])) {
        $query .= " AND type = :type";
        $params[':type'] = $type;
    }
    
    // Public API - always show only published content
    $query .= " AND is_published = 1";
    
    $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
    $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
    $stmt->execute();
    
    $items = $stmt->fetchAll();
    
    // Get total count
    $count_query = "SELECT COUNT(*) as total FROM media_items WHERE 1=1";
    if ($type) {
        $count_query .= " AND type = :type";
    }
    // Public API - always show only published content
    $count_query .= " AND is_published = 1";
    
    $count_stmt = $db->prepare($count_query);
    foreach ($params as $key => $value) {
        if ($key !== ':limit' && $key !== ':offset') {
            $count_stmt->bindValue($key, $value);
        }
    }
    $count_stmt->execute();
    $total = $count_stmt->fetch()['total'];
    
    echo json_encode(normalize_media_urls_in_array([
        'success' => true,
        'data' => $items,
        'pagination' => [
            'page' => $pagination['page'],
            'limit' => $pagination['limit'],
            'total' => $total,
            'pages' => ceil($total / $pagination['limit'])
        ]
    ]));
} catch (Exception $e) {
    error_log("Media list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

