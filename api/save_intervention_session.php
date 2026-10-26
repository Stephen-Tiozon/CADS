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

$dispositionPlanId = isset($data['dispositionPlanId']) ? (int)$data['dispositionPlanId'] : null;
$sessionDate = preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['sessionDate'] ?? '') ? $data['sessionDate'] : date('Y-m-d');
$sessionType = strip_tags($data['sessionType'] ?? 'General Progress');
$notes = strip_tags($data['notes'] ?? '');
$attendance = in_array($data['attendance'] ?? '', ['Present', 'Absent', 'Excused']) ? $data['attendance'] : 'Present';
$createdBy = isset($data['createdBy']) ? (int)$data['createdBy'] : null;

if (!$dispositionPlanId || $dispositionPlanId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid Disposition plan ID is required']);
    exit();
}

// Combine attendance and notes for storage
$fullNotes = "[Attendance: $attendance] $notes";

try {
    $stmt = $pdo->prepare("
        INSERT INTO disposition_updates (disposition_plan_id, update_date, update_type, notes, created_by)
        VALUES (:planId, :sessionDate, :sessionType, :notes, :createdBy)
    ");

    $stmt->execute([
        ':planId' => $dispositionPlanId,
        ':sessionDate' => $sessionDate,
        ':sessionType' => $sessionType,
        ':notes' => $fullNotes,
        ':createdBy' => $createdBy,
    ]);

    $newId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'session' => [
            'id' => (int)$newId,
            'disposition_plan_id' => (int)$dispositionPlanId,
            'update_date' => $sessionDate,
            'update_type' => $sessionType,
            'notes' => $fullNotes,
            'attendance' => $attendance,
            'raw_notes' => $notes,
            'created_by' => $createdBy,
            'created_at' => date('Y-m-d H:i:s'),
            'author_name' => null,
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save session: ' . $e->getMessage()
    ]);
}
?>
