<?php
/**
 * Video Upload API
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

if (!isset($_FILES['video'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit();
}

$upload_type = $_POST['type'] ?? 'general'; // general, hero, background, etc.
$destination_dir = UPLOAD_PATH . 'videos/' . $upload_type . '/';

// Create directory if it doesn't exist
if (!file_exists($destination_dir)) {
    mkdir($destination_dir, 0755, true);
}

$result = uploadFile($_FILES['video'], $destination_dir, ALLOWED_VIDEO_TYPES);

if ($result['success']) {
    echo json_encode([
        'success' => true,
        'message' => 'Video uploaded successfully',
        'url' => $result['url'],
        'filename' => $result['filename']
    ]);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $result['message']]);
}

