<?php
/**
 * Simple test endpoint to verify API routing works
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode([
    'success' => true,
    'message' => 'API routing is working!',
    'path' => __FILE__,
    'requestUri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
    'requestPath' => parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? 'N/A'
]);

