<?php
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$user_id = $input['user_id'] ?? 0;
$user_name = $input['user_name'] ?? 'System';
$action = $input['action'] ?? '';
$entity_type = $input['entity_type'] ?? '';
$entity_id = $input['entity_id'] ?? null;
$details = $input['details'] ?? '';
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '';

if (empty($action) || empty($entity_type)) {
    echo json_encode(['success' => false, 'error' => 'Action and entity type are required']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $user_name, $action, $entity_type, $entity_id, $details, $ip_address]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
