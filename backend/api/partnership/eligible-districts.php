<?php
/**
 * List Eligible Districts for Partnership (Public)
 * Returns districts from eligible_locations so frontend only offers DB-backed options.
 */

require_once '../../config/config.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT DISTINCT district, state FROM eligible_locations WHERE is_active = 1 ORDER BY state, district";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $districts = array_map(function ($row) {
        return ['district' => $row['district'], 'state' => $row['state']];
    }, $rows);
    echo json_encode([
        'success' => true,
        'districts' => $districts
    ]);
} catch (Exception $e) {
    error_log("Eligible districts error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
