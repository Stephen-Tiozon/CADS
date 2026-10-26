<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$case_id = $_GET['case_id'] ?? null;

if (!$case_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Case ID is required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM case_files WHERE case_id = :case_id ORDER BY uploaded_at DESC");
    $stmt->execute([':case_id' => $case_id]);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'files' => $files]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
