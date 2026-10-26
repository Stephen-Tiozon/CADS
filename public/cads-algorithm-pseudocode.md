# CADS: Rule-Based Assessment Scoring and Interpretation Algorithm
## Chapter 3 Thesis Specification & Pseudocode Reference

**System:** Computerized Assessment of Discernment System (CADS)  
**Governing Framework:** Republic Act 9344 (Juvenile Justice & Welfare Act) & RA 10173 (Data Privacy Act)  
**Target Manuscript Section:** Chapter 3 — Methodology / System Design (Algorithm Specification)  
**Corresponding Flowchart:** *Figure X. Flowchart of the rule-based assessment scoring and interpretation algorithm of CADS*

---

### Formal Algorithm Specification (Manuscript Format)

```text
====================================================================================================
ALGORITHM 1: Rule-Based Assessment Scoring and Clinical Interpretation
====================================================================================================
INPUT:
    - Case Metadata: C = (case_id, cicl_first_name, cicl_last_name, dob, offense_details)
    - Assessor Session: U_assessor = (user_id, role, full_name, session_token)
    - LMD Raw Scores: S_LMD_raw = { s_1, s_2, ..., s_14 }, where s_i ∈ {1, 2, 3, 4, 5, 6}
    - LMD Dilemma Text & Reasoning: R_LMD = { (dilemma_id, response_text, reasoning_text) }
    - IVJ Binary Keyed Responses: R_IVJ_raw = { c_1, c_2, ..., c_54 }, where c_j ∈ {0, 1}
    - CFC Observational Items: Items_CFC = { (score_k, is_applicable_k) }, for k = 1 to 35
    - FFC Observational Items: Items_FFC = { (score_m, is_applicable_m) }, for m = 1 to 28

OUTPUT:
    - Validated Assessment Record: A_persisted = (assessment_id, scores, classifications, metadata)
    - Child Assessment Answer Records: Answers_persisted in database
    - Immutable Audit Log Entry: Audit_entry in audit_logs
    - Initial Assessment Report / Social Case Study PDF Document

----------------------------------------------------------------------------------------------------
EXECUTION FLOW:
----------------------------------------------------------------------------------------------------

1.  // Step 1: Start Assessment Session
    INITIATE session for U_assessor;
    VERIFY U_assessor.role ∈ {"Social Worker", "Administrator"};
    IF session_is_invalid THEN
        ABORT with "Authentication Required";
    END IF

2.  // Step 2: Record or Retrieve CICL Case Information
    IF case_exists(C.case_id) THEN
        Case_Profile ← RETRIEVE_CASE_BY_ID(C.case_id);
    ELSE
        Case_Profile ← CREATE_NEW_CICL_INTAKE(C);
    END IF

3.  // Step 3 & 4: Instrument Data Entry and Validation Loop
    REPEAT
        DISPLAY Assessment_Entry_Form(Case_Profile);
        ACQUIRE S_LMD_raw, R_LMD, R_IVJ_raw, Items_CFC, Items_FFC;
        
        isValid ← TRUE;
        errors ← EMPTY_LIST();
        
        // Validation Checks:
        IF COUNT(S_LMD_raw) ≠ 14 OR ANY(s_i < 1 OR s_i > 6 FOR s_i IN S_LMD_raw) THEN
            isValid ← FALSE;
            APPEND "All 14 LMD dilemmas must have stage scores between 1 and 6" TO errors;
        END IF
        
        IF COUNT(R_IVJ_raw) ≠ 54 OR ANY(c_j ∉ {0, 1} FOR c_j IN R_IVJ_raw) THEN
            isValid ← FALSE;
            APPEND "All 54 IVJ items must be completed with binary values (0 or 1)" TO errors;
        END IF
        
        IF NOT isValid THEN
            DISPLAY validation_errors(errors);
        END IF
    UNTIL isValid IS TRUE;

4.  // Step 5: Compute LMD Moral Development Score
    // Calculate raw arithmetic mean across all 14 Kohlberg moral dilemmas:
    M_LMD ← (1 / 14) * SUM(S_LMD_raw);    // Range: [1.00, 6.00]
    
    // Map dilemma mean to standardized scaled score S_LMD ∈ {1, 2, 3, 4, 5, 6}:
    IF M_LMD ≥ 5.51 THEN
        S_LMD ← 6;  LMD_Interp ← "Post-conventional Stage (Universal Principles)";
    ELSE IF M_LMD ≥ 4.51 THEN
        S_LMD ← 5;  LMD_Interp ← "Post-conventional Stage (Social Contract)";
    ELSE IF M_LMD ≥ 3.51 THEN
        S_LMD ← 4;  LMD_Interp ← "Conventional Stage (Law and Order)";
    ELSE IF M_LMD ≥ 2.51 THEN
        S_LMD ← 3;  LMD_Interp ← "Conventional Stage (Interpersonal Accord)";
    ELSE IF M_LMD ≥ 1.51 THEN
        S_LMD ← 2;  LMD_Interp ← "Pre-conventional Stage (Instrumental Relativist)";
    ELSE
        S_LMD ← 1;  LMD_Interp ← "Pre-conventional Stage (Punishment & Obedience)";
    END IF

5.  // Step 6: Compute IVJ Value Judgment Score
    // Evaluate binary items against standardized key to determine correct count:
    R_IVJ ← SUM(c_j FOR c_j IN R_IVJ_raw);   // Range: [0, 54 items]
    
    // Map raw count to standardized scaled score S_IVJ ∈ {1, 2, 3, 4, 5, 6} via interval brackets:
    IF R_IVJ ≥ 46 THEN
        S_IVJ ← 6;  IVJ_Interp ← "Superior Value Judgment";
    ELSE IF R_IVJ ≥ 37 THEN
        S_IVJ ← 5;  IVJ_Interp ← "Above Average Value Judgment";
    ELSE IF R_IVJ ≥ 28 THEN
        S_IVJ ← 4;  IVJ_Interp ← "Average Value Judgment";
    ELSE IF R_IVJ ≥ 19 THEN
        S_IVJ ← 3;  IVJ_Interp ← "Below Average Value Judgment";
    ELSE IF R_IVJ ≥ 10 THEN
        S_IVJ ← 2;  IVJ_Interp ← "Poor Value Judgment";
    ELSE
        S_IVJ ← 1;  IVJ_Interp ← "Very Poor Value Judgment";
    END IF

6.  // Step 7: Compute Combined Discernment Result
    // Compute combined arithmetic mean from standardized scaled metrics:
    D ← (S_LMD + S_IVJ) / 2.0;    // Range: [1.00, 6.00]
    
    // Determine qualitative clinical discernment interpretation:
    IF D ≥ 5.51 THEN
        Discernment_Level ← "Superior Discernment Level";
    ELSE IF D ≥ 4.51 THEN
        Discernment_Level ← "Above Average Discernment Level";
    ELSE IF D ≥ 3.51 THEN
        Discernment_Level ← "Average Discernment Level";
    ELSE IF D ≥ 2.51 THEN
        Discernment_Level ← "Below Average Discernment Level";
    ELSE IF D ≥ 1.51 THEN
        Discernment_Level ← "Poor Discernment Level";
    ELSE
        Discernment_Level ← "Very Poor Discernment Level";
    END IF
    // NOTE: Discernment_Level is a clinical decision aid for Social Worker review,
    //       strictly never an automated statutory/legal adjudication.

7.  // Step 8: Compute Independent Functioning Checklist Scores (Guarded against division-by-zero)
    // Child Functioning Checklist (CFC - 35 items):
    n_app_cfc ← COUNT(item IN Items_CFC WHERE item.is_applicable IS TRUE);
    IF n_app_cfc > 0 THEN
        sum_scores_cfc ← SUM(item.score_k FOR item IN Items_CFC WHERE item.is_applicable IS TRUE);
        M_CFC ← sum_scores_cfc / n_app_cfc;
        CFC_Interp ← CLASSIFY_CHILD_FUNCTIONING(M_CFC);
    ELSE
        M_CFC ← NULL;
        CFC_Interp ← "N/A (No Applicable Items)";
    END IF

    // Family Functioning Checklist (FFC - 28 items):
    n_app_ffc ← COUNT(item IN Items_FFC WHERE item.is_applicable IS TRUE);
    IF n_app_ffc > 0 THEN
        sum_scores_ffc ← SUM(item.score_m FOR item IN Items_FFC WHERE item.is_applicable IS TRUE);
        M_FFC ← sum_scores_ffc / n_app_ffc;
        FFC_Interp ← CLASSIFY_FAMILY_FUNCTIONING(M_FFC);
    ELSE
        M_FFC ← NULL;
        FFC_Interp ← "N/A (No Applicable Items)";
    END IF
    // NOTE: CFC and FFC results are evaluated and stored independently.
    //       They are NEVER combined into a composite risk index (CRI).

8.  // Step 9 & 10: Social Worker Review, Adjustment, and Approval Loop
    REPEAT
        // Display computed scores, mathematical breakdowns, and clinical interpretations
        DISPLAY Scoring_Review_Screen(
            M_LMD, S_LMD, LMD_Interp,
            R_IVJ, S_IVJ, IVJ_Interp,
            D, Discernment_Level,
            M_CFC, CFC_Interp,
            M_FFC, FFC_Interp
        );
        
        // Assessor inputs qualitative notes and observation findings
        Clinical_Notes ← ACQUIRE_ASSESSOR_NOTES();
        Review_Decision ← PROMPT_FOR_ASSESSOR_APPROVAL();
        
        IF Review_Decision == "REVISE" THEN
            // Social worker adjusts dilemma scores or notes; re-execute scoring from Step 5
            ACQUIRE_UPDATED_SCORES(S_LMD_raw, R_IVJ_raw, Items_CFC, Items_FFC);
            RECOMPUTE_SCORES();
        END IF
    UNTIL Review_Decision == "APPROVED";

9.  // Step 10b: Persist Records and Generate Reports
    START_DATABASE_TRANSACTION();
    
    // Insert assessment summary record:
    assessment_id ← DB_EXECUTE(
        "INSERT INTO assessments (
            case_id, assessor_id, assessment_date, status,
            lmd_raw_sum, lmd_item_count, lmd_mean_score, lmd_scaled_score, lmd_interpretation,
            ivj_raw_score, ivj_total_items, ivj_scaled_score, ivj_interpretation,
            discernment_combined_score, discernment_classification,
            cfc_raw_sum, cfc_applicable_count, cfc_mean_score, cfc_interpretation,
            ffc_raw_sum, ffc_applicable_count, ffc_mean_score, ffc_interpretation,
            clinical_notes, reviewed_by_id, reviewed_at, created_at
        ) VALUES (?, ?, NOW(), 'Completed', ?, 14, ?, ?, ?, ?, 54, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [ C.case_id, U_assessor.user_id, SUM(S_LMD_raw), M_LMD, S_LMD, LMD_Interp,
          R_IVJ, S_IVJ, IVJ_Interp, D, Discernment_Level,
          sum_scores_cfc, n_app_cfc, M_CFC, CFC_Interp,
          sum_scores_ffc, n_app_ffc, M_FFC, FFC_Interp,
          Clinical_Notes, U_assessor.user_id ]
    );
    
    // Insert itemized responses:
    FOR EACH item IN ALL_RESPONSES(R_LMD, S_LMD_raw, R_IVJ_raw, Items_CFC, Items_FFC) DO
        DB_EXECUTE(
            "INSERT INTO assessment_answers (
                assessment_id, instrument_type, item_number, dilemma_id,
                response_text, reasoning_explanation, assigned_stage_score,
                is_correct, is_applicable
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [ assessment_id, item.instrument, item.number, item.dilemma_id,
              item.response, item.reasoning, item.score, item.correct, item.applicable ]
        );
    END FOR;
    
    // Log immutable audit entry:
    DB_EXECUTE(
        "INSERT INTO audit_logs (user_id, action, module, record_id, details, ip_address, created_at)
         VALUES (?, 'COMPLETE_ASSESSMENT', 'assessments', ?, ?, ?, NOW())",
        [ U_assessor.user_id, assessment_id, "Completed discernment assessment session", CLIENT_IP() ]
    );
    
    COMMIT_TRANSACTION();
    
    // Generate official Social Case Study Report PDF using dynamic authenticated credentials
    Report_PDF ← GENERATE_PDF_REPORT(assessment_id, U_assessor.full_name, U_assessor.role);

10. // Step 11: End Assessment Session
    RETURN Report_PDF, A_persisted;
====================================================================================================
```

