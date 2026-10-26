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

$id = $data['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File ID is required']);
    exit();
}

try {
    // Get file path first
    $stmt = $pdo->prepare("SELECT file_path FROM case_files WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $file = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($file) {
        $path = __DIR__ . '/../' . $file['file_path'];
        if (file_exists($path)) {
            unlink($path);
        }

        // Delete from DB
        $delStmt = $pdo->prepare("DELETE FROM case_files WHERE id = :id");
        $delStmt->execute([':id' => $id]);

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File not found in database']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
