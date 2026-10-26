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

$id = $data['id'] ?? null;
$dilemma = $data['dilemma'] ?? '';
$options = $data['options'] ?? [];
$scores = $data['scores'] ?? [];

if (empty($dilemma) || count($options) !== 6 || count($scores) !== 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Dilemma, exactly 6 options, and exactly 6 scores are required']);
    exit();
}

$optionsJson = json_encode($options);
$scoresJson = json_encode($scores);

try {
    if ($id) {
        $stmt = $pdo->prepare("UPDATE lmd_question_bank SET dilemma = :dilemma, options = :options, scores = :scores WHERE id = :id");
        $stmt->execute([
            ':id' => $id,
            ':dilemma' => $dilemma,
            ':options' => $optionsJson,
            ':scores' => $scoresJson
        ]);
        $message = 'Question updated successfully';
    } else {
        $stmt = $pdo->prepare("INSERT INTO lmd_question_bank (dilemma, options, scores) VALUES (:dilemma, :options, :scores)");
        $stmt->execute([
            ':dilemma' => $dilemma,
            ':options' => $optionsJson,
            ':scores' => $scoresJson
        ]);
        $id = $pdo->lastInsertId();
        $message = 'Question added successfully';
    }

    echo json_encode([
        'success' => true,
        'message' => $message,
        'id' => $id
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