---

### Key Alignments with Panel / Advisor Feedback

1. **Strict 11-Step Sequence:** The pseudocode mirrors each step of the required execution flow:
   - Steps 1–2: Start and case demographic retrieval
   - Steps 3–4: Instrument data entry with explicit boundary and type validation loop
   - Steps 5–7: Separate LMD and IVJ scaling, followed by Combined Discernment mean ($D$)
   - Step 8: Independent CFC and FFC weighted calculations with division-by-zero guards
   - Step 9–10: Social Worker review screen, clinical qualitative notes, and revision/recompute loop
   - Step 10b: Relational database transaction (MySQL via PDO Prepared Statements) and PDF generation
   - Step 11: Terminate assessment processing and archive record
2. **Standardization Prior to Combination:** Raw dilemma means ($M_{\mathrm{LMD}}$) and raw correct items ($R_{\mathrm{IVJ}}$) are mapped to standardized scales ($S_{\mathrm{LMD}}, S_{\mathrm{IVJ}} \in [1, 6]$) before calculating $D = (S_{\mathrm{LMD}} + S_{\mathrm{IVJ}}) / 2$.
3. **No Automated Statutory/Legal Determinations:** The output is an *instrument-based clinical discernment interpretation* ($Q(D)$) for the social worker's professional case analysis. It strictly omits statutory court determinations (*"Acted with/without discernment"*), age exemption cutoffs, and court referral mandates.
4. **Independent Checklists (No Composite Risk Index):** CFC and FFC are computed independently. All references to $CRI = R_{\mathrm{CFC}} + R_{\mathrm{FFC}}$ or $CRI \ge 15$ triage have been completely removed.
5. **Division-by-Zero Safeguard:** If applicable checklist items equal zero ($n_{\mathrm{app}} = 0$), the mean is safely set to `NULL` / `N/A`.
6. **Data Privacy & Dynamic Signatories:** In compliance with RA 10173 and RA 9344, no sensitive child data is stored in unencrypted browser LocalStorage. Signatories dynamically fetch authenticated credentials from the active session.

