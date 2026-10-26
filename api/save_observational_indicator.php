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

    if (!$input) {
        throw new Exception("Invalid input format");
    }

    $id = $input['id'] ?? null;
    $type = $input['type'] ?? '';
    $category = $input['category'] ?? '';
    $statement = $input['statement'] ?? '';
    $risk_weight = isset($input['risk_weight']) ? (int)$input['risk_weight'] : 0;
    $is_positive = isset($input['is_positive']) ? (int)$input['is_positive'] : 1;
    $item_number = isset($input['item_number']) ? (int)$input['item_number'] : 1;
    $recommended_intervention = $input['recommended_intervention'] ?? null;

    if (empty($type) || empty($category) || empty($statement)) {
        throw new Exception("Type, category, and statement are required.");
    }

    if ($id) {
        $stmt = $pdo->prepare("UPDATE observational_indicators SET type = :type, item_number = :item_number, category = :category, statement = :statement, risk_weight = :risk_weight, is_positive = :is_positive, recommended_intervention = :recommended_intervention WHERE id = :id");
        $stmt->execute([
            ':type' => $type,
            ':item_number' => $item_number,
            ':category' => $category,
            ':statement' => $statement,
            ':risk_weight' => $risk_weight,
            ':is_positive' => $is_positive,
            ':recommended_intervention' => $recommended_intervention,
            ':id' => $id
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO observational_indicators (type, item_number, category, statement, risk_weight, is_positive, recommended_intervention) VALUES (:type, :item_number, :category, :statement, :risk_weight, :is_positive, :recommended_intervention)");
        $stmt->execute([
            ':type' => $type,
            ':item_number' => $item_number,
            ':category' => $category,
            ':statement' => $statement,
            ':risk_weight' => $risk_weight,
            ':is_positive' => $is_positive,
            ':recommended_intervention' => $recommended_intervention
        ]);
        $id = $pdo->lastInsertId();
    }

    echo json_encode([
        'success' => true,
        'id' => $id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
