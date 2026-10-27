<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$caseId = $_GET['id'] ?? null;

if (!$caseId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing case id']);
    exit();
}

// The frontend sends CICL-2024-0001 format, extract numeric ID
$parts = explode('-', $caseId);
$numericId = (int)end($parts);
if ($numericId === 0) {
    $numericId = (int)$caseId;
}

try {
    // 1. Case info
    $stmt = $pdo->prepare("SELECT c.*, u.full_name as social_worker_name FROM cases c LEFT JOIN users u ON c.social_worker_id = u.id WHERE c.id = :id");
    $stmt->execute([':id' => $numericId]);
    $caseData = $stmt->fetch();

    if (!$caseData) {
        http_response_code(404);
        echo json_encode(['error' => 'Case not found']);
        exit();
    }

    // 2. Family members
    $stmt = $pdo->prepare("SELECT * FROM family_members WHERE case_id = :id ORDER BY id");
    $stmt->execute([':id' => $numericId]);
    $familyMembers = $stmt->fetchAll();

    // 3. Assessment scores
    $stmt = $pdo->prepare("SELECT * FROM assessments WHERE case_id = :id LIMIT 1");
    $stmt->execute([':id' => $numericId]);
    $assessment = $stmt->fetch();

    // 4. Assessment answers
    $stmt = $pdo->prepare("SELECT * FROM assessment_answers WHERE case_id = :id ORDER BY id");
    $stmt->execute([':id' => $numericId]);
    $answers = $stmt->fetchAll();

    // 5. Disposition plans
    $stmt = $pdo->prepare("SELECT dp.*, u.full_name as created_by_name FROM disposition_plans dp LEFT JOIN users u ON dp.created_by = u.id WHERE dp.case_id = :id ORDER BY dp.created_at DESC");
    $stmt->execute([':id' => $numericId]);
    $dispositions = $stmt->fetchAll();

    // 6. Case notes
    $stmt = $pdo->prepare("SELECT cn.*, u.full_name as author_name FROM case_notes cn LEFT JOIN users u ON cn.social_worker_id = u.id WHERE cn.case_id = :id ORDER BY cn.created_at DESC");
    $stmt->execute([':id' => $numericId]);
    $notes = $stmt->fetchAll();

    // 7. Case files
    $stmt = $pdo->prepare("SELECT * FROM case_files WHERE case_id = :id ORDER BY uploaded_at DESC");
    $stmt->execute([':id' => $numericId]);
    $files = $stmt->fetchAll();

    // Format response
    $date = !empty($caseData['created_at']) ? new DateTime($caseData['created_at']) : new DateTime();
    $year = $date->format('Y');
    $formattedId = 'CICL-' . $year . '-' . str_pad($caseData['id'], 4, '0', STR_PAD_LEFT);

    // Compute status
    $status = 'Pending';
    if (!empty($caseData['status'])) {
        $status = $caseData['status'];
    } elseif (isset($caseData['age_at_offense']) && (int)$caseData['age_at_offense'] > 0 && (int)$caseData['age_at_offense'] <= 15) {
        $status = 'Not applicable - below minimum age of criminal responsibility';
    } elseif ($assessment && isset($assessment['risk_index'])) {
        $status = $assessment['risk_index'] >= 15 ? 'Urgent' : 'Safe';
    }

    echo json_encode([
        'success' => true,
        'case' => [
            'id' => $caseData['id'],
            'formattedId' => $formattedId,
            'firstName' => $caseData['first_name'],
            'lastName' => $caseData['last_name'],
            'alias' => $caseData['alias'],
            'dateOfBirth' => $caseData['date_of_birth'],
            'placeOfBirth' => $caseData['place_of_birth'],
            'highestEducation' => $caseData['highest_education'],
            'birthStatus' => $caseData['birth_status'],
            'disability' => $caseData['disability'],
            'presentAddress' => $caseData['present_address'],
            'permanentAddress' => $caseData['permanent_address'],
            'ageAtOffense' => $caseData['age_at_offense'],
            'age' => $caseData['age'],
            'gender' => $caseData['gender'],
            'address' => $caseData['address'],
            'contactNumber' => $caseData['contact_number'],
            'primaryGuardian' => $caseData['primary_guardian'],
            'offense' => $caseData['offense'],
            'offenseDate' => $caseData['offense_date'],
            'offenseLocation' => $caseData['offense_location'],
            'socialWorkerName' => $caseData['social_worker_name'] ?? null,
            'createdAt' => $caseData['created_at'],
            'status' => $status
        ],
        'familyMembers' => $familyMembers,
        'assessment' => $assessment ? [
            'lmdScore' => (float)$assessment['lmd'],
            'riskIndex' => (float)$assessment['risk_index'],
            'ivjScore' => (int)$assessment['ivj'],
            'ffcScore' => (float)$assessment['ffc'],
            'cfcScore' => (float)$assessment['cfc'],
        ] : null,
        'answers' => $answers,
        'dispositions' => $dispositions,
        'notes' => $notes,
        'files' => $files
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch case details: ' . $e->getMessage()
    ]);
}
?>
