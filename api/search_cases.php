<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");

$query = $_GET['q'] ?? '';

if (strlen(trim($query)) < 2) {
    echo json_encode(['success' => true, 'results' => []]);
    exit();
}

$searchTerm = "%{$query}%";

try {
    $stmt = $pdo->prepare("
        SELECT id, first_name, last_name, offense, is_archived, created_at 
        FROM cases 
        WHERE first_name LIKE :q1 
           OR last_name LIKE :q2 
           OR CONCAT(first_name, ' ', last_name) LIKE :q3
           OR offense LIKE :q4
           OR id = :id_val
        LIMIT 10
    ");
    
    $idVal = is_numeric($query) ? (int)$query : 0;
    
    $stmt->execute([
        ':q1' => $searchTerm,
        ':q2' => $searchTerm,
        ':q3' => $searchTerm,
        ':q4' => $searchTerm,
        ':id_val' => $idVal
    ]);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format results
    $formatted = array_map(function($case) {
        $formattedId = 'CICL-' . date('Y', strtotime($case['created_at'])) . '-' . str_pad($case['id'], 4, '0', STR_PAD_LEFT);
        return [
            'id' => $case['id'],
            'formattedId' => $formattedId,
            'name' => $case['first_name'] . ' ' . $case['last_name'],
            'offense' => $case['offense'],
            'status' => $case['is_archived'] ? 'Archived' : 'Active'
        ];
    }, $results);

    echo json_encode(['success' => true, 'results' => $formatted]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
