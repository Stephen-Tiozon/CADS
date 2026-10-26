<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dispositionPlanId = $_GET['disposition_plan_id'] ?? null;

if (!$dispositionPlanId) {
    http_response_code(400);
    echo json_encode(['error' => 'Disposition plan ID is required']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT du.*, u.full_name as author_name
        FROM disposition_updates du
        LEFT JOIN users u ON du.created_by = u.id
        WHERE du.disposition_plan_id = :planId
        ORDER BY du.update_date DESC, du.created_at DESC
    ");
    $stmt->execute([':planId' => $dispositionPlanId]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse attendance from notes for each session
    $parsed = array_map(function($s) {
        $attendance = 'Present';
        $rawNotes = $s['notes'];
        if (preg_match('/^\[Attendance: (Present|Absent|Excused)\] (.*)$/s', $s['notes'], $matches)) {
            $attendance = $matches[1];
            $rawNotes = $matches[2];
        }
        $s['attendance'] = $attendance;
        $s['raw_notes'] = $rawNotes;
        return $s;
    }, $sessions);

    echo json_encode([
        'success' => true,
        'sessions' => $parsed
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch sessions: ' . $e->getMessage()
    ]);
}
?>
