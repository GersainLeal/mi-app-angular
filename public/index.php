<?php
// Force no-cache headers to bypass SiteGround Nginx proxy cache
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Accel-Expires: 0'); // Tell Nginx proxy not to cache

// Serve the Angular app's index.html
$indexFile = __DIR__ . '/index.html';
if (file_exists($indexFile)) {
    echo file_get_contents($indexFile);
} else {
    http_response_code(500);
    echo 'index.html not found';
}
