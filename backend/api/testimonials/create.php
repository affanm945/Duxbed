<?php
/**
 * Create Testimonial API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['client_name']) || !isset($data['testimonial_text'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Client name and testimonial text are required']);
    exit();
}

try {
    $query = "INSERT INTO testimonials 
             (type_id, client_name, location, testimonial_text, image_url, video_url, type, rating, is_published, display_order) 
             VALUES (:type_id, :client_name, :location, :testimonial_text, :image_url, :video_url, :type, :rating, :is_published, :display_order)";
    $stmt = $db->prepare($query);
    
    $type = 'text';
    if (!empty($data['video_url'])) {
        $type = 'video';
    } elseif (!empty($data['image_url'])) {
        $type = 'image';
    }
    
    // Extract values to variables (required for bindParam)
    $type_id = isset($data['type_id']) ? (int)$data['type_id'] : 1; // Default to 1 (Client) if not provided
    $client_name = $data['client_name'];
    $location = $data['location'] ?? null;
    $testimonial_text = $data['testimonial_text'];
    $image_url = $data['image_url'] ?? null;
    $video_url = $data['video_url'] ?? null;
    $rating = $data['rating'] ?? 5;
    $is_published = isset($data['is_published']) ? (bool)$data['is_published'] : false;
    $display_order = $data['display_order'] ?? 0;
    
    $stmt->bindParam(':type_id', $type_id);
    $stmt->bindParam(':client_name', $client_name);
    $stmt->bindParam(':location', $location);
    $stmt->bindParam(':testimonial_text', $testimonial_text);
    $stmt->bindParam(':image_url', $image_url);
    $stmt->bindParam(':video_url', $video_url);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':rating', $rating);
    $stmt->bindParam(':is_published', $is_published);
    $stmt->bindParam(':display_order', $display_order);
    
    if ($stmt->execute()) {
        $id = $db->lastInsertId();
        echo json_encode(['success' => true, 'message' => 'Testimonial created successfully', 'id' => $id]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to create testimonial']);
    }
} catch (Exception $e) {
    error_log("Testimonial create error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

