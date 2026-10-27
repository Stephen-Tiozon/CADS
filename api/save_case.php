<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");

// Allow cross-origin requests for local dev if necessary
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

if (!$data || !isset($data['intakeData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload: missing intakeData']);
    exit();
}

$intake = $data['intakeData'];
$assessment = $data['assessmentData'] ?? null;

// Ensure columns exist and support decimal values
try {
    $pdo->exec("ALTER TABLE cases ADD COLUMN status VARCHAR(100) DEFAULT NULL");
} catch (Exception $e) {}

try {
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN lmd DECIMAL(5,2) NOT NULL DEFAULT 0.00");
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN risk_index DECIMAL(5,2) NOT NULL DEFAULT 0.00");
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN ffc DECIMAL(5,2) NOT NULL DEFAULT 0.00");
    $pdo->exec("ALTER TABLE assessments MODIFY COLUMN cfc DECIMAL(5,2) NOT NULL DEFAULT 0.00");
} catch (Exception $e) {}

// User / Session context for audit logging
$userId = (int)($data['userId'] ?? $data['user_id'] ?? 0);
$userName = trim(strip_tags($data['userName'] ?? $data['user_name'] ?? 'System'));
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// Basic field sanitation
$firstName = trim(strip_tags($intake['firstName'] ?? ''));
$lastName = trim(strip_tags($intake['lastName'] ?? ''));

if (empty($firstName) || empty($lastName)) {
    http_response_code(400);
    echo json_encode(['error' => 'First name and last name are required']);
    exit();
}

$dateOfBirth = trim($intake['dateOfBirth'] ?? '');
$offenseDate = trim($intake['offenseDate'] ?? '');

if (empty($dateOfBirth)) {
    http_response_code(400);
    echo json_encode(['error' => 'Date of birth is required']);
    exit();
}

if (empty($offenseDate)) {
    http_response_code(400);
    echo json_encode(['error' => 'Date of offense is required']);
    exit();
}

// Date validation and server-side strict recomputation of age_at_offense
try {
    $dob = new DateTime($dateOfBirth);
    $offense = new DateTime($offenseDate);
    $today = new DateTime();
    $today->setTime(23, 59, 59);

    if ($offense < $dob) {
        http_response_code(400);
        echo json_encode(['error' => 'Date of offense cannot be earlier than date of birth.']);
        exit();
    }

    if ($offense > $today) {
        http_response_code(400);
        echo json_encode(['error' => 'Date of offense cannot be a future date.']);
        exit();
    }

    // Exact difference in completed years
    $ageAtOffenseDiff = $dob->diff($offense);
    $computedAgeAtOffense = (int)$ageAtOffenseDiff->y;

    $currentAgeDiff = $dob->diff(new DateTime());
    $computedCurrentAge = (int)$currentAgeDiff->y;

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid date format for Date of Birth or Date of Offense: ' . $e->getMessage()]);
    exit();
}

// 18 years old and above at time of offense: Reject intake (Not a CICL)
if ($computedAgeAtOffense >= 18) {
    $logDetails = json_encode([
        'rule_triggered' => 'INTAKE_AGE_REJECTED',
        'age_at_offense' => $computedAgeAtOffense,
        'current_age' => $computedCurrentAge,
        'date_of_birth' => $dateOfBirth,
        'date_of_offense' => $offenseDate,
        'reason' => 'Individual was 18 years of age or older at the time of the offense and cannot be registered as a CICL under RA 9344.'
    ], JSON_UNESCAPED_SLASHES);

    try {
        $stmtAudit = $pdo->prepare("INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, 'INTAKE_AGE_REJECTED', 'cases', NULL, ?, ?)");
        $stmtAudit->execute([$userId, $userName, $logDetails, $ipAddress]);
    } catch (Exception $e) {}

    http_response_code(422);
    echo json_encode([
        'success' => false,
        'error' => "Intake rejected: The individual was 18 years of age or older ({$computedAgeAtOffense} years old) at the time of the offense and cannot be registered as a Child in Conflict with the Law (CICL) under RA 9344."
    ]);
    exit();
}

