<?php
/**
 * Job Listings Management API
 */

// Suppress warnings to prevent breaking JSON response
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get all jobs (public endpoint - only active jobs)
        try {
            // Public API - always show only active jobs
            $query = "SELECT * FROM job_listings WHERE is_active = 1 ORDER BY created_at DESC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $jobs = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $jobs]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch jobs']);
        }
        break;
        
    case 'POST':
        requireAuth();
        // Create job listing
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
            exit();
        }
        
        if (!isset($data['title'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title is required']);
            exit();
        }
        
        try {
            // Prepare data with proper types
            $title = $data['title'];
            $department = $data['department'] ?? null;
            $location = $data['location'] ?? null;
            $type = $data['type'] ?? 'Full-time';
            $description = $data['description'] ?? null;
            $requirements = $data['requirements'] ?? null;
            $skills_required = $data['skills_required'] ?? null;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "INSERT INTO job_listings (title, department, location, type, description, requirements, skills_required, is_active) 
                     VALUES (:title, :department, :location, :type, :description, :requirements, :skills_required, :is_active)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':department', $department);
            $stmt->bindParam(':location', $location);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':requirements', $requirements);
            $stmt->bindParam(':skills_required', $skills_required);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                $id = $db->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Job listing created successfully', 'id' => $id]);
            } else {
                http_response_code(400);
                $errorInfo = $stmt->errorInfo();
                echo json_encode(['success' => false, 'message' => 'Failed to create job listing: ' . ($errorInfo[2] ?? 'Database error')]);
            }
        } catch (Exception $e) {
            error_log("Job create error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        requireAuth();
        // Update job listing
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
            exit();
        }
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Job ID is required']);
            exit();
        }
        
        try {
            // Prepare data with proper types
            $id = (int)$data['id'];
            $title = $data['title'];
            $department = $data['department'] ?? null;
            $location = $data['location'] ?? null;
            $type = $data['type'] ?? 'Full-time';
            $description = $data['description'] ?? null;
            $requirements = $data['requirements'] ?? null;
            $skills_required = $data['skills_required'] ?? null;
            $is_active = isset($data['is_active']) ? (bool)$data['is_active'] : true;
            
            $query = "UPDATE job_listings SET 
                     title = :title,
                     department = :department,
                     location = :location,
                     type = :type,
                     description = :description,
                     requirements = :requirements,
                     skills_required = :skills_required,
                     is_active = :is_active
                     WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':department', $department);
            $stmt->bindParam(':location', $location);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':requirements', $requirements);
            $stmt->bindParam(':skills_required', $skills_required);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Job listing updated successfully']);
            } else {
                http_response_code(400);
                $errorInfo = $stmt->errorInfo();
                echo json_encode(['success' => false, 'message' => 'Failed to update job listing: ' . ($errorInfo[2] ?? 'Database error')]);
            }
        } catch (Exception $e) {
            error_log("Job update error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        requireAuth();
        // Delete job listing
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Job ID is required']);
            exit();
        }
        
        try {
            $query = "DELETE FROM job_listings WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Job listing deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to delete job listing']);
            }
        } catch (Exception $e) {
            error_log("Job delete error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

