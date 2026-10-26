<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");

// Allow cross-origin requests for local dev if necessary (Vite proxy usually handles this though)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Read JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['intakeData']) || !isset($data['assessmentData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit();
}

$intake = $data['intakeData'];
$assessment = $data['assessmentData'];

// Ensure columns support decimal values for DSWD assessment scores (LMD, CFC, FFC means)
try {
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN lmd DECIMAL(5,2) NOT NULL DEFAULT 0.00");
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN risk_index DECIMAL(5,2) NOT NULL DEFAULT 0.00");
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN ffc DECIMAL(5,2) NOT NULL DEFAULT 0.00");
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN cfc DECIMAL(5,2) NOT NULL DEFAULT 0.00");
} catch (Exception $e) {
    // Ignore if already altered or restricted
}

// Security Hardening & Validation
$firstName = trim(strip_tags($intake['firstName'] ?? ''));
$lastName = trim(strip_tags($intake['lastName'] ?? ''));
$age = (isset($intake['age']) && $intake['age'] !== "") ? (int)$intake['age'] : null;

if (empty($firstName) || empty($lastName)) {
    http_response_code(400);
    echo json_encode(['error' => 'First name and last name are required']);
    exit();
}

if ($age !== null && ($age < 0 || $age > 120)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid age provided']);
    exit();
}

// Sanitize other string fields
$gender = strip_tags($intake['gender'] ?? '');
$address = strip_tags($intake['address'] ?? '');
$contactNumber = strip_tags($intake['contactNumber'] ?? '');
$offense = strip_tags($intake['offense'] ?? '');
$offenseDate = preg_match('/^\d{4}-\d{2}-\d{2}$/', $intake['offenseDate'] ?? '') ? $intake['offenseDate'] : null;
$offenseLocation = strip_tags($intake['offenseLocation'] ?? '');
$primaryGuardian = strip_tags($intake['primaryGuardian'] ?? '');


try {
    $pdo->beginTransaction();

    // 1. Insert Case
    $stmtCase = $pdo->prepare("
        INSERT INTO cases (first_name, last_name, alias, date_of_birth, place_of_birth, highest_education, birth_status, disability, present_address, permanent_address, age_at_offense, age, gender, address, contact_number, offense, offense_date, offense_location, primary_guardian)
        VALUES (:first_name, :last_name, :alias, :date_of_birth, :place_of_birth, :highest_education, :birth_status, :disability, :present_address, :permanent_address, :age_at_offense, :age, :gender, :address, :contact_number, :offense, :offense_date, :offense_location, :primary_guardian)
    ");
    
    // Check if age is empty and set to null if necessary
    $age = (isset($intake['age']) && $intake['age'] !== "") ? (int)$intake['age'] : null;
    $ageAtOffense = (isset($intake['ageAtOffense']) && $intake['ageAtOffense'] !== "") ? (int)$intake['ageAtOffense'] : null;

    $stmtCase->execute([
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':alias' => strip_tags($intake['alias'] ?? ''),
        ':date_of_birth' => (isset($intake['dateOfBirth']) && $intake['dateOfBirth'] !== "") ? $intake['dateOfBirth'] : null,
        ':place_of_birth' => strip_tags($intake['placeOfBirth'] ?? ''),
        ':highest_education' => strip_tags($intake['highestEducation'] ?? ''),
        ':birth_status' => strip_tags($intake['birthStatus'] ?? ''),
        ':disability' => strip_tags($intake['disability'] ?? ''),
        ':present_address' => strip_tags($intake['presentAddress'] ?? ''),
        ':permanent_address' => strip_tags($intake['permanentAddress'] ?? ''),
        ':age_at_offense' => $ageAtOffense,
        ':age' => $age,
        ':gender' => $gender,
        ':address' => $address,
        ':contact_number' => $contactNumber,
        ':offense' => $offense,
        ':offense_date' => $offenseDate,
        ':offense_location' => $offenseLocation,
        ':primary_guardian' => $primaryGuardian
    ]);

    $caseId = $pdo->lastInsertId();

    // 2. Insert Family Members
    if (isset($intake['familyMembers']) && is_array($intake['familyMembers'])) {
        $stmtFamily = $pdo->prepare("
            INSERT INTO family_members (case_id, name, relationship, age, occupation)
            VALUES (:case_id, :name, :relationship, :age, :occupation)
        ");

        foreach ($intake['familyMembers'] as $member) {
            // Skip empty rows
            if (empty($member['name'])) continue;

            $memberAge = (isset($member['age']) && $member['age'] !== "") ? (int)$member['age'] : null;
            
            $stmtFamily->execute([
                ':case_id' => $caseId,
                ':name' => $member['name'],
                ':relationship' => $member['relationship'] ?? '',
                ':age' => $memberAge,
                ':occupation' => $member['occupation'] ?? ''
            ]);
        }
    }

    // 3. Insert Assessment Scores
    $stmtAssessment = $pdo->prepare("
        INSERT INTO assessments (case_id, lmd, risk_index, ivj, ffc, cfc)
        VALUES (:case_id, :lmd, :risk_index, :ivj, :ffc, :cfc)
    ");

    $stmtAssessment->execute([
        ':case_id' => $caseId,
        ':lmd' => $assessment['lmdScore'] ?? 0,
        ':risk_index' => $assessment['riskIndex'] ?? 0,
        ':ivj' => $assessment['ivjScore'] ?? 0,
        ':ffc' => $assessment['ffcScore'] ?? 0,
        ':cfc' => $assessment['cfcScore'] ?? 0
    ]);

    // 4. Insert Assessment Answers
    if (isset($assessment['answers']) && is_array($assessment['answers'])) {
        $stmtAnswers = $pdo->prepare("
            INSERT INTO assessment_answers (case_id, question_category, question_text, selected_answer, score_weight, recommended_intervention)
            VALUES (:case_id, :question_category, :question_text, :selected_answer, :score_weight, :recommended_intervention)
        ");

        foreach ($assessment['answers'] as $ans) {
            $stmtAnswers->execute([
                ':case_id' => $caseId,
                ':question_category' => $ans['category'] ?? 'General',
                ':question_text' => $ans['questionText'] ?? '',
                ':selected_answer' => $ans['selectedAnswer'] ?? '',
                ':score_weight' => $ans['scoreWeight'] ?? 0,
                ':recommended_intervention' => $ans['recommendedIntervention'] ?? null
            ]);
        }
    }

    $pdo->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Case saved successfully',
        'case_id' => $caseId
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save case: ' . $e->getMessage()
    ]);
}

?>
