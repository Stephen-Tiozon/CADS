<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? null;
$type = $data['assessment_type'] ?? 'IVJ';
$statement = $data['statement'] ?? '';
$isReverseScored = isset($data['is_reverse_scored']) ? (int)$data['is_reverse_scored'] : 0;

if (empty($statement)) {
    echo json_encode(['success' => false, 'error' => 'Statement cannot be empty']);
    exit;
}

try {
    if ($id) {
        $stmt = $pdo->prepare("UPDATE question_bank SET statement = :stmt, is_reverse_scored = :rev WHERE id = :id");
        $stmt->execute([':stmt' => $statement, ':rev' => $isReverseScored, ':id' => $id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO question_bank (assessment_type, statement, is_reverse_scored) VALUES (:type, :stmt, :rev)");
        $stmt->execute([':type' => $type, ':stmt' => $statement, ':rev' => $isReverseScored]);
        $id = $pdo->lastInsertId();
    }
    
    echo json_encode(['success' => true, 'id' => $id]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
