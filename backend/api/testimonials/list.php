<?php
/**
 * Testimonials List API
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Cache-Control: public, max-age=300');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if table exists
    try {
        $table_check = $db->query("SHOW TABLES LIKE 'testimonials'");
        if ($table_check && $table_check->rowCount() == 0) {
            echo json_encode([
                'success' => true, 
                'data' => [],
                'message' => 'No testimonials table found. Please run database migrations.',
                'count' => 0
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            exit();
        }
    } catch (Exception $tableError) {
        error_log("Table check error: " . $tableError->getMessage());
        // Continue anyway, let the query fail if table doesn't exist
    }
    
    // SELECT QUERY FOR TESTIMONIALS
    // This is a PUBLIC API endpoint - always returns only published testimonials
    // 
    // When called from Index.tsx with ?type_id=1:
    //   - Client testimonials (type_id = 1)
    //   - Published testimonials only (is_published = 1)
    //   Final query: WHERE is_published = 1 AND type_id = 1
    //
    // When called from Careers.tsx with ?type_id=2:
    //   - Employee testimonials (type_id = 2)
    //   - Published testimonials only (is_published = 1)
    //   Final query: WHERE is_published = 1 AND type_id = 2
    $query = "SELECT id, type_id, client_name, location, testimonial_text, image_url, video_url, type, rating, is_published, display_order, created_at, updated_at FROM testimonials";
    
    // Build WHERE clause - always filter by is_published = 1 for public API
    // This ensures draft testimonials are NEVER shown on public pages
    $whereConditions = ["is_published = 1"];
    $type_id = null;
    
    // Filter by type_id if provided (1 = Client, 2 = Employee)
    // Index.tsx passes ?type_id=1 for "What Our Clients Says" section
    // Careers.tsx passes ?type_id=2 for "Employee Testimonials" section
    if (isset($_GET['type_id'])) {
        $type_id = (int)$_GET['type_id'];
        if ($type_id == 1 || $type_id == 2) {
            $whereConditions[] = "type_id = :type_id";
        } else {
            $type_id = null; // Reset if invalid value
        }
    }
    
    // Combine all WHERE conditions with AND
    // Example for employee testimonials: WHERE is_published = 1 AND type_id = 2
    $query .= " WHERE " . implode(" AND ", $whereConditions);
    
    $query .= " ORDER BY display_order ASC, created_at DESC";
    
    $stmt = $db->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare query: " . implode(", ", $db->errorInfo()));
    }
    
    // Bind type_id parameter if provided
    if ($type_id !== null) {
        $stmt->bindParam(':type_id', $type_id, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $testimonials = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Ensure testimonials is an array
    if (!is_array($testimonials)) {
        $testimonials = [];
    }
    
    // Additional safety filter: Remove any testimonials that are not published
    // This is a double-check to ensure draft testimonials never reach the public
    $testimonials = array_filter($testimonials, function($testimonial) {
        // Check if is_published is actually 1 (published)
        // Handle both boolean and integer values
        $published = $testimonial['is_published'] ?? 0;
        return ($published === 1 || $published === true || $published === '1');
    });
    // Re-index array after filtering
    $testimonials = array_values($testimonials);
    
    // Format response consistently
    $response = [
        'success' => true, 
        'data' => $testimonials,
        'count' => count($testimonials)
    ];
    
    echo json_encode(normalize_media_urls_in_array($response), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log("Testimonials list PDO error: " . $e->getMessage());
    error_log("PDO Error Info: " . print_r($e->errorInfo ?? [], true));
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error occurred',
        'data' => [],
        'count' => 0,
        'error' => (error_reporting() ? $e->getMessage() : 'Internal server error')
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Testimonials list error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'data' => [],
        'count' => 0,
        'error' => (error_reporting() ? $e->getMessage() : 'Internal server error')
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}