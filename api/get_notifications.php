<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $notifications = [];

    // 1. New Cases (Last 24 hours)
    $stmtNew = $pdo->query("SELECT id, first_name, last_name, created_at FROM cases WHERE created_at >= NOW() - INTERVAL 1 DAY ORDER BY created_at DESC");
    $newCases = $stmtNew->fetchAll();
    foreach ($newCases as $case) {
        $notifications[] = [
            'id' => 'new_' . $case['id'],
            'title' => 'New Case Assignment',
            'message' => "A new case for {$case['first_name']} {$case['last_name']} was added.",
            'type' => 'info',
            'read' => false,
            'createdAt' => strtotime($case['created_at']) * 1000
        ];
    }

    // 2. Overdue Assessments (Pending for > 3 days)
    // A case is pending if it has no associated assessment
    $stmtOverdue = $pdo->query("
        SELECT c.id, c.first_name, c.last_name, c.created_at 
        FROM cases c
        LEFT JOIN assessments a ON c.id = a.case_id
        WHERE a.id IS NULL AND c.created_at <= NOW() - INTERVAL 3 DAY
    ");
    $overdueCases = $stmtOverdue->fetchAll();
    foreach ($overdueCases as $case) {
        $notifications[] = [
            'id' => 'overdue_' . $case['id'],
            'title' => 'SLA Alert: Overdue Assessment',
            'message' => "The assessment for {$case['first_name']} {$case['last_name']} is overdue (pending for >3 days).",
            'type' => 'error',
            'read' => false,
            'createdAt' => time() * 1000 // current time for alert
        ];
    }

    // 3. System Alert (Mock)
    $notifications[] = [
        'id' => 'sys_1',
        'title' => 'System Update',
        'message' => 'CADS system will undergo maintenance tonight at 11 PM.',
        'type' => 'warning',
        'read' => false,
        'createdAt' => time() * 1000
    ];

    echo json_encode(['success' => true, 'notifications' => $notifications]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
