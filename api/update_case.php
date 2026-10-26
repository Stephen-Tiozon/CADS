<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
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

if (!$data || !isset($data['caseId']) || !isset($data['intakeData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload. Missing caseId or intakeData.']);
    exit();
}

$caseIdStr = $data['caseId'];
// The frontend sends CICL-2024-0001 format, extract numeric ID
$parts = explode('-', $caseIdStr);
$numericId = (int)end($parts);
if ($numericId === 0) {
    $numericId = (int)$caseIdStr;
}

$intake = $data['intakeData'];

try {
    $pdo->beginTransaction();

    // 1. Update Case
    $stmtCase = $pdo->prepare("
        UPDATE cases 
        SET first_name = :first_name, 
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
            primary_guardian = :primary_guardian
        WHERE id = :id
    ");
    
    $age = (isset($intake['age']) && $intake['age'] !== "") ? (int)$intake['age'] : null;
    $ageAtOffense = (isset($intake['ageAtOffense']) && $intake['ageAtOffense'] !== "") ? (int)$intake['ageAtOffense'] : null;

    $stmtCase->execute([
        ':first_name' => $intake['firstName'] ?? '',
        ':last_name' => $intake['lastName'] ?? '',
        ':alias' => $intake['alias'] ?? '',
        ':date_of_birth' => (isset($intake['dateOfBirth']) && $intake['dateOfBirth'] !== "") ? $intake['dateOfBirth'] : null,
        ':place_of_birth' => $intake['placeOfBirth'] ?? '',
        ':highest_education' => $intake['highestEducation'] ?? '',
        ':birth_status' => $intake['birthStatus'] ?? '',
        ':disability' => $intake['disability'] ?? '',
        ':present_address' => $intake['presentAddress'] ?? '',
        ':permanent_address' => $intake['permanentAddress'] ?? '',
        ':age_at_offense' => $ageAtOffense,
        ':age' => $age,
        ':gender' => $intake['gender'] ?? '',
        ':address' => $intake['address'] ?? '',
        ':contact_number' => $intake['contactNumber'] ?? '',
        ':offense' => $intake['offense'] ?? '',
        ':offense_date' => $intake['offenseDate'] ?? null,
        ':offense_location' => $intake['offenseLocation'] ?? '',
        ':primary_guardian' => $intake['primaryGuardian'] ?? '',
        ':id' => $numericId
    ]);

    // 2. Update Family Members (Delete and Re-insert)
    $stmtDeleteFamily = $pdo->prepare("DELETE FROM family_members WHERE case_id = :case_id");
    $stmtDeleteFamily->execute([':case_id' => $numericId]);

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
                ':case_id' => $numericId,
                ':name' => $member['name'],
                ':relationship' => $member['relationship'] ?? '',
                ':age' => $memberAge,
                ':occupation' => $member['occupation'] ?? ''
            ]);
        }
    }

    $pdo->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Case updated successfully'
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update case: ' . $e->getMessage()
    ]);
}
?>
