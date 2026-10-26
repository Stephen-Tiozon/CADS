<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

try {

    $type = $_GET['type'] ?? '';

    if ($type) {
        $stmt = $pdo->prepare("SELECT * FROM observational_indicators WHERE type = :type ORDER BY item_number ASC, id ASC");
        $stmt->execute([':type' => $type]);
    } else {
        $stmt = $pdo->query("SELECT * FROM observational_indicators ORDER BY type, item_number ASC, id ASC");
    }

    $indicators = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'indicators' => $indicators
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
