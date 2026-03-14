<?php
/**
 * Stream video files with proper Range support and headers.
 * This endpoint is intended for frontend video playback (including iOS Safari).
 *
 * Usage:
 *   /api/stream-video.php?file=videos/homepage/yourfile.mp4
 *
 * It will only serve files from the backend/uploads directory.
 */

// Base uploads directory (relative to this file)
$uploadsBase = realpath(__DIR__ . '/../uploads');

if ($uploadsBase === false) {
    http_response_code(500);
    echo 'Server configuration error: uploads directory not found.';
    exit;
}

// Get and validate requested file path
$relativeFile = $_GET['file'] ?? '';
$relativeFile = trim($relativeFile);

if ($relativeFile === '') {
    http_response_code(400);
    echo 'Missing file parameter.';
    exit;
}

// Prevent directory traversal
if (strpos($relativeFile, '..') !== false) {
    http_response_code(400);
    echo 'Invalid file path.';
    exit;
}

// Build absolute path and ensure it is inside uploadsBase
$absolutePath = realpath($uploadsBase . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativeFile));

if ($absolutePath === false || strpos($absolutePath, $uploadsBase) !== 0 || !is_file($absolutePath)) {
    http_response_code(404);
    echo 'File not found.';
    exit;
}

// Detect MIME type
$mimeType = 'application/octet-stream';
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo) {
        $detected = finfo_file($finfo, $absolutePath);
        if ($detected) {
            $mimeType = $detected;
        }
        finfo_close($finfo);
    }
} else {
    $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));
    $mimeTypes = [
        'mp4'  => 'video/mp4',
        'webm' => 'video/webm',
        'ogg'  => 'video/ogg',
    ];
    if (isset($mimeTypes[$extension])) {
        $mimeType = $mimeTypes[$extension];
    }
}

$fileSize = filesize($absolutePath);

// Common headers
header('Content-Type: ' . $mimeType);
header('Accept-Ranges: bytes');
header('Cache-Control: public, max-age=31536000');
header('Access-Control-Allow-Origin: *');

// Handle Range requests
$rangeHeader = $_SERVER['HTTP_RANGE'] ?? '';

if ($rangeHeader && preg_match('/bytes=(\d+)-(\d*)/', $rangeHeader, $matches)) {
    $start = (int) $matches[1];
    $end = ($matches[2] !== '') ? (int) $matches[2] : ($fileSize - 1);
    $end = min($end, $fileSize - 1);

    if ($start > $end || $start >= $fileSize) {
        // Invalid range
        header('HTTP/1.1 416 Range Not Satisfiable');
        header('Content-Range: bytes */' . $fileSize);
        exit;
    }

    $length = $end - $start + 1;

    header('HTTP/1.1 206 Partial Content');
    header('Content-Length: ' . $length);
    header('Content-Range: bytes ' . $start . '-' . $end . '/' . $fileSize);

    $fp = fopen($absolutePath, 'rb');
    if ($fp === false) {
        http_response_code(500);
        echo 'Failed to open file.';
        exit;
    }

    // Seek and stream the requested range
    fseek($fp, $start);
    $bufferSize = 8192;
    $bytesRemaining = $length;

    while ($bytesRemaining > 0 && !feof($fp)) {
        $chunkSize = ($bytesRemaining > $bufferSize) ? $bufferSize : $bytesRemaining;
        $buffer = fread($fp, $chunkSize);
        if ($buffer === false) {
            break;
        }
        echo $buffer;
        flush();
        $bytesRemaining -= strlen($buffer);
    }

    fclose($fp);
} else {
    // Full file
    header('Content-Length: ' . $fileSize);
    readfile($absolutePath);
}

exit;

