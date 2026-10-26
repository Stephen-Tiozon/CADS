<?php

require_once 'db.php';

try {
    // Ensure columns exist
    try {
        $pdo->exec("ALTER TABLE observational_indicators ADD COLUMN recommended_intervention VARCHAR(255) NULL AFTER risk_weight");
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE observational_indicators ADD COLUMN is_positive TINYINT(1) NOT NULL DEFAULT 1 AFTER risk_weight");
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE observational_indicators ADD COLUMN item_number INT NOT NULL DEFAULT 1 AFTER type");
    } catch (PDOException $e) {}

    // Clear existing data to avoid duplicates
    $pdo->exec("TRUNCATE TABLE observational_indicators");

    $stmt = $pdo->prepare("INSERT INTO observational_indicators (type, item_number, category, statement, risk_weight, is_positive, recommended_intervention) VALUES (:type, :item_number, :category, :statement, :risk_weight, :is_positive, :recommended_intervention)");

    $data = [
        // ==========================================
        // CFC (Child Functioning Checklist) - 35 Items (DSWD Annex VII & VIII)
        // ==========================================
        // Educational / Cognitive (Items 1 - 12)
        ['CFC', 1, 'Educational / Cognitive', 'Has positive attitude towards school', 3, 1, 'Alternative Learning System (ALS) or Educational Support'],
        ['CFC', 2, 'Educational / Cognitive', 'Finds schoolwork demanding', 2, 0, 'Tutorial & Academic Remediation Program'],
        ['CFC', 3, 'Educational / Cognitive', 'Wants to go back to school', 3, 1, 'School Re-enrollment & Educational Assistance'],
        ['CFC', 4, 'Educational / Cognitive', 'Is ashamed to go back to school', 2, 0, 'Psychosocial Support & Peer Acceptance Counseling'],
        ['CFC', 5, 'Educational / Cognitive', 'Is willing to learn', 3, 1, 'Skills Training & Vocational Workshop'],
        ['CFC', 6, 'Educational / Cognitive', 'Is highly competitive', 3, 1, 'Constructive Youth Leadership & Sports Development'],
        ['CFC', 7, 'Educational / Cognitive', 'Is knowledgeable about many topics', 3, 1, 'Enrichment Activities & Mentorship'],
        ['CFC', 8, 'Educational / Cognitive', 'Asks pertinent questions', 3, 1, 'Cognitive Stimulation & Creative Expression'],
        ['CFC', 9, 'Educational / Cognitive', 'Answers questions willingly', 3, 1, 'Social Skills Enhancement Program'],
        ['CFC', 10, 'Educational / Cognitive', 'Makes alibis or excuses', 2, 0, 'Values Formation & Accountability Module'],
        ['CFC', 11, 'Educational / Cognitive', 'Remembers many events of childhood', 3, 1, 'Life Story Work & Narrative Therapy'],
        ['CFC', 12, 'Educational / Cognitive', 'Is aware of the negative effects of prohibited drugs', 4, 1, 'Substance Abuse Awareness & Youth Advocacy'],

        // Psychological / Emotional (Items 13 - 20)
        ['CFC', 13, 'Psychological / Emotional', 'Is full of energy', 3, 1, 'Structured Recreation & Physical Activities'],
        ['CFC', 14, 'Psychological / Emotional', 'Finds hope in living', 4, 1, 'Strengths-Based Counseling & Goal Setting'],
        ['CFC', 15, 'Psychological / Emotional', 'Maintains good relationships with family and friends', 4, 1, 'Family & Peer Bonding Activities'],
        ['CFC', 16, 'Psychological / Emotional', 'Often chooses to be alone', 2, 0, 'Social Reintegration & Group Therapy'],
        ['CFC', 17, 'Psychological / Emotional', 'Demonstrates low tolerance', 1, 0, 'Frustration Tolerance & Anger Management Program'],
        ['CFC', 18, 'Psychological / Emotional', 'Is a run-away from home', 1, 0, 'Family Reconciliation & Safe Shelter Assistance'],
        ['CFC', 19, 'Psychological / Emotional', 'Is daring and is a risk taker', 1, 0, 'Impulse Control & Risk Awareness Training'],
        ['CFC', 20, 'Psychological / Emotional', 'Is easily provoked to fight', 1, 0, 'Conflict Resolution & De-escalation Training'],

        // Behavioral / Social / Spiritual (Items 21 - 35)
        ['CFC', 21, 'Behavioral / Social / Spiritual', 'Participates in religious activities', 3, 1, 'Spiritual Enrichment & Faith-Based Mentorship'],
        ['CFC', 22, 'Behavioral / Social / Spiritual', 'Experiments with drugs and volatile substances', 1, 0, 'Substance Abuse Early Intervention & Counseling'],
        ['CFC', 23, 'Behavioral / Social / Spiritual', 'Finds prohibited drugs exciting', 1, 0, 'Intensive Drug Rehabilitation Referral'],
        ['CFC', 24, 'Behavioral / Social / Spiritual', 'Gets drunk so often', 1, 0, 'Alcohol Cessation & Youth Counseling'],
        ['CFC', 25, 'Behavioral / Social / Spiritual', 'Spends money in gambling', 1, 0, 'Financial Literacy & Anti-Gambling Guidance'],
        ['CFC', 26, 'Behavioral / Social / Spiritual', 'Has previous police/barangay record', 1, 0, 'Restorative Justice & Barangay Diversion Monitoring'],
        ['CFC', 27, 'Behavioral / Social / Spiritual', 'Gets away freely from violations', 1, 0, 'Legal Literacy & Consequence Awareness Training'],
        ['CFC', 28, 'Behavioral / Social / Spiritual', 'Is involved in gangs or fraternities', 1, 0, 'Anti-Gang Disengagement & Positive Peer Network'],
        ['CFC', 29, 'Behavioral / Social / Spiritual', 'Is in and out of detention', 1, 0, 'Intensive Case Management & Aftercare Program'],
        ['CFC', 30, 'Behavioral / Social / Spiritual', 'Has access to obscene materials', 2, 0, 'Digital Literacy & Media Safety Counseling'],
        ['CFC', 31, 'Behavioral / Social / Spiritual', 'Enjoys sex-oriented movies/films', 2, 0, 'Adolescent Sexual & Reproductive Health Education'],
        ['CFC', 32, 'Behavioral / Social / Spiritual', 'Spends money to watch x-rated movies/films', 2, 0, 'Values Formation & Healthy Media Consumption'],
        ['CFC', 33, 'Behavioral / Social / Spiritual', 'Shows remorse/regret', 4, 1, 'Restorative Dialogue & Empathy Development'],
        ['CFC', 34, 'Behavioral / Social / Spiritual', 'Wants to work hard to earn money', 4, 1, 'Livelihood Readiness & Career Guidance'],
        ['CFC', 35, 'Behavioral / Social / Spiritual', 'Wants to work to help parents/family', 4, 1, 'Youth Employment Facilitation & Family Support'],

        // ==========================================
        // FFC (Family Functioning Checklist) - 28 Items (DSWD Annex IX & X)
        // ==========================================
        // Factor 1: Positive Family Relationships (Items 1 - 10)
        ['FFC', 1, 'Positive Family Relationships', 'Child\'s parents are hardworking', 3, 1, 'Livelihood & Employment Assistance'],
        ['FFC', 2, 'Positive Family Relationships', 'Family head has a decent work occupation', 1, 1, 'Skills Training & Decent Work Linkage'],
        ['FFC', 3, 'Positive Family Relationships', 'Family lives in a quiet, wholesome neighborhood', 2, 1, 'Community Safety & Clean Neighborhood Network'],
        ['FFC', 4, 'Positive Family Relationships', 'Parents value their children', 3, 1, 'Parent-Child Bonding Enhancement Activities'],
        ['FFC', 5, 'Positive Family Relationships', 'Parents try their best to provide pleasant home atmosphere', 1, 1, 'Home Management & Positive Parenting Guidance'],
        ['FFC', 6, 'Positive Family Relationships', 'Parents maintain order in the family', 2, 1, 'Family Structure & Positive Discipline Seminar'],
        ['FFC', 7, 'Positive Family Relationships', 'Family enjoys regular meals daily', 4, 1, 'Nutritional Support & Food Security Program'],
        ['FFC', 8, 'Positive Family Relationships', 'Family encourages child to make decisions', 1, 1, 'Youth Empowerment & Democratic Family Parenting'],
        ['FFC', 9, 'Positive Family Relationships', 'Parents have realistic expectations of their children', 2, 1, 'Parental Expectation & Communication Workshop'],
        ['FFC', 10, 'Positive Family Relationships', 'Parents are consistent in their dealings with their children', 3, 1, 'Consistent Parenting Effectiveness Seminar (PES)'],

        // Factor 2: Negative Family Relationships (Items 11 - 23)
        ['FFC', 11, 'Negative Family Relationships', 'Parents are often in conflict with one another', 1, 0, 'Marital Counseling & Conflict Mediation'],
        ['FFC', 12, 'Negative Family Relationships', 'Parents are disappointed with each other', 3, 0, 'Couples Therapy & Relationship Enrichment'],
        ['FFC', 13, 'Negative Family Relationships', 'Marriage is characterized by unpleasant relationships', 4, 0, 'Intensive Family Systems Therapy'],
        ['FFC', 14, 'Negative Family Relationships', 'Child is often caught between the conflicts of the parents', 1, 0, 'Child-Centered Family Counseling'],
        ['FFC', 15, 'Negative Family Relationships', 'Family experiences marital conflicts', 3, 0, 'Domestic Dispute Resolution & Family Support'],
        ['FFC', 16, 'Negative Family Relationships', 'Parents often make their children their objects of hostility', 3, 0, 'Child Protection & Anti-Domestic Violence Intervention'],
        ['FFC', 17, 'Negative Family Relationships', 'Poor family conditions stimulate conflicts', 1, 0, 'Emergency Socio-Economic Assistance (AICS / 4Ps)'],
        ['FFC', 18, 'Negative Family Relationships', 'Father is a trouble maker', 3, 0, 'Male Behavioral Rehabilitation & Substance Screening'],
        ['FFC', 19, 'Negative Family Relationships', 'Child often meets frustrations in the family', 4, 0, 'Psychosocial Support & Family Re-alignment'],
        ['FFC', 20, 'Negative Family Relationships', 'Parents have little trust in each other', 2, 0, 'Trust-Building & Communication Therapy'],
        ['FFC', 21, 'Negative Family Relationships', 'Family is often in pain', 3, 0, 'Family Healing & Trauma-Informed Pastoral Care'],
        ['FFC', 22, 'Negative Family Relationships', 'Child feels left out and neglected', 3, 0, 'Parental Caregiving Seminar & Neglect Intervention'],
        ['FFC', 23, 'Negative Family Relationships', 'Child is unable to develop a good image of himself', 1, 0, 'Self-Esteem Building & Child Empowerment Program'],

        // Factor 3: Positive Coping Style (Items 24 - 28)
        ['FFC', 24, 'Positive Coping Style', 'Child is able to do things to take care of himself', 4, 1, 'Independent Living & Life Skills Training'],
        ['FFC', 25, 'Positive Coping Style', 'Child learns to adjust with the family lifestyle', 3, 1, 'Adaptive Coping & Resilience Mentorship'],
        ['FFC', 26, 'Positive Coping Style', 'Child copes well in his environment', 2, 1, 'Environmental Mastery & Positive Youth Network'],
        ['FFC', 27, 'Positive Coping Style', 'Child accepts restrictions/rules of his parents', 2, 1, 'Respect for Authority & Rule Compliance Reinforcement'],
        ['FFC', 28, 'Positive Coping Style', 'Child has a positive self-image', 2, 1, 'Youth Identity Formation & Leadership Development'],
    ];

    foreach ($data as $row) {
        $stmt->execute([
            ':type' => $row[0],
            ':item_number' => $row[1],
            ':category' => $row[2],
            ':statement' => $row[3],
            ':risk_weight' => $row[4],
            ':is_positive' => $row[5],
            ':recommended_intervention' => $row[6]
        ]);
    }

    echo "Successfully seeded " . count($data) . " observational indicators (35 CFC and 28 FFC items).\n";

} catch (Exception $e) {
    die("Error seeding database: " . $e->getMessage() . "\n");
}
?>