<?php
/**
 * Update Testimonial API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Testimonial ID is required']);
    exit();
}

try {
    $type = 'text';
    if (!empty($data['video_url'])) {
        $type = 'video';
    } elseif (!empty($data['image_url'])) {
        $type = 'image';
    }
    
    $query = "UPDATE testimonials SET 
             type_id = :type_id,
             client_name = :client_name,
             location = :location,
             testimonial_text = :testimonial_text,
             image_url = :image_url,
             video_url = :video_url,
             type = :type,
             rating = :rating,
             is_published = :is_published,
             display_order = :display_order
             WHERE id = :id";
    $stmt = $db->prepare($query);
    
    $type_id = isset($data['type_id']) ? (int)$data['type_id'] : 1; // Default to 1 (Client) if not provided
    
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':type_id', $type_id);
    $stmt->bindParam(':client_name', $data['client_name']);
    $stmt->bindParam(':location', $data['location']);
    $stmt->bindParam(':testimonial_text', $data['testimonial_text']);
    $stmt->bindParam(':image_url', $data['image_url']);
    $stmt->bindParam(':video_url', $data['video_url']);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':rating', $data['rating']);
    $stmt->bindParam(':is_published', $data['is_published']);
    $stmt->bindParam(':display_order', $data['display_order']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Testimonial updated successfully']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to update testimonial']);
    }
} catch (Exception $e) {
    error_log("Testimonial update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

