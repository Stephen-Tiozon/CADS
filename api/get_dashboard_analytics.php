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

    // 2. Average Discernment Levels (Official DSWD 6 Tiers: 1.00 - 6.00 scale)
    $stmtAssessments = $pdo->query("
        SELECT a.lmd, a.ivj
        FROM assessments a
        JOIN cases c ON a.case_id = c.id
        WHERE c.is_archived = 0
    ");
    $rows = $stmtAssessments->fetchAll(PDO::FETCH_ASSOC);

    $counts = [
        'Very Poor' => 0,
        'Poor' => 0,
        'Below Average' => 0,
        'Average' => 0,
        'Above Average' => 0,
        'Superior' => 0
    ];

    foreach ($rows as $row) {
        $rawLmd = (float)($row['lmd'] ?? 0);
        $rawIvj = (float)($row['ivj'] ?? 0);

        // Normalize LMD to 1.00 - 6.00 scale if needed
        $lmdMean = $rawLmd > 6 ? ($rawLmd / 100.0) * 5.0 + 1.0 : $rawLmd;
        
        // LMD Scaled Score (1 to 6)
        if ($lmdMean >= 5.51) $ssLmd = 6;
        elseif ($lmdMean >= 4.51) $ssLmd = 5;
        elseif ($lmdMean >= 3.51) $ssLmd = 4;
        elseif ($lmdMean >= 2.51) $ssLmd = 3;
        elseif ($lmdMean >= 1.51) $ssLmd = 2;
        elseif ($lmdMean >= 1.00) $ssLmd = 1;
        else $ssLmd = 0;

        // IVJ Scaled Score (0 - 54 raw correct -> 1 to 6 scaled)
        if ($rawIvj >= 46) $ssIvj = 6;
        elseif ($rawIvj >= 37) $ssIvj = 5;
        elseif ($rawIvj >= 28) $ssIvj = 4;
        elseif ($rawIvj >= 19) $ssIvj = 3;
        elseif ($rawIvj >= 10) $ssIvj = 2;
        elseif ($rawIvj >= 1) $ssIvj = 1;
        else $ssIvj = 0;

        if ($ssLmd > 0 && $ssIvj > 0) {
            $combined = ($ssLmd + $ssIvj) / 2.0;
        } elseif ($ssLmd > 0) {
            $combined = (float)$ssLmd;
        } elseif ($ssIvj > 0) {
            $combined = (float)$ssIvj;
        } else {
            continue;
        }

        if ($combined >= 5.51) $counts['Superior']++;
        elseif ($combined >= 4.51) $counts['Above Average']++;
        elseif ($combined >= 3.51) $counts['Average']++;
        elseif ($combined >= 2.51) $counts['Below Average']++;
        elseif ($combined >= 1.51) $counts['Poor']++;
        elseif ($combined >= 1.00) $counts['Very Poor']++;
    }

    $discernmentLevels = [
        ['name' => 'Very Poor', 'value' => $counts['Very Poor']],
        ['name' => 'Poor', 'value' => $counts['Poor']],
        ['name' => 'Below Average', 'value' => $counts['Below Average']],
        ['name' => 'Average', 'value' => $counts['Average']],
        ['name' => 'Above Average', 'value' => $counts['Above Average']],
        ['name' => 'Superior', 'value' => $counts['Superior']]
    ];

    // 3. Most Common Risk Factors (CFC and FFC indicators only)
    $stmt3 = $pdo->query("
        SELECT a.question_text as name, COUNT(*) as count 
        FROM assessment_answers a
        JOIN cases c ON a.case_id = c.id
        WHERE c.is_archived = 0 
          AND a.recommended_intervention IS NOT NULL 
          AND TRIM(a.recommended_intervention) != ''
          AND a.question_category IN (
              'Educational / Cognitive',
              'Psychological / Emotional',
              'Behavioral / Social / Spiritual',
              'Positive Family Relationships',
              'Negative Family Relationships',
              'Positive Coping Style'
          )
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
