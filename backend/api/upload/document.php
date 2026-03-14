<?php
/**
 * Document Upload API (for PDFs)
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

if (!isset($_FILES['document'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit();
}

$destination_dir = UPLOAD_PATH . 'documents/';

// Create directory if it doesn't exist
if (!file_exists($destination_dir)) {
    mkdir($destination_dir, 0755, true);
}

$result = uploadFile($_FILES['document'], $destination_dir, ALLOWED_DOC_TYPES);

if ($result['success']) {
    // Return just the filename (not full path) for storage in database
    echo json_encode([
        'success' => true,
        'message' => 'Document uploaded successfully',
        'url' => $result['url'],
        'filename' => $result['filename'],
        'path' => $result['filename'] // Store just filename in database
    ]);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $result['message']]);
}
