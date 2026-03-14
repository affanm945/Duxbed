<?php
/**
 * Brochures List API (Public - No authentication required)
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$sector = $_GET['sector'] ?? '';

try {
    $query = "SELECT id, title, description, file_name, file_size, file_type, sector, download_count, created_at 
              FROM brochures 
              WHERE is_active = 1";
    
    $params = [];
    
    if ($sector && $sector !== 'all') {
        $query .= " AND (sector = :sector OR sector IS NULL OR sector = '')";
        $params[':sector'] = $sector;
    }
    
    $query .= " ORDER BY display_order ASC, created_at DESC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    $brochures = $stmt->fetchAll();
    
    // Add download URL (use PUBLIC_API_BASE so path is /api/... and works with PHP server from any root)
    $downloadBase = defined('PUBLIC_API_BASE') ? PUBLIC_API_BASE : BASE_URL;
    foreach ($brochures as &$brochure) {
        $brochure['download_url'] = $downloadBase . 'brochures/download.php?id=' . $brochure['id'];
    }
    
    echo json_encode(normalize_media_urls_in_array([
        'success' => true,
        'data' => $brochures
    ]));
} catch (Exception $e) {
    error_log("Brochures list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

