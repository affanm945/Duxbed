<?php
/**
 * CORS: allow all (public API).
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 0); // Off in production to avoid breaking JSON/CORS
ini_set('log_errors', 1);

// Timezone
date_default_timezone_set('Asia/Kolkata');

$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$protocol = $is_https ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'duxbed.in';
$base_path = '/api/backend/';
$api_path = $base_path . 'api/';
define('BASE_URL', $protocol . '://' . $host . $base_path);
define('PUBLIC_API_BASE', $protocol . '://' . $host . $api_path);
define('FRONTEND_URL', $protocol . '://' . $host . '/');
define('UPLOAD_PATH', __DIR__ . '/../uploads/');
define('UPLOAD_URL', BASE_URL . 'uploads/');

// File Upload Settings
define('MAX_FILE_SIZE', 104857600); 
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_VIDEO_TYPES', ['video/mp4', 'video/webm', 'video/ogg']);
define('ALLOWED_DOC_TYPES', ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

// JWT Secret (change this in production)
define('JWT_SECRET', 'your-secret-key-change-in-production-2024');

// Session Settings
define('SESSION_LIFETIME', 3600); // 1 hour

// Pagination
define('ITEMS_PER_PAGE', 20);

// Create upload directories if they don't exist
$upload_dirs = [
    UPLOAD_PATH . 'images/',
    UPLOAD_PATH . 'videos/',
    UPLOAD_PATH . 'documents/',
    UPLOAD_PATH . 'thumbnails/',
    UPLOAD_PATH . 'resumes/'
];

foreach ($upload_dirs as $dir) {
    if (!file_exists($dir)) {
        @mkdir($dir, 0755, true);
    }
}

/**
 * Normalize a media URL to use the current request protocol (e.g. when behind Cloudflare HTTPS).
 * Fixes mixed content when DB stores http:// but site is served over https.
 */
function normalize_media_url($url) {
    global $protocol, $host;
    if (empty($url) || !is_string($url)) {
        return $url;
    }
    $http_prefix = 'http://' . $host;
    if ($protocol === 'https' && strpos($url, $http_prefix) === 0) {
        return 'https://' . $host . substr($url, strlen($http_prefix));
    }
    return $url;
}

/**
 * Recursively normalize all URL strings in an array (for API responses).
 * Use before json_encode() when returning data that may contain stored media URLs.
 */
function normalize_media_urls_in_array($data) {
    if (is_array($data)) {
        return array_map('normalize_media_urls_in_array', $data);
    }
    if (is_string($data) && (strpos($data, 'http://') === 0 || strpos($data, 'https://') === 0)) {
        return normalize_media_url($data);
    }
    return $data;
}