<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

try {

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['id'])) {
        throw new Exception("ID is required.");
    }

    $id = $input['id'];

    $stmt = $pdo->prepare("DELETE FROM observational_indicators WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode([
        'success' => true
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
