<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM lmd_question_bank ORDER BY id ASC");
    $stmt->execute();
    
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Parse JSON fields
    foreach ($questions as &$q) {
        $q['options'] = json_decode($q['options'], true);
        $q['scores'] = json_decode($q['scores'], true);
        
        // Ensure id is integer
        $q['id'] = (int)$q['id'];
    }
    
    echo json_encode([
        'success' => true,
        'questions' => $questions
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
