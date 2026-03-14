<?php
/**
 * Submit Job Application API (Public)
 */

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Handle multipart/form-data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$position = $_POST['position'] ?? '';
$cover_letter = $_POST['coverLetter'] ?? '';

// Validate required fields
if (empty($name) || empty($email) || empty($phone) || empty($position)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
    exit();
}

if (!isValidEmail($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Handle resume upload
$resume_path = null;
if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
    $result = uploadFile($_FILES['resume'], UPLOAD_PATH . 'resumes/', ALLOWED_DOC_TYPES);
    if ($result['success']) {
        $resume_path = $result['url'];
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $result['message']]);
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Resume file is required']);
    exit();
}

// Get job ID from position title
$database = new Database();
$db = $database->getConnection();

try {
    $job_query = "SELECT id FROM job_listings WHERE title = :position AND is_active = 1 LIMIT 1";
    $job_stmt = $db->prepare($job_query);
    $job_stmt->bindParam(':position', $position);
    $job_stmt->execute();
    $job = $job_stmt->fetch();
    
    if (!$job) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Job position not found']);
        exit();
    }
    
    // Insert application
    $query = "INSERT INTO job_applications 
              (job_id, name, email, phone, position, resume_path, cover_letter) 
              VALUES (:job_id, :name, :email, :phone, :position, :resume_path, :cover_letter)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':job_id', $job['id']);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':position', $position);
    $stmt->bindParam(':resume_path', $resume_path);
    $stmt->bindParam(':cover_letter', $cover_letter);
    
    if ($stmt->execute()) {
        $id = $db->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Application submitted successfully',
            'id' => $id
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to submit application']);
    }
} catch (Exception $e) {
    error_log("Job application submit error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