// Determine status based on statutory age rules and assessment completion
if ($computedAgeAtOffense <= 15) {
    $caseStatus = "Not applicable - below minimum age of criminal responsibility";
} else {
    $hasDiscernmentAssessment = $assessment && (
        (!empty($assessment['lmdScore']) && (float)$assessment['lmdScore'] > 0) ||
        (!empty($assessment['ivjScore']) && (float)$assessment['ivjScore'] > 0)
    );
    if ($hasDiscernmentAssessment) {
        $caseStatus = (($assessment['riskIndex'] ?? 0) >= 15) ? 'Urgent' : 'Safe';
    } else {
        $caseStatus = 'Pending';
    }
}

// Check if updating an existing case ID (e.g. from intake to assessment completion)
$existingCaseIdRaw = $data['caseId'] ?? null;
$existingNumericId = null;
if ($existingCaseIdRaw) {
    $parts = explode('-', (string)$existingCaseIdRaw);
    $lastPart = (int)end($parts);
    if ($lastPart > 0) {
        $existingNumericId = $lastPart;
    }
}

// Sanitize other string fields
$gender = strip_tags($intake['gender'] ?? '');
$address = strip_tags($intake['address'] ?? ($intake['presentAddress'] ?? ''));
$contactNumber = strip_tags($intake['contactNumber'] ?? '');
$offense = strip_tags($intake['offense'] ?? '');
$offenseLocation = strip_tags($intake['offenseLocation'] ?? '');
$primaryGuardian = strip_tags($intake['primaryGuardian'] ?? '');

