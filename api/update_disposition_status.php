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

$dispositionId = $data['dispositionId'] ?? null;
$status = $data['status'] ?? '';

if (!$dispositionId || empty($status)) {
    http_response_code(400);
    echo json_encode(['error' => 'Disposition ID and status are required']);
    exit();
}

if (!in_array($status, ['Active', 'Completed', 'Cancelled', 'Successfully Completed'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status value']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE disposition_plans
        SET status = :status
        WHERE id = :id
    ");
    $stmt->execute([
        ':status' => $status,
        ':id' => $dispositionId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Status updated successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update disposition status: ' . $e->getMessage()
    ]);
}
?>
