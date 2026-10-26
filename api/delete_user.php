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

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['id']) || empty($data['requesterId'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid ID or missing requester authentication.']);
    exit;
}

try {
    // Security Hardening: Verify requester is an Admin
    $adminStmt = $pdo->prepare("SELECT role FROM users WHERE id = :rid");
    $adminStmt->execute([':rid' => $data['requesterId']]);
    $requester = $adminStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$requester || $requester['role'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Access Denied: Only administrators can delete users.']);
        exit;
    }
    // Note: in a real app you might want to deactivate instead of hard delete
    // if the user has created cases or notes. But for now we just delete.
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute([':id' => $data['id']]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