try {
    $pdo->beginTransaction();

    if ($existingNumericId) {
        // 1. Update Existing Case
        $stmtCase = $pdo->prepare("
            UPDATE cases SET
                first_name = :first_name,
                last_name = :last_name,
                alias = :alias,
                date_of_birth = :date_of_birth,
                place_of_birth = :place_of_birth,
                highest_education = :highest_education,
                birth_status = :birth_status,
                disability = :disability,
                present_address = :present_address,
                permanent_address = :permanent_address,
                age_at_offense = :age_at_offense,
                age = :age,
                gender = :gender,
                address = :address,
                contact_number = :contact_number,
                offense = :offense,
                offense_date = :offense_date,
                offense_location = :offense_location,
                primary_guardian = :primary_guardian,
                status = :status
            WHERE id = :id
        ");

        $stmtCase->execute([
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':alias' => strip_tags($intake['alias'] ?? ''),
            ':date_of_birth' => $dateOfBirth,
            ':place_of_birth' => strip_tags($intake['placeOfBirth'] ?? ''),
            ':highest_education' => strip_tags($intake['highestEducation'] ?? ''),
            ':birth_status' => strip_tags($intake['birthStatus'] ?? ''),
            ':disability' => strip_tags($intake['disability'] ?? ''),
            ':present_address' => strip_tags($intake['presentAddress'] ?? ''),
            ':permanent_address' => strip_tags($intake['permanentAddress'] ?? ''),
            ':age_at_offense' => $computedAgeAtOffense,
            ':age' => $computedCurrentAge,
            ':gender' => $gender,
            ':address' => $address,
            ':contact_number' => $contactNumber,
            ':offense' => $offense,
            ':offense_date' => $offenseDate,
            ':offense_location' => $offenseLocation,
            ':primary_guardian' => $primaryGuardian,
            ':status' => $caseStatus,
            ':id' => $existingNumericId
        ]);

        $caseId = $existingNumericId;

        // Clean up prior family members and assessments if re-saving
        $pdo->prepare("DELETE FROM family_members WHERE case_id = ?")->execute([$caseId]);
        $pdo->prepare("DELETE FROM assessments WHERE case_id = ?")->execute([$caseId]);
        $pdo->prepare("DELETE FROM assessment_answers WHERE case_id = ?")->execute([$caseId]);
    } else {
        // 1. Insert New Case
        $stmtCase = $pdo->prepare("
            INSERT INTO cases (first_name, last_name, alias, date_of_birth, place_of_birth, highest_education, birth_status, disability, present_address, permanent_address, age_at_offense, age, gender, address, contact_number, offense, offense_date, offense_location, primary_guardian, status)
            VALUES (:first_name, :last_name, :alias, :date_of_birth, :place_of_birth, :highest_education, :birth_status, :disability, :present_address, :permanent_address, :age_at_offense, :age, :gender, :address, :contact_number, :offense, :offense_date, :offense_location, :primary_guardian, :status)
        ");

        $stmtCase->execute([
            ':first_name' => $firstName,
            ':last_name' => $lastName,
            ':alias' => strip_tags($intake['alias'] ?? ''),
            ':date_of_birth' => $dateOfBirth,
            ':place_of_birth' => strip_tags($intake['placeOfBirth'] ?? ''),
            ':highest_education' => strip_tags($intake['highestEducation'] ?? ''),
            ':birth_status' => strip_tags($intake['birthStatus'] ?? ''),
            ':disability' => strip_tags($intake['disability'] ?? ''),
            ':present_address' => strip_tags($intake['presentAddress'] ?? ''),
            ':permanent_address' => strip_tags($intake['permanentAddress'] ?? ''),
            ':age_at_offense' => $computedAgeAtOffense,
            ':age' => $computedCurrentAge,
            ':gender' => $gender,
            ':address' => $address,
            ':contact_number' => $contactNumber,
            ':offense' => $offense,
            ':offense_date' => $offenseDate,
            ':offense_location' => $offenseLocation,
            ':primary_guardian' => $primaryGuardian,
            ':status' => $caseStatus
        ]);

        $caseId = $pdo->lastInsertId();
    }

    // 2. Insert Family Members
    if (isset($intake['familyMembers']) && is_array($intake['familyMembers'])) {
        $stmtFamily = $pdo->prepare("
            INSERT INTO family_members (case_id, name, relationship, age, occupation)
            VALUES (:case_id, :name, :relationship, :age, :occupation)
        ");

        foreach ($intake['familyMembers'] as $member) {
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

    // 3. Insert Assessment Scores (if assessment data was submitted)
    if ($assessment !== null) {
        // For 15 and below, discernment scores (lmd, ivj) are 0 / not applicable
        $lmdScoreToSave = ($computedAgeAtOffense <= 15) ? 0 : ($assessment['lmdScore'] ?? 0);
        $ivjScoreToSave = ($computedAgeAtOffense <= 15) ? 0 : ($assessment['ivjScore'] ?? 0);

        $stmtAssessment = $pdo->prepare("
            INSERT INTO assessments (case_id, lmd, risk_index, ivj, ffc, cfc)
            VALUES (:case_id, :lmd, :risk_index, :ivj, :ffc, :cfc)
        ");

        $stmtAssessment->execute([
            ':case_id' => $caseId,
            ':lmd' => $lmdScoreToSave,
            ':risk_index' => $assessment['riskIndex'] ?? 0,
            ':ivj' => $ivjScoreToSave,
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
    }

    // 5. Audit Logging for Statutory Exemption (age <= 15)
    if ($computedAgeAtOffense <= 15) {
        $exemptionDetails = json_encode([
            'rule_triggered' => 'STATUTORY_EXEMPTION_APPLIED',
            'case_id' => $caseId,
            'age_at_offense' => $computedAgeAtOffense,
            'current_age' => $computedCurrentAge,
            'date_of_birth' => $dateOfBirth,
            'date_of_offense' => $offenseDate,
            'status' => 'Not applicable - below minimum age of criminal responsibility',
            'legal_basis' => 'Section 6 of RA 9344, as amended by RA 10630 (Exemption from criminal liability); Section 20 (Referral to intervention program)'
        ], JSON_UNESCAPED_SLASHES);

        $stmtAudit = $pdo->prepare("INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, 'STATUTORY_EXEMPTION_APPLIED', 'cases', ?, ?, ?)");
        $stmtAudit->execute([$userId, $userName, $caseId, $exemptionDetails, $ipAddress]);
    }

    $pdo->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Case saved successfully',
        'case_id' => $caseId,
        'age_at_offense' => $computedAgeAtOffense,
        'status' => $caseStatus
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