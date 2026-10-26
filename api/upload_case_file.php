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
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

$case_id = $_POST['case_id'] ?? null;
$uploaded_by = $_POST['uploaded_by'] ?? 'System';

if (!$case_id || !isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Case ID and file are required']);
    exit();
}

$file = $_FILES['file'];
$fileName = basename($file['name']);
$fileTmpPath = $file['tmp_name'];
$fileError = $file['error'];

if ($fileError !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File upload error code: ' . $fileError]);
    exit();
}

// Ensure unique filename
$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
$baseName = pathinfo($fileName, PATHINFO_FILENAME);
$newFileName = $baseName . '_' . time() . '.' . $fileExtension;

$uploadDir = __DIR__ . '/uploads/cases/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$destPath = $uploadDir . $newFileName;
$dbFilePath = 'api/uploads/cases/' . $newFileName;

if (move_uploaded_file($fileTmpPath, $destPath)) {
    try {
        $stmt = $pdo->prepare("INSERT INTO case_files (case_id, file_name, file_path, uploaded_by) VALUES (:case_id, :file_name, :file_path, :uploaded_by)");
        $stmt->execute([
            ':case_id' => $case_id,
            ':file_name' => $fileName, // original filename for display
            ':file_path' => $dbFilePath, // path for serving
            ':uploaded_by' => $uploaded_by
        ]);
        
        $newId = $pdo->lastInsertId();
        
        // Fetch the inserted record to return
        $stmtSel = $pdo->prepare("SELECT * FROM case_files WHERE id = ?");
        $stmtSel->execute([$newId]);
        $record = $stmtSel->fetch(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'file' => $record]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
}
?>
