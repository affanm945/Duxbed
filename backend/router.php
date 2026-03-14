<?php
/**
 * Router for PHP Built-in Server
 * This file ensures that all requests are properly routed
 */

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove leading slash
$requestPath = ltrim($requestPath, '/');

// Handle /api/* requests - route to api/* (since router is in backend directory)
if (strpos($requestPath, 'api/') === 0) {
    // Already correct - api/projects/list.php
    // No change needed
}

// Remove 'backend' prefix if present (for direct /backend/api/* requests)
if (strpos($requestPath, 'backend/') === 0) {
    $requestPath = substr($requestPath, 8); // Remove 'backend/' (8 characters)
    // Now it's api/projects/list.php
}

// Handle uploads directory - serve static files with proper headers
if (strpos($requestPath, 'uploads/') === 0) {
    $filePath = __DIR__ . '/' . str_replace('/', DIRECTORY_SEPARATOR, $requestPath);
    if (file_exists($filePath) && is_file($filePath)) {
        // Determine MIME type
        $mimeType = 'application/octet-stream'; // Default
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $mimeType = finfo_file($finfo, $filePath);
                finfo_close($finfo);
            }
        } else {
            // Fallback to extension-based MIME type
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $mimeTypes = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'pdf' => 'application/pdf',
                'mp4' => 'video/mp4'
            ];
            if (isset($mimeTypes[$extension])) {
                $mimeType = $mimeTypes[$extension];
            }
        }

        $fileSize = filesize($filePath);
        header('Content-Type: ' . $mimeType);
        header('Accept-Ranges: bytes'); // Required for iOS Safari video playback
        header('Cache-Control: public, max-age=31536000');
        header('Access-Control-Allow-Origin: *');

        // Support Range requests (required for iOS Safari and seeking)
        $rangeHeader = $_SERVER['HTTP_RANGE'] ?? '';
        if ($rangeHeader && preg_match('/bytes=(\d+)-(\d*)/', $rangeHeader, $m)) {
            $start = (int) $m[1];
            $end = isset($m[2]) && $m[2] !== '' ? (int) $m[2] : $fileSize - 1;
            $end = min($end, $fileSize - 1);
            $length = $end - $start + 1;
            header('HTTP/1.1 206 Partial Content');
            header('Content-Length: ' . $length);
            header('Content-Range: bytes ' . $start . '-' . $end . '/' . $fileSize);
            $fp = fopen($filePath, 'rb');
            fseek($fp, $start);
            echo fread($fp, $length);
            fclose($fp);
        } else {
            header('Content-Length: ' . $fileSize);
            readfile($filePath);
        }
        return true;
    }
    // File not found in uploads
    http_response_code(404);
    echo 'File not found';
    return true;
}

// If accessing root, redirect to admin login
if ($requestPath === '' || $requestPath === 'backend' || $requestPath === 'index.php') {
    header('Location: /admin/login.php');
    exit();
}

// Build full file path (__DIR__ is the backend directory when router is at backend/router.php)
$filePath = __DIR__ . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $requestPath);

// If the path exists as a file, serve it directly (PHP built-in server handles this)
if (file_exists($filePath) && !is_dir($filePath) && is_file($filePath)) {
    return false; // Let PHP serve the file directly
}

// If the path exists as a directory, try index.php
if (is_dir($filePath) && file_exists($filePath . '/index.php')) {
    require $filePath . '/index.php';
    return true;
}

// 404 - File not found
http_response_code(404);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode([
    'error' => 'Not Found', 
    'path' => $requestPath,
    'requestUri' => $requestUri,
    'filePath' => $filePath,
    'exists' => file_exists($filePath)
]);
return true;