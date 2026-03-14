<?php
/**
 * Image Upload API
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit();
}

$upload_type = $_POST['type'] ?? 'general'; // general, thumbnail, testimonial, project, etc.
$destination_dir = UPLOAD_PATH . 'images/' . $upload_type . '/';

// Create directory if it doesn't exist
if (!file_exists($destination_dir)) {
    mkdir($destination_dir, 0755, true);
}

$result = uploadFile($_FILES['image'], $destination_dir, ALLOWED_IMAGE_TYPES);

if ($result['success']) {
    echo json_encode([
        'success' => true,
        'message' => 'Image uploaded successfully',
        'url' => $result['url'],
        'filename' => $result['filename']
    ]);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $result['message']]);
}