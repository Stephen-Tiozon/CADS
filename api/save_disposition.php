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
$dispositionType = $data['dispositionType'] ?? '';
$description = $data['description'] ?? '';
$startDate = $data['startDate'] ?? null;
$endDate = $data['endDate'] ?? null;
$status = $data['status'] ?? 'Active';
$createdBy = $data['createdBy'] ?? null;
$dispositionId = $data['id'] ?? null; // For updates

if (!$caseId || empty($dispositionType)) {
    http_response_code(400);
    echo json_encode(['error' => 'Case ID and disposition type are required']);
    exit();
}

try {
    if ($dispositionId) {
        // Update existing disposition
        $stmt = $pdo->prepare("
            UPDATE disposition_plans 
            SET disposition_type = :type, description = :description, start_date = :start_date, 
                end_date = :end_date, status = :status
            WHERE id = :id AND case_id = :case_id
        ");
        $stmt->execute([
            ':type' => $dispositionType,
            ':description' => $description,
            ':start_date' => $startDate ?: null,
            ':end_date' => $endDate ?: null,
            ':status' => $status,
            ':id' => $dispositionId,
            ':case_id' => $caseId
        ]);
        echo json_encode(['success' => true, 'message' => 'Disposition plan updated']);
    } else {
        // Insert new disposition
        $stmt = $pdo->prepare("
            INSERT INTO disposition_plans (case_id, disposition_type, description, start_date, end_date, status, created_by)
            VALUES (:case_id, :type, :description, :start_date, :end_date, :status, :created_by)
        ");
        $stmt->execute([
            ':case_id' => $caseId,
            ':type' => $dispositionType,
            ':description' => $description,
            ':start_date' => $startDate ?: null,
            ':end_date' => $endDate ?: null,
            ':status' => $status,
            ':created_by' => $createdBy
        ]);
        echo json_encode([
            'success' => true,
            'message' => 'Disposition plan created',
            'id' => $pdo->lastInsertId()
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save disposition: ' . $e->getMessage()
    ]);
}
?>
