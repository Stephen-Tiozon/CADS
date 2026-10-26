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

$caseId = isset($data['caseId']) ? (int)$data['caseId'] : null;
$socialWorkerId = isset($data['socialWorkerId']) ? (int)$data['socialWorkerId'] : null;
$noteCategory = strip_tags($data['noteCategory'] ?? 'General Note');
$noteContent = strip_tags($data['noteContent'] ?? '');
$noteDate = preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['noteDate'] ?? '') ? $data['noteDate'] : date('Y-m-d');

if (!$caseId || !$socialWorkerId || empty(trim($noteContent))) {
    http_response_code(400);
    echo json_encode(['error' => 'Case ID, social worker ID, and note content are required and must be valid']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO case_notes (case_id, social_worker_id, note_date, note_category, note_content)
        VALUES (:case_id, :social_worker_id, :note_date, :note_category, :note_content)
    ");
    $stmt->execute([
        ':case_id' => $caseId,
        ':social_worker_id' => $socialWorkerId,
        ':note_date' => $noteDate,
        ':note_category' => $noteCategory,
        ':note_content' => $noteContent
    ]);

    $noteId = $pdo->lastInsertId();

    // Fetch the just-inserted note with author name
    $stmt = $pdo->prepare("SELECT cn.*, u.full_name as author_name FROM case_notes cn LEFT JOIN users u ON cn.social_worker_id = u.id WHERE cn.id = :id");
    $stmt->execute([':id' => $noteId]);
    $note = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'message' => 'Case note added',
        'note' => $note
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save case note: ' . $e->getMessage()
    ]);
}
?>
