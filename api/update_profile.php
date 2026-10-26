<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['userId']) || !isset($data['fullName']) || !isset($data['username']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$userId = (int)$data['userId'];
$fullName = trim($data['fullName']);
$username = trim($data['username']);
$email = trim($data['email']);

try {
    // Check if username already exists for a different user
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = :username AND id != :id");
    $stmtCheck->execute([':username' => $username, ':id' => $userId]);
    if ($stmtCheck->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username already taken']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE users SET full_name = :full_name, username = :username, email = :email WHERE id = :id");
    $stmt->execute([
        ':full_name' => $fullName,
        ':username' => $username,
        ':email' => $email,
        ':id' => $userId
    ]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
