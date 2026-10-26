<?php
require_once 'db.php';

// Arrays for realistic Philippine names
$maleFirstNames = ['Juan', 'Miguel', 'Jose', 'Carlos', 'Luis', 'Ramon', 'Antonio', 'Pedro', 'Rafael', 'Emilio', 'Andres', 'Ricardo', 'Fernando', 'Vicente', 'Gabriel', 'Jomar', 'Christian', 'Michael', 'Joshua', 'Kevin'];
$femaleFirstNames = ['Maria', 'Ana', 'Carmela', 'Teresa', 'Rosa', 'Lucia', 'Isabel', 'Elena', 'Carmen', 'Clara', 'Josefina', 'Pilar', 'Cecilia', 'Rosario', 'Angela', 'Princess', 'Angelica', 'Jessica', 'Michelle', 'Sarah'];
$lastNames = ['Reyes', 'Cruz', 'Santos', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Aquino', 'Navarro', 'Torres', 'Villanueva', 'Ramos', 'Flores', 'Gonzales', 'Perez', 'Dela Cruz', 'Fernandez', 'Lopez', 'Gomez', 'Tolentino'];

$addresses = [
    '123 Rizal St., Brgy. San Antonio, Pasig City',
    '456 Mabini Ave., Brgy. Poblacion, Makati City',
    '789 Quezon Blvd., Brgy. Commonwealth, Quezon City',
    '321 Bonifacio St., Brgy. San Jose, Caloocan City',
    '654 Luna St., Brgy. San Isidro, Paranaque City',
    '987 Taft Ave., Brgy. Ermita, Manila',
    '159 Roxas Blvd., Brgy. Malate, Manila',
    '753 EDSA, Brgy. Guadalupe, Makati City',
    '852 Marcos Highway, Brgy. Mayamot, Antipolo City',
    '147 Ortigas Ave., Brgy. Wack-Wack, Mandaluyong City'
];

$offenses = [
    'Theft',
    'Petty Theft',
    'Vandalism',
    'Physical Injuries',
    'Curfew Violation',
    'Trespassing',
    'Shoplifting',
    'Malicious Mischief',
    'Simple Assault',
    'Bullying / Cyberbullying'
];

$guardians = [
    'mother', 'father', 'grandmother', 'grandfather', 'aunt', 'uncle', 'older brother', 'older sister'
];

$aliases = ['Toto', 'Nene', 'Boy', 'Dodong', 'Inday', 'Macmac', 'Junjun', 'Bong', 'Ken', 'Bebang', ''];
$placesOfBirth = ['Quezon City', 'Manila', 'Makati City', 'Pasig City', 'Cebu City', 'Davao City', 'Bulacan', 'Laguna'];
$educations = ['Elementary Level', 'Elementary Graduate', 'High School Level', 'High School Graduate', 'Out of School Youth', 'None'];
$birthStatuses = ['Legitimate', 'Illegitimate'];
$disabilities = ['None', 'None', 'None', 'None', 'Mild Autism', 'Asthma', 'ADHD'];

// Clear existing cases to reset the data
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
$pdo->exec('TRUNCATE TABLE cases');
$pdo->exec('TRUNCATE TABLE assessments');
$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

$pdo->beginTransaction();

try {
    for ($i = 0; $i < 30; $i++) {
        $isMale = rand(0, 1) == 1;
        $gender = $isMale ? 'Male' : 'Female';
        $firstName = $isMale ? $maleFirstNames[array_rand($maleFirstNames)] : $femaleFirstNames[array_rand($femaleFirstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        
        $age = rand(12, 17); // Juvenile ages
        $address = $addresses[array_rand($addresses)];
        $contactNumber = '09' . rand(10, 99) . rand(100, 999) . rand(1000, 9999);
        $offense = $offenses[array_rand($offenses)];
        
        // Random date within the last 1 year for case creation
        $createdAtTimestamp = time() - rand(0, 1 * 365 * 24 * 60 * 60);
        $createdAt = date('Y-m-d H:i:s', $createdAtTimestamp);
        
        // Offense date is between 0 to 60 days before the case was created
        $offenseTimestamp = $createdAtTimestamp - rand(0, 60 * 24 * 60 * 60);
        $offenseDate = date('Y-m-d', $offenseTimestamp);
        
        $offenseLocation = 'Public Market, ' . ['Quezon City', 'Manila', 'Makati City', 'Pasig City'][rand(0, 3)];
        
        $alias = $aliases[array_rand($aliases)];
        $dobTimestamp = $createdAtTimestamp - ($age * 365 * 24 * 60 * 60) - rand(0, 364 * 24 * 60 * 60);
        $dateOfBirth = date('Y-m-d', $dobTimestamp);
        $placeOfBirth = $placesOfBirth[array_rand($placesOfBirth)];
        $highestEducation = $educations[array_rand($educations)];
        $birthStatus = $birthStatuses[array_rand($birthStatuses)];
        $disability = $disabilities[array_rand($disabilities)];
        $presentAddress = $address;
        $permanentAddress = (rand(0, 3) == 0) ? $addresses[array_rand($addresses)] : $presentAddress; // Sometimes different
        
        $ageAtOffense = $age;
        if (($createdAtTimestamp - $offenseTimestamp) > (365 * 24 * 60 * 60)) {
            $ageAtOffense = $age - 1;
        }
        
        // Pick a random primary guardian based on relation
        $relation = $guardians[array_rand($guardians)];
        $guardianName = ($relation === 'mother' || $relation === 'grandmother' || $relation === 'aunt' || $relation === 'older sister') ? $femaleFirstNames[array_rand($femaleFirstNames)] : $maleFirstNames[array_rand($maleFirstNames)];
        $guardianFullName = $guardianName . ' ' . $lastName . ' (' . ucfirst($relation) . ')';
        
        // Insert Case
        $stmt = $pdo->prepare("
            INSERT INTO cases (first_name, last_name, alias, date_of_birth, place_of_birth, highest_education, birth_status, disability, present_address, permanent_address, age, age_at_offense, gender, address, contact_number, offense, offense_date, offense_location, primary_guardian, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $firstName, $lastName, $alias, $dateOfBirth, $placeOfBirth, $highestEducation, $birthStatus, $disability, $presentAddress, $permanentAddress, $age, $ageAtOffense, $gender, $address, $contactNumber, $offense, $offenseDate, $offenseLocation, $guardianFullName, $createdAt
        ]);
        
        $caseId = $pdo->lastInsertId();
        
        // Insert Assessments strictly following DSWD manual ranges
        $ivjScore = rand(10, 52); // Raw score out of 54
        $lmdScore = round(rand(120, 580) / 100, 2); // Mean dilemma score between 1.00 and 6.00
        $cfcScore = round(rand(120, 390) / 100, 2); // Mean checklist score between 1.00 and 4.00
        $ffcScore = round(rand(120, 390) / 100, 2); // Mean checklist score between 1.00 and 4.00
        $riskIndex = round(($cfcScore + $ffcScore) / 2, 2);
        
        $stmtAss = $pdo->prepare("
            INSERT INTO assessments (case_id, ivj, lmd, cfc, ffc, risk_index)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmtAss->execute([
            $caseId, $ivjScore, $lmdScore, $cfcScore, $ffcScore, $riskIndex
        ]);
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Successfully seeded 30 clients!']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
