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

$caseId = $data['caseId'] ?? null;

if (!$caseId) {
    http_response_code(400);
    echo json_encode(['error' => 'Case ID is required']);
    exit();
}

try {
    // Security Hardening: Verify requester is an Admin
    $adminStmt = $pdo->prepare("SELECT role FROM users WHERE id = :rid");
    $adminStmt->execute([':rid' => $data['requesterId'] ?? null]);
    $requester = $adminStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$requester || $requester['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access Denied: Only administrators can archive cases.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE cases SET is_archived = 1 WHERE id = :id");
    $stmt->execute([':id' => $caseId]);

    echo json_encode([
        'success' => true,
        'message' => 'Case archived successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to archive case: ' . $e->getMessage()
    ]);
}
?>
