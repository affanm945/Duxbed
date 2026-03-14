<?php
/**
 * Job Applications Management API
 */

// Suppress warnings to prevent breaking JSON response
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');
requireAuth();

$database = new Database();
$db = $database->getConnection();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get all applications with filters
        $job_id = $_GET['job_id'] ?? null;
        $status = $_GET['status'] ?? '';
        $pagination = getPaginationParams();
        
        try {
            $query = "SELECT ja.*, jl.title as job_title, jl.department 
                     FROM job_applications ja
                     LEFT JOIN job_listings jl ON ja.job_id = jl.id
                     WHERE 1=1";
            $params = [];
            
            if ($job_id) {
                $query .= " AND ja.job_id = :job_id";
                $params[':job_id'] = (int)$job_id;
            }
            
            if ($status) {
                $query .= " AND ja.status = :status";
                $params[':status'] = $status;
            }
            
            $query .= " ORDER BY ja.created_at DESC LIMIT :limit OFFSET :offset";
            
            $stmt = $db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
            $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
            $stmt->execute();
            
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $applications,
                'count' => count($applications)
            ]);
        } catch (Exception $e) {
            error_log("Applications fetch error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch applications: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Update application status
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
            exit();
        }
        
        if (!isset($data['id']) || !isset($data['status'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Application ID and status are required']);
            exit();
        }
        
        try {
            // Prepare data with proper types
            $id = (int)$data['id'];
            $status = $data['status'];
            $notes = $data['notes'] ?? null;
            
            $query = "UPDATE job_applications SET 
                     status = :status,
                     notes = :notes
                     WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':notes', $notes);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Application updated successfully']);
            } else {
                http_response_code(400);
                $errorInfo = $stmt->errorInfo();
                echo json_encode(['success' => false, 'message' => 'Failed to update application: ' . ($errorInfo[2] ?? 'Database error')]);
            }
        } catch (Exception $e) {
            error_log("Application update error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

