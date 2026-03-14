<?php
/**
 * Franchise Locations List API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$city = $_GET['city'] ?? '';
$search = $_GET['search'] ?? '';

try {
    $query = "SELECT * FROM franchise_locations WHERE is_active = 1";
    $params = [];
    
    if ($city && $city !== 'all') {
        $query .= " AND city = :city";
        $params[':city'] = $city;
    }
    
    if ($search) {
        $query .= " AND (name LIKE :search OR address LIKE :search OR city LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    $query .= " ORDER BY display_order ASC, city ASC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    $locations = $stmt->fetchAll();
    
    // Get unique cities for filter
    $cities_query = "SELECT DISTINCT city FROM franchise_locations WHERE is_active = 1 AND city IS NOT NULL ORDER BY city";
    $cities_stmt = $db->prepare($cities_query);
    $cities_stmt->execute();
    $cities = $cities_stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'data' => $locations,
        'cities' => $cities
    ]);
} catch (Exception $e) {
    error_log("Locations list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

