<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$userId = $data['userId'] ?? $_GET['userId'] ?? $_POST['userId'] ?? '';
$sessionToken = $data['sessionToken'] ?? $_GET['sessionToken'] ?? $_POST['sessionToken'] ?? '';

// Also check Authorization header if present
if (empty($sessionToken)) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $sessionToken = $matches[1];
    }
}

if (empty($userId) || empty($sessionToken)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'code' => 'MISSING_PARAMS',
        'error' => 'User ID and session token are required.'
    ]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, username, full_name, role, session_token FROM users WHERE id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'code' => 'USER_NOT_FOUND',
            'error' => 'Account not found. Please log in again.'
        ]);
        exit();
    }

    // Check if session token matches the active token in the database
    if (empty($user['session_token']) || $user['session_token'] !== $sessionToken) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'code' => 'SESSION_SUPERSEDED',
            'error' => 'Your account has been logged in on another device or location. You have been logged out for security.'
        ]);
        exit();
    }

    // Update last active timestamp
    $upd = $pdo->prepare("UPDATE users SET session_last_active = NOW() WHERE id = :id");
    $upd->execute([':id' => $userId]);

    echo json_encode([
        'success' => true,
        'valid' => true,
        'userId' => (string)$user['id'],
        'role' => $user['role']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'code' => 'DB_ERROR',
        'error' => 'Failed to verify session'
    ]);
}
?>

