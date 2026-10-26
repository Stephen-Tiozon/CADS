<?php
header('Content-Type: application/json');
require_once 'db.php';

$type = $_GET['type'] ?? 'IVJ';

try {
    $stmt = $pdo->prepare("SELECT id, assessment_type, statement, is_reverse_scored FROM question_bank WHERE assessment_type = :type ORDER BY id ASC");
    $stmt->execute([':type' => $type]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert string/int to correct types for frontend
    foreach ($questions as &$q) {
        $q['is_reverse_scored'] = (bool)$q['is_reverse_scored'];
    }

    echo json_encode(['success' => true, 'questions' => $questions]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
