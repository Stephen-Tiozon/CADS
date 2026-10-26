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
    // 1. Cases per Month (Past 6 months or all time, let's do all time grouped by month)
    $stmt1 = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as count 
        FROM cases 
        WHERE is_archived = 0 
        GROUP BY DATE_FORMAT(created_at, '%b %Y'), YEAR(created_at), MONTH(created_at)
        ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
        LIMIT 12
    ");
    $casesPerMonth = $stmt1->fetchAll(PDO::FETCH_ASSOC);
    // Cast counts to int
    foreach($casesPerMonth as &$cpm) {
        $cpm['count'] = (int)$cpm['count'];
    }

    // 2. Average Discernment Levels (LMD Buckets according to DSWD Manual: 1.00 - 6.00 scale)
    $stmt2 = $pdo->query("
        SELECT 
            SUM(CASE WHEN lmd <= 2.50 THEN 1 ELSE 0 END) as low,
            SUM(CASE WHEN lmd > 2.50 AND lmd <= 4.50 THEN 1 ELSE 0 END) as medium,
            SUM(CASE WHEN lmd > 4.50 THEN 1 ELSE 0 END) as high
        FROM assessments a
        JOIN cases c ON a.case_id = c.id
        WHERE c.is_archived = 0
    ");
    $lmdRow = $stmt2->fetch(PDO::FETCH_ASSOC);
    $discernmentLevels = [
        ['name' => 'Low Discernment', 'value' => (int)($lmdRow['low'] ?? 0)],
        ['name' => 'Medium Discernment', 'value' => (int)($lmdRow['medium'] ?? 0)],
        ['name' => 'High Discernment', 'value' => (int)($lmdRow['high'] ?? 0)]
    ];

    // 3. Most Common Risk Factors
    // Count occurrences of risk factors in assessment_answers where score_weight > 1
    $stmt3 = $pdo->query("
        SELECT a.question_text as name, COUNT(*) as count 
        FROM assessment_answers a
        JOIN cases c ON a.case_id = c.id
        WHERE c.is_archived = 0 AND a.score_weight > 1
        GROUP BY a.question_text 
        ORDER BY count DESC 
        LIMIT 5
    ");
    $riskFactors = $stmt3->fetchAll(PDO::FETCH_ASSOC);
    foreach($riskFactors as &$rf) {
        $rf['count'] = (int)$rf['count'];
    }

    // 4. Status Distribution (Urgent vs Safe)
    $stmt4 = $pdo->query("
        SELECT 
            CASE 
                WHEN a.risk_index >= 15 THEN 'Urgent'
                ELSE 'Safe'
            END as name,
            COUNT(*) as value
        FROM assessments a
        JOIN cases c ON a.case_id = c.id
        WHERE c.is_archived = 0
        GROUP BY name
    ");
    $statusDistRow = $stmt4->fetchAll(PDO::FETCH_ASSOC);
    $statusDistribution = [];
    foreach($statusDistRow as $sdr) {
        $statusDistribution[] = [
            'name' => $sdr['name'],
            'value' => (int)$sdr['value']
        ];
    }

    // 5. Gender Distribution
    $stmt5 = $pdo->query("
        SELECT gender as name, COUNT(*) as value 
        FROM cases 
        WHERE is_archived = 0 
        GROUP BY gender
    ");
    $genderRow = $stmt5->fetchAll(PDO::FETCH_ASSOC);
    $genderDistribution = [];
    foreach($genderRow as $gr) {
        $genderDistribution[] = [
            'name' => ucfirst($gr['name'] ?: 'Unknown'),
            'value' => (int)$gr['value']
        ];
    }

    // 6. Age Distribution
    $stmt6 = $pdo->query("
        SELECT 
            CASE 
                WHEN age < 12 THEN 'Under 12'
                WHEN age BETWEEN 12 AND 15 THEN '12-15 yrs'
                WHEN age BETWEEN 16 AND 18 THEN '16-18 yrs'
                ELSE 'Over 18'
            END as name,
            COUNT(*) as value
        FROM cases 
        WHERE is_archived = 0 AND age IS NOT NULL
        GROUP BY name
    ");
    $ageRow = $stmt6->fetchAll(PDO::FETCH_ASSOC);
    $ageDistribution = [];
    foreach($ageRow as $ar) {
        $ageDistribution[] = [
            'name' => $ar['name'],
            'value' => (int)$ar['value']
        ];
    }

    echo json_encode([
        'success' => true,
        'casesPerMonth' => $casesPerMonth,
        'discernmentLevels' => $discernmentLevels,
        'riskFactors' => $riskFactors,
        'statusDistribution' => $statusDistribution,
        'genderDistribution' => $genderDistribution,
        'ageDistribution' => $ageDistribution
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch analytics: ' . $e->getMessage()
    ]);
}
?>
