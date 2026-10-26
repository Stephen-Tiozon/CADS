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

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$userId = $data['userId'] ?? $_POST['userId'] ?? '';

if (!empty($userId)) {
    try {
        $stmt = $pdo->prepare("UPDATE users SET session_token = NULL WHERE id = :id");
        $stmt->execute([':id' => $userId]);
    } catch (PDOException $e) {
        // Log or ignore on logout
    }
}

echo json_encode(['success' => true]);
?>

