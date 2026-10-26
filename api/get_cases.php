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
    $archived = isset($_GET['archived']) && $_GET['archived'] === '1' ? 1 : 0;

    // Fetch cases and their assessments
    $stmt = $pdo->prepare("
        SELECT c.id, c.first_name, c.last_name, c.age, c.created_at, c.offense, a.risk_index 
        FROM cases c
        LEFT JOIN assessments a ON c.id = a.case_id
        WHERE c.is_archived = :archived
        ORDER BY c.created_at DESC
    ");
    
    $stmt->execute([':archived' => $archived]);
    $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the cases for the frontend Dashboard
    $formattedCases = array_map(function($case) {
        $date = new DateTime($case['created_at']);
        
        // Compute dynamic status based on risk index
        $status = 'Pending';
        if (isset($case['risk_index'])) {
            $status = $case['risk_index'] >= 15 ? 'Urgent' : 'Safe';
        }

        $year = $date->format('Y');
        
        return [
            'id' => 'CICL-' . $year . '-' . str_pad($case['id'], 4, '0', STR_PAD_LEFT),
            'name' => trim($case['first_name'] . ' ' . $case['last_name']),
            'age' => $case['age'] ?? 'N/A',
            'referral' => $date->format('M j, Y'),
            'offense' => $case['offense'] ?: 'N/A',
            'status' => $status,
            'sla' => 'Completed'
        ];
    }, $cases);

    echo json_encode([
        'success' => true,
        'cases' => $formattedCases
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch cases: ' . $e->getMessage()
    ]);
}

?>
