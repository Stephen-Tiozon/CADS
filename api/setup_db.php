<?php

require_once 'db.php';

try {
    // Alter assessment_answers to add recommended_intervention if it doesn't exist
    try {
        $pdo->exec("ALTER TABLE assessment_answers ADD COLUMN recommended_intervention VARCHAR(255) NULL AFTER score_weight");
        echo "Column 'recommended_intervention' added to 'assessment_answers'.\n";
    } catch (PDOException $e) {
        // Ignore if exists
    }
    
    // Create 'cases' table
    $sql_cases = "
        CREATE TABLE IF NOT EXISTS cases (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            age INT,
            gender VARCHAR(20),
            address TEXT,
            contact_number VARCHAR(50),
            offense VARCHAR(255),
            offense_date DATE,
            offense_location VARCHAR(255),
            primary_guardian VARCHAR(255),
            social_worker_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_cases);
    echo "Table 'cases' created successfully.\n";

    // Ensure social_worker_id exists in cases (if we're running this on an existing DB)
    try {
        $pdo->exec("ALTER TABLE cases ADD COLUMN social_worker_id INT NULL AFTER primary_guardian");
        echo "Column 'social_worker_id' added to 'cases'.\n";
    } catch (PDOException $e) {
        // Column likely already exists, ignore
    }

    try {
        $pdo->exec("ALTER TABLE cases ADD COLUMN is_archived TINYINT(1) DEFAULT 0 AFTER social_worker_id");
        echo "Column 'is_archived' added to 'cases'.\n";
    } catch (PDOException $e) {
        // Column likely already exists, ignore
    }

    try {
        $pdo->exec("ALTER TABLE cases ADD COLUMN alias VARCHAR(100) NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN date_of_birth DATE NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN place_of_birth VARCHAR(255) NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN highest_education VARCHAR(100) NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN birth_status VARCHAR(50) NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN disability VARCHAR(255) NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN present_address TEXT NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN permanent_address TEXT NULL");
        $pdo->exec("ALTER TABLE cases ADD COLUMN age_at_offense INT NULL");
        echo "New client information columns added to 'cases'.\n";
    } catch (PDOException $e) {
        // Columns likely already exist, ignore
    }

    // Create 'family_members' table
    $sql_family = "
        CREATE TABLE IF NOT EXISTS family_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT NOT NULL,
            name VARCHAR(150),
            relationship VARCHAR(50),
            age INT,
            occupation VARCHAR(100),
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_family);
    echo "Table 'family_members' created successfully.\n";

    // Create 'assessments' table
    $sql_assessments = "
        CREATE TABLE IF NOT EXISTS assessments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT NOT NULL,
            lmd DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            risk_index DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            ivj INT NOT NULL DEFAULT 0,
            ffc DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            cfc DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_assessments);
    echo "Table 'assessments' created successfully.\n";

    // Migrate existing assessments table columns to decimal if needed
    try {
        $pdo->exec("ALTER TABLE assessments MODIFY COLUMN lmd DECIMAL(5,2) NOT NULL DEFAULT 0.00");
        $pdo->exec("ALTER TABLE assessments MODIFY COLUMN risk_index DECIMAL(5,2) NOT NULL DEFAULT 0.00");
        $pdo->exec("ALTER TABLE assessments MODIFY COLUMN ffc DECIMAL(5,2) NOT NULL DEFAULT 0.00");
        $pdo->exec("ALTER TABLE assessments MODIFY COLUMN cfc DECIMAL(5,2) NOT NULL DEFAULT 0.00");

        // Clean up / normalize legacy assessment data to strictly match DSWD ranges:
        // 1. If LMD was stored as sum of 14 dilemmas (14 to 84), divide by 14
        $pdo->exec("UPDATE assessments SET lmd = ROUND(lmd / 14, 2) WHERE lmd > 6.00 AND lmd <= 84");
        // 2. If LMD is still > 6.00 (e.g. old 0-100 percentage scale), normalize to 1.00-6.00
        $pdo->exec("UPDATE assessments SET lmd = ROUND(GREATEST(1.00, LEAST(6.00, (lmd / 100 * 5) + 1)), 2) WHERE lmd > 6.00");
        // 3. If CFC was stored as sum of checklist items (> 4.00), normalize using Option 1 (Functioning = 5.00 - Mean Risk)
        $pdo->exec("UPDATE assessments SET cfc = ROUND(GREATEST(1.00, LEAST(4.00, 5.00 - (cfc / 8))), 2) WHERE cfc > 4.00");
        // 4. If FFC was stored as sum of checklist items (> 4.00), normalize using Option 1 (Functioning = 5.00 - Mean Risk)
        $pdo->exec("UPDATE assessments SET ffc = ROUND(GREATEST(1.00, LEAST(4.00, 5.00 - (ffc / 8))), 2) WHERE ffc > 4.00");
        // 5. Ensure IVJ does not exceed 54
        $pdo->exec("UPDATE assessments SET ivj = 54 WHERE ivj > 54");
    } catch (PDOException $e) {}

    // Create 'users' table
    $sql_users = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            email VARCHAR(150),
            role VARCHAR(50) DEFAULT 'social_worker',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_users);
    echo "Table 'users' created successfully.\n";

    // Ensure email and session columns exist (if running on an existing DB)
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN email VARCHAR(150) NULL AFTER full_name");
        echo "Column 'email' added to 'users'.\n";
    } catch (PDOException $e) {}

    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN session_token VARCHAR(128) NULL DEFAULT NULL");
        $pdo->exec("ALTER TABLE users ADD COLUMN session_last_active TIMESTAMP NULL DEFAULT NULL");
        echo "Session columns added to 'users'.\n";
    } catch (PDOException $e) {}

    // Add foreign key constraint to 'cases' now that 'users' exists (safely)
    $sql_cases_fk = "
        ALTER TABLE cases 
        ADD CONSTRAINT fk_social_worker 
        FOREIGN KEY IF NOT EXISTS (social_worker_id) REFERENCES users(id) ON DELETE SET NULL;
    ";
    try {
        $pdo->exec($sql_cases_fk);
        echo "Foreign key added to 'cases' table.\n";
    } catch (PDOException $e) {
        // Ignore if constraint already exists
    }

    // Create 'disposition_plans' table
    $sql_disposition = "
        CREATE TABLE IF NOT EXISTS disposition_plans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT NOT NULL,
            disposition_type VARCHAR(100) NOT NULL,
            description TEXT,
            start_date DATE,
            end_date DATE,
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_disposition);
    echo "Table 'disposition_plans' created successfully.\n";

    try {
        $pdo->exec("ALTER TABLE disposition_plans ADD COLUMN created_by INT NULL AFTER status");
        echo "Column 'created_by' added to 'disposition_plans'.\n";
    } catch (PDOException $e) {
        // Ignore if exists
    }
    
    try {
        $pdo->exec("ALTER TABLE disposition_plans ADD CONSTRAINT fk_disposition_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL");
        echo "Foreign key added to 'disposition_plans'.\n";
    } catch (PDOException $e) {
        // Ignore if exists
    }

    // Create 'case_notes' table
    $sql_notes = "
        CREATE TABLE IF NOT EXISTS case_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT NOT NULL,
            social_worker_id INT NOT NULL,
            note_date DATE NOT NULL,
            note_category VARCHAR(50) DEFAULT 'General Note',
            note_content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
            FOREIGN KEY (social_worker_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_notes);
    echo "Table 'case_notes' created successfully.\n";

    try {
        $pdo->exec("ALTER TABLE case_notes ADD COLUMN note_category VARCHAR(50) DEFAULT 'General Note' AFTER note_date");
        echo "Column 'note_category' added to 'case_notes'.\n";
    } catch (PDOException $e) {
        // Ignore if exists
    }

    // Create 'assessment_answers' table
    $sql_answers = "
        CREATE TABLE IF NOT EXISTS assessment_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT NOT NULL,
            question_category VARCHAR(100),
            question_text TEXT,
            selected_answer TEXT,
            score_weight INT DEFAULT 0,
            recommended_intervention VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_answers);
    echo "Table 'assessment_answers' created successfully.\n";

    // Create 'case_files' table
    $sql_files = "
        CREATE TABLE IF NOT EXISTS case_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            uploaded_by VARCHAR(100),
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_files);
    echo "Table 'case_files' created successfully.\n";

    // Create 'question_bank' table
    $sql_question_bank = "
        CREATE TABLE IF NOT EXISTS question_bank (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assessment_type VARCHAR(50) NOT NULL,
            statement TEXT NOT NULL,
            is_reverse_scored TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_question_bank);
    echo "Table 'question_bank' created successfully.\n";

    // Create 'lmd_question_bank' table
    $sql_lmd_question_bank = "
        CREATE TABLE IF NOT EXISTS lmd_question_bank (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dilemma TEXT NOT NULL,
            options JSON NOT NULL,
            scores JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_lmd_question_bank);
    echo "Table 'lmd_question_bank' created successfully.\n";

    // Create 'observational_indicators' table
    $sql_obs_indicators = "
        CREATE TABLE IF NOT EXISTS observational_indicators (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(10) NOT NULL,
            category VARCHAR(100) NOT NULL,
            statement TEXT NOT NULL,
            risk_weight INT NOT NULL,
            recommended_intervention VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($sql_obs_indicators);
    echo "Table 'observational_indicators' created successfully.\n";

    // Alter observational_indicators to add recommended_intervention, is_positive, item_number if they don't exist
    try {
        $pdo->exec("ALTER TABLE observational_indicators ADD COLUMN recommended_intervention VARCHAR(255) NULL AFTER risk_weight");
        echo "Column 'recommended_intervention' added to 'observational_indicators'.\n";
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE observational_indicators ADD COLUMN is_positive TINYINT(1) NOT NULL DEFAULT 1 AFTER risk_weight");
        echo "Column 'is_positive' added to 'observational_indicators'.\n";
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE observational_indicators ADD COLUMN item_number INT NOT NULL DEFAULT 1 AFTER type");
        echo "Column 'item_number' added to 'observational_indicators'.\n";
    } catch (PDOException $e) {}

    // Seed question_bank with placeholder IVJ questions if empty
    $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM question_bank WHERE assessment_type = 'IVJ'");
    $stmtCount->execute();
    if ($stmtCount->fetchColumn() == 0) {
        $stmtInsertQ = $pdo->prepare("INSERT INTO question_bank (assessment_type, statement, is_reverse_scored) VALUES (:type, :stmt, :rev)");
        $stmtInsertQ->execute([':type' => 'IVJ', ':stmt' => 'Alam kong mali ang kumuha ng gamit na hindi akin (Theft).', ':rev' => 0]);
        $stmtInsertQ->execute([':type' => 'IVJ', ':stmt' => 'Sa tingin ko ay ayos lang manakit ng ibang tao kung sinaktan nila ako (Assault).', ':rev' => 1]);
        $stmtInsertQ->execute([':type' => 'IVJ', ':stmt' => 'Naiintindihan ko na ang paninira ng gamit ng iba ay may parusa sa batas (Property Damage).', ':rev' => 0]);
        echo "Seeded 'question_bank' with initial IVJ questions.\n";
    }

    // Create default admin user if not exists
    $stmtUser = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = 'admin'");
    $stmtUser->execute();
    if ($stmtUser->fetchColumn() == 0) {
        $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
        $stmtInsert = $pdo->prepare("
            INSERT INTO users (username, password_hash, full_name, role)
            VALUES ('admin', :password_hash, 'Maria Abad', 'admin')
        ");
        $stmtInsert->execute([':password_hash' => $passwordHash]);
        echo "Default user 'admin' created successfully.\n";
    }
    
} catch (PDOException $e) {
    die("DB Setup Failed: " . $e->getMessage() . "\n");
}

?>
