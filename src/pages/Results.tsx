import { useState, useEffect } from "react"
import { useAppStore } from "../store"
import { computeAssessmentResults } from "../utils/discernment"

type Page = "login" | "dashboard" | "intake" | "assessment" | "results" | "reports" | "settings" | "case_details"

interface ResultsProps {
  onNavigate: (page: Page) => void
}

function GaugeRing({
  score,
  max,
  color,
  label,
  displayScore,
}: {
  score: number
  max: number
  color: string
  label: string
  displayScore?: string | number
}) {
  const pct = Math.min(1, Math.max(0, score / max))
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = pct * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700 transition-colors"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {displayScore !== undefined ? displayScore : score}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            /{max}
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-2 text-center">
        {label}
      </p>
    </div>
  )
}

export default function Results({ onNavigate }: ResultsProps) {
  const handlePrint = () => {
    window.print()
  }

  const [showPreview, setShowPreview] = useState(false)

  const { intakeData, assessmentData, currentCaseId, currentUser } = useAppStore()

  const clientName = intakeData.firstName
    ? `${intakeData.firstName} ${intakeData.lastName}`
    : "Unknown Client"
  const currentYear = new Date().getFullYear()
  const [caseId, setCaseId] = useState(currentCaseId || `CICL-${currentYear}-XXXX`)

  useEffect(() => {
    if (currentCaseId) {
      setCaseId(currentCaseId)
    }
  }, [currentCaseId])

  const reportDate = intakeData.createdAt
    ? new Date(intakeData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

  const assessingOfficer =
    intakeData.socialWorkerName ||
    (currentUser?.fullName
      ? `${currentUser.fullName}${currentUser.role === "social_worker" ? ", RSW" : ""}`
      : "")
  const supervisorName: string = ""
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const [narrativeFindings, setNarrativeFindings] = useState(
    assessmentData.narrativeFindings || ""
  )
  const [recommendations, setRecommendations] = useState(
    assessmentData.notes || ""
  )

  const childAge = Number(intakeData.ageAtOffense || intakeData.age || 0)

  // Mathematical computations strictly following DSWD Manual
  const computation = computeAssessmentResults({
    lmdScore: assessmentData.lmdScore,
    ivjScore: assessmentData.ivjScore,
    cfcScore: assessmentData.cfcScore,
    ffcScore: assessmentData.ffcScore,
  })

  const {
    lmdRawMean,
    lmdScaled,
    lmdLabel,
    rawIvj,
    ivjScaled,
    ivjLabel,
    combinedAverage,
    combinedAverageStr,
    discernmentLevel,
    hasDiscernment,
    cfcScore,
    cfcLabel,
    ffcScore,
    ffcLabel,
  } = {
    ...computation,
    rawIvj: computation.ivjRaw,
  }

  // Compute intervention plans
  const interventionPlans = Array.from(
    new Set(
      (assessmentData.answers || [])
        .filter((a: any) => a.recommendedIntervention)
        .map((a: any) => a.recommendedIntervention),
    ),
  ).filter(Boolean) as string[]

  const handleSaveCase = async () => {
    setIsSaving(true)
    setSaveMessage("")
    try {
      const payload = {
        intakeData,
        assessmentData: {
          ...assessmentData,
          notes: recommendations,
          narrativeFindings,
          riskIndex:
            (assessmentData.cfcScore || 0) + (assessmentData.ffcScore || 0),
        },
        userId: currentUser?.id,
        userName: currentUser?.fullName || currentUser?.username || "Social Worker",
      }

      const response = await fetch("/api/save_case.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (result.success) {
        setSaveMessage("Case saved successfully!")
        setCaseId(`CICL-${currentYear}-${result.case_id.toString().padStart(4, "0")}`)
      } else {
        setSaveMessage(result.error || "Failed to save case.")
      }
    } catch (error) {
      setSaveMessage("Network error. Could not connect to API.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors print:bg-white print:min-h-0">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .cads-printable-doc {
            aspect-ratio: auto !important;
            max-width: 100% !important;
            width: 100% !important;
            box-shadow: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-4 sticky top-0 z-20 transition-colors print:hidden">
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-900 dark:text-white text-sm">
            Assessment Results — {clientName}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {caseId} · LMD / IVJ / CFC · {reportDate}
          </p>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 print:block">
        {/* Left: Analytics */}
        <div className="border-r border-slate-200/50 dark:border-slate-700/50 p-6 lg:p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl transition-colors print:hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Assessment Summary
            </h2>
          </div>

          {/* Score Rings */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 dark:border-slate-700/50 p-6 transition-all hover:shadow-md">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
              Assessment Tool Scores (DSWD Manual)
            </p>
            <div className="flex justify-around items-center">
              <GaugeRing
                score={lmdScaled}
                max={6}
                color="#3b82f6"
                label="LMD"
                displayScore={lmdScaled}
              />
              <GaugeRing
                score={ivjScaled}
                max={6}
                color="#8b5cf6"
                label="IVJ"
                displayScore={ivjScaled}
              />
              <GaugeRing
                score={cfcScore}
                max={4}
                color="#10b981"
                label="CFC"
                displayScore={cfcScore > 0 ? cfcScore.toFixed(2) : "0.00"}
              />
              <GaugeRing
                score={ffcScore}
                max={4}
                color="#6366f1"
                label="FFC"
                displayScore={ffcScore > 0 ? ffcScore.toFixed(2) : "0.00"}
              />
            </div>
          </div>

          {/* CFC / FFC / LMD / IVJ Results */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tool Results & Functioning
            </p>

            {/* LMD Card */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3.5 flex items-start gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                  {lmdLabel} Level
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                  Levels of Moral Development (LMD)
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  Mean Score: {lmdRawMean.toFixed(2)}/6.00 · Scaled Score: {lmdScaled}/6 — Reflects the child's moral reasoning stage according to Kohlberg's framework.
                </p>
              </div>
            </div>

            {/* IVJ Card */}
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3.5 flex items-start gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-300">
                  {ivjLabel} Level
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                  Index of Value Judgment (IVJ)
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                  Raw Score: {rawIvj}/54 · Scaled Score: {ivjScaled}/6 — Reflects the child's discrimination between right and wrong in day-to-day practices.
                </p>
              </div>
            </div>

            {/* CFC Card */}
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3.5 flex items-start gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                  {cfcLabel}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Child Functioning Checklist (CFC)
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                  Functioning Score: {cfcScore > 0 ? cfcScore.toFixed(2) : "0.00"}/4.00
                  {assessmentData.cfcCheckedCount !== undefined && assessmentData.cfcCheckedCount > 0 ? (
                    <span className="font-semibold ml-1">
                      ({assessmentData.cfcWeightSum || 0} credited weights ÷ {assessmentData.cfcCheckedCount} credited items)
                    </span>
                  ) : null} — Approximates the child's physical, behavioral, socio-emotional, and spiritual functioning.
                </p>
              </div>
            </div>

            {/* FFC Card */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3.5 flex items-start gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                  {ffcLabel}
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
                  Family Functioning Checklist (FFC)
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-500 mt-1">
                  Functioning Score: {ffcScore > 0 ? ffcScore.toFixed(2) : "0.00"}/4.00
                  {assessmentData.ffcCheckedCount !== undefined && assessmentData.ffcCheckedCount > 0 ? (
                    <span className="font-semibold ml-1">
                      ({assessmentData.ffcWeightSum || 0} credited weights ÷ {assessmentData.ffcCheckedCount} credited items)
                    </span>
                  ) : null} — Assesses family relationships, parenting style, discipline, and coping dynamics.
                </p>
              </div>
            </div>
          </div>

          {/* Final Discernment Determination */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors">
            <div
              className={`px-4 py-3 border-b ${
                hasDiscernment
                  ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                  : "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800"
              }`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  hasDiscernment
                    ? "text-red-800 dark:text-red-400"
                    : "text-emerald-800 dark:text-emerald-400"
                }`}
              >
                Computed Results for Social Worker Review
              </p>
            </div>
            <div className="p-5 space-y-4 bg-white dark:bg-slate-800">
              {childAge > 0 && childAge <= 15 ? (
                <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-950 dark:text-amber-200 p-5 rounded-xl border border-amber-300 dark:border-amber-700 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded">
                      RA 9344 Sec. 6 Exemption
                    </span>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Age at offense: {childAge} years old
                    </span>
                  </div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    Exempt from Criminal Liability
                  </p>
                  <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                    Age at offense is 15 or below. Exempt from criminal liability under Section 6 of RA 9344, as amended by RA 10630. For referral to an intervention program (Section 20). For the social worker's confirmation.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-amber-200 dark:border-amber-800">
                    Discernment assessment (LMD & IVJ) is not applicable pursuant to statutory minimum age rules. Child is directly referred to an intervention program.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      LMD Scaled Score (SS):
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {lmdScaled} ({lmdLabel})
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      IVJ Scaled Score (SS):
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {ivjScaled} ({ivjLabel})
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Combined Average (SS_LMD + SS_IVJ) / 2:
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {combinedAverageStr}
                    </span>
                  </div>

                  <div className="pt-2">
                    {computation.isInvalid ? (
                      <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 p-4 rounded-xl text-center shadow-inner border border-amber-300 dark:border-amber-700">
                        <p className="text-xs uppercase font-bold tracking-widest mb-1 text-amber-800 dark:text-amber-300">
                          ⚠️ Calculation Error
                        </p>
                        <p className="text-base font-black">Score Out of Bounds</p>
                        <p className="text-xs mt-2 font-medium opacity-90">
                          {computation.errorMessage || "Score lampas sa 1.00-6.00 range. Walang conclusion na maipapakita."}
                        </p>
                      </div>
                    ) : hasDiscernment ? (
                      <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-xl text-center shadow-inner border border-red-200 dark:border-red-800">
                        <p className="text-xs uppercase font-bold tracking-widest mb-1 text-red-700 dark:text-red-400">
                          Computed Result (For Social Worker Review)
                        </p>
                        <p className="text-base font-black">At or above the 3.51 threshold</p>
                        <p className="text-xs mt-2 opacity-85 leading-relaxed">
                          Combined average of {combinedAverageStr} ({discernmentLevel}) falls in the 3.51 - 6.00 range. This decision aid serves as technical recommendation for social worker validation, not a final legal finding.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-center shadow-inner border border-emerald-200 dark:border-emerald-800">
                        <p className="text-xs uppercase font-bold tracking-widest mb-1 text-emerald-700 dark:text-emerald-400">
                          Computed Result (For Social Worker Review)
                        </p>
                        <p className="text-base font-black">
                          Below the 3.51 threshold
                        </p>
                        <p className="text-xs mt-2 opacity-85 leading-relaxed">
                          Combined average of {combinedAverageStr} ({discernmentLevel}) falls below the 3.51 threshold (1.00 - 3.50). This decision aid serves as technical recommendation for social worker validation, not a final legal finding.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Social Worker Qualitative Inputs: Findings & Recommendations */}
          <div className="space-y-4 pt-1">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                VI. Narrative Findings (Social Worker Observations)
              </label>
              <textarea
                value={narrativeFindings}
                onChange={(e) => setNarrativeFindings(e.target.value)}
                placeholder="Enter qualitative observations, interview findings, and collateral functioning notes..."
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                VII. Recommendations (Social Worker Intervention Plan)
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Enter specific recommendations, proposed diversion measures, or intervention programs..."
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right: Document Preview */}
        <div className="bg-slate-800 dark:bg-slate-950 flex flex-col items-center justify-start py-8 px-6 relative min-h-full transition-colors print:bg-white print:p-0 print:m-0 print:block">
          {/* Floating Toolbar */}
          <div className="sticky top-6 z-10 flex flex-col items-center gap-2 bg-slate-700/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-slate-600/60 dark:border-slate-700 mb-8 w-full max-w-lg transition-colors print:hidden">
            {currentCaseId && (
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                Viewing Historical Record
              </span>
            )}
            <div className="flex items-center justify-center gap-2 w-full">
              {!currentCaseId && (
                <button
                  onClick={handleSaveCase}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: "#059669" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  {isSaving ? "Saving..." : "Save to Database"}
                </button>
              )}
              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:brightness-110"
                style={{ background: "#2a4f9e" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export PDF
              </button>
              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 border border-slate-600 dark:border-slate-700 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700/50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 border border-slate-600 dark:border-slate-700 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700/50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Preview
              </button>
            </div>
            {saveMessage && (
              <div
                className={`text-xs font-semibold ${
                  saveMessage.includes("successfully")
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {saveMessage}
              </div>
            )}
          </div>

          {/* A4 Paper Mockup */}
          {/* Note: The document mockup always stays white for realism, even in dark mode */}
          <div
            className="cads-printable-doc bg-white shadow-2xl dark:shadow-black/50 w-full max-w-lg rounded-sm overflow-hidden print:w-full print:max-w-none print:shadow-none print:overflow-visible print:m-0 print:p-0"
            style={{ aspectRatio: "1/1.4", printColorAdjust: "exact" }}
          >
            {/* Letterhead */}
            <div
              className="border-b-4 px-8 py-5 flex items-center gap-4"
              style={{ borderColor: "#0f2044" }}
            >
              <div
                className="w-14 h-14 rounded-full border-4 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: "#0f2044" }}
              >
                <svg viewBox="0 0 40 40" className="w-10 h-10">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="#0f2044"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="10"
                    fill="none"
                    stroke="#0f2044"
                    strokeWidth="1.5"
                  />
                  {[...Array(8)].map((_, i) => (
                    <line
                      key={i}
                      x1="20"
                      y1="2"
                      x2="20"
                      y2="10"
                      stroke="#0f2044"
                      strokeWidth="1.5"
                      transform={`rotate(${i * 45} 20 20)`}
                    />
                  ))}
                </svg>
              </div>
              <div className="flex-1">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#0f2044" }}
                >
                  Republic of the Philippines
                </p>
                <p className="text-xs" style={{ color: "#0f2044" }}>
                  Municipal Social Welfare and Development Office
                </p>
                <p
                  className="text-sm font-bold mt-0.5"
                  style={{ color: "#0f2044" }}
                >
                  GMA, Cavite MSWDO
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="px-8 py-4 text-center border-b border-slate-200">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
                Initial Assessment of Discernment Report
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                CICL Assessment — Computerized Assessment of Discernment System
              </p>
            </div>

            {/* Document Body Skeleton */}
            <div className="px-8 py-4 space-y-4">
              {/* Case header fields */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  ["Case ID:", caseId],
                  ["Date of Assessment:", reportDate],
                  ["Assessing Officer:", assessingOfficer || "—"],
                  ["Supervisor:", supervisorName || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex-shrink-0">
                      {k}
                    </span>
                    <span className="text-xs text-slate-800 font-medium">
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              {/* I. Identifying Information */}
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5 pt-2 border-t border-slate-100">
                  I. IDENTIFYING INFORMATION
                </p>
                <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1 text-xs text-slate-700">
                  <span className="font-semibold text-slate-500">Name:</span>
                  <span>
                    {intakeData.firstName} {intakeData.lastName}
                  </span>
                  <span className="font-semibold text-slate-500">Alias:</span>
                  <span>{intakeData.alias || "—"}</span>
                  <span className="font-semibold text-slate-500">DOB:</span>
                  <span>{intakeData.dateOfBirth || "—"}</span>
                  <span className="font-semibold text-slate-500">Birth Place:</span>
                  <span>{intakeData.placeOfBirth || "—"}</span>
                  <span className="font-semibold text-slate-500">
                    Age / Gender:
                  </span>
                  <span>
                    {intakeData.age} years old / {intakeData.gender}
                  </span>
                  <span className="font-semibold text-slate-500">Education:</span>
                  <span>{intakeData.highestEducation || "—"}</span>
                  <span className="font-semibold text-slate-500">Birth Status:</span>
                  <span>{intakeData.birthStatus || "—"}</span>
                  <span className="font-semibold text-slate-500">Disability:</span>
                  <span>{intakeData.disability || "—"}</span>
                  <span className="font-semibold text-slate-500">Present Addr:</span>
                  <span>{intakeData.presentAddress}</span>
                  <span className="font-semibold text-slate-500">Perm. Addr:</span>
                  <span>{intakeData.permanentAddress || "—"}</span>
                  <span className="font-semibold text-slate-500">Age at Offense:</span>
                  <span>{intakeData.ageAtOffense || "—"}</span>
                  <span className="font-semibold text-slate-500">
                    Guardian:
                  </span>
                  <span>
                    {intakeData.primaryGuardian} ({intakeData.contactNumber})
                  </span>
                </div>
                {childAge > 0 && childAge <= 15 && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 text-[10px] text-amber-950 rounded leading-relaxed">
                    <strong>STATUTORY NOTICE:</strong> Age at offense is 15 or below. Exempt from criminal liability under Section 6 of RA 9344, as amended by RA 10630. For referral to an intervention program (Section 20). For the social worker's confirmation.
                  </div>
                )}
              </div>

              {/* II. Family Background */}
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5 pt-2 border-t border-slate-100">
                  II. FAMILY BACKGROUND
                </p>
                <table className="w-full text-xs text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-1 font-semibold text-slate-500">
                        Name
                      </th>
                      <th className="text-left py-1 font-semibold text-slate-500">
                        Rel.
                      </th>
                      <th className="text-left py-1 font-semibold text-slate-500">
                        Age
                      </th>
                      <th className="text-left py-1 font-semibold text-slate-500">
                        Occupation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {intakeData.familyMembers.length > 0 ? (
                      intakeData.familyMembers.map((fm, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-1">{fm.name}</td>
                          <td className="py-1">{fm.relationship}</td>
                          <td className="py-1">{fm.age}</td>
                          <td className="py-1">{fm.occupation}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-1 italic text-slate-400">
                          No family records provided.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* III. Circumstances of the Offense */}
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5 pt-2 border-t border-slate-100">
                  III. CIRCUMSTANCES OF THE OFFENSE
                </p>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  The child in conflict with the law (CICL) is allegedly
                  involved in an incident of{" "}
                  <strong>{intakeData.offense}</strong> that occurred on{" "}
                  <strong>{intakeData.offenseDate}</strong> at{" "}
                  <strong>{intakeData.offenseLocation}</strong>.
                </p>
              </div>

              {/* IV. Assessment Results */}
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5 pt-2 border-t border-slate-100">
                  IV. INITIAL ASSESSMENT OF DISCERNMENT
                </p>
                {childAge > 0 && childAge <= 15 ? (
                  <div className="text-xs text-slate-800 space-y-2 leading-relaxed text-justify p-3 bg-amber-50/70 border border-amber-300 rounded">
                    <p className="font-bold text-amber-950 uppercase text-[11px]">
                      Statutory Minimum Age Exemption (RA 9344, Sec. 6):
                    </p>
                    <p className="font-medium text-amber-900">
                      Age at offense is 15 or below. Exempt from criminal liability under Section 6 of RA 9344, as amended by RA 10630. For referral to an intervention program (Section 20). For the social worker's confirmation.
                    </p>
                    <p className="text-[10px] text-slate-500 italic pt-1 border-t border-amber-200">
                      Note: Administration of psychometric discernment assessment tools (LMD & IVJ) is not required nor applicable. Intervention planning proceeds via Section V functioning assessments and social worker recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-700 space-y-2 leading-relaxed text-justify">
                    <p>
                      <span className="font-semibold">
                        A. Levels of Moral Development (LMD):
                      </span>{" "}
                      The child obtained a mean dilemma score of{" "}
                      <strong>{lmdRawMean.toFixed(2)}</strong>, which translates
                      to a Scaled Score of <strong>{lmdScaled}</strong> (classified as{" "}
                      <strong>{lmdLabel}</strong> level of moral reasoning).
                    </p>
                    <p>
                      <span className="font-semibold">
                        B. Index of Value Judgment (IVJ):
                      </span>{" "}
                      The child obtained a raw score of <strong>{rawIvj}/54</strong>, which translates
                      to a Scaled Score of <strong>{ivjScaled}</strong> (classified as{" "}
                      <strong>{ivjLabel}</strong> level of value judgment).
                    </p>
                    <p>
                      <span className="font-semibold">
                        C. Computed Results for Social Worker Review:
                      </span>{" "}
                      The combined average of the LMD and IVJ scaled scores is{" "}
                      <strong>{combinedAverageStr}</strong> (classified as{" "}
                      <strong>{discernmentLevel}</strong> level of discernment). Based on the DSWD Self-Instructional Manual and RA 9344 Guidelines, an average
                      score between 3.51 and 6.00 defines the child's capability to discern, while a score of 1.00 to 3.50 does not indicate discernment under the manual and is subject to social worker validation.
                    </p>
                    {computation.isInvalid ? (
                      <div className="mt-2 text-xs font-bold text-center py-2 bg-amber-50 text-amber-900 border border-amber-300">
                        ⚠️ ERROR: Assessment scores out of bounds. Discernment determination cannot be concluded.
                      </div>
                    ) : (
                      <div className="mt-2 text-xs py-2 px-3 bg-slate-50 border border-slate-300 leading-relaxed text-justify">
                        <span className="font-bold">COMPUTED RESULT (FOR SOCIAL WORKER REVIEW):</span> Combined average of <strong>{combinedAverageStr}</strong> is <strong>{hasDiscernment ? "at or above the 3.51 threshold" : "below the 3.51 threshold"}</strong> (classified as {discernmentLevel}). This serves as an algorithmic decision aid for the assessing social worker's review and validation pursuant to RA 9344 Guidelines, and does not constitute a final legal finding.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* V. Functioning Assessment */}
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5 pt-2 border-t border-slate-100">
                  V. FUNCTIONING ASSESSMENT
                </p>
                <div className="text-xs text-slate-700 space-y-2 leading-relaxed text-justify">
                  <p>
                    <span className="font-semibold">
                      Child Functioning Checklist (CFC):
                    </span>{" "}
                    Mean Score: <strong>{cfcScore > 0 ? cfcScore.toFixed(2) : "0.00"} / 4.00</strong> — <strong>{cfcLabel}</strong>.
                  </p>
                  <p>
                    <span className="font-semibold">
                      Family Functioning Checklist (FFC):
                    </span>{" "}
                    Mean Score: <strong>{ffcScore > 0 ? ffcScore.toFixed(2) : "0.00"} / 4.00</strong> — <strong>{ffcLabel}</strong>.
                  </p>
                </div>
              </div>

              {/* VI. Narrative Findings */}
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5 pt-2 border-t border-slate-100">
                  VI. NARRATIVE FINDINGS
                </p>
                {narrativeFindings ? (
                  <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                    {narrativeFindings}
                  </p>
                ) : (
                  <div className="py-2 space-y-3 min-h-[50px]">
                    <div className="border-b border-dashed border-slate-300 h-5" />
                    <div className="border-b border-dashed border-slate-300 h-5" />
                  </div>
                )}
              </div>

              {/* VII. Recommendations */}
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5 pt-2 border-t border-slate-100">
                  VII. RECOMMENDATIONS
                </p>
                {recommendations || assessmentData.notes ? (
                  <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                    {recommendations || assessmentData.notes}
                  </p>
                ) : (
                  <div className="py-2 space-y-3 min-h-[50px]">
                    <div className="border-b border-dashed border-slate-300 h-5" />
                    <div className="border-b border-dashed border-slate-300 h-5" />
                  </div>
                )}
              </div>

              {/* Signature block */}
              <div className="print-avoid-break mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8">
                <div>
                  <div className="h-px bg-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-700 min-h-[1.25rem]">
                    {assessingOfficer ? assessingOfficer.toUpperCase() : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    Assessing Social Worker
                  </p>
                </div>
                <div>
                  <div className="h-px bg-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-700 min-h-[1.25rem]">
                    {supervisorName ? supervisorName.toUpperCase() : ""}
                  </p>
                  <p className="text-xs text-slate-500">MSWDO Supervisor</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-xs mt-4 print:hidden">
            Preview · Page 1 of 1
          </p>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto p-8 print:hidden">
          <div className="flex justify-between items-center w-full max-w-3xl mb-6 sticky top-0 bg-slate-900/90 p-4 rounded-xl shadow-xl border border-slate-700">
            <h2 className="text-white font-bold">Document Preview</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePrint()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Print Document
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          <div className="w-full max-w-3xl bg-white shadow-2xl">
            {/* We recreate the document inside the preview modal just for viewing. It is identical to the main one but larger. */}
            <div className="w-full h-full p-8" style={{ minHeight: "1000px" }}>
              <div
                className="border-b-4 pb-5 mb-6 flex items-center gap-6"
                style={{ borderColor: "#0f2044" }}
              >
                <div
                  className="w-20 h-20 rounded-full border-4 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: "#0f2044" }}
                >
                  <svg viewBox="0 0 40 40" className="w-14 h-14">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="#0f2044"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="10"
                      fill="none"
                      stroke="#0f2044"
                      strokeWidth="1.5"
                    />
                    {[...Array(8)].map((_, i) => (
                      <line
                        key={i}
                        x1="20"
                        y1="2"
                        x2="20"
                        y2="10"
                        stroke="#0f2044"
                        strokeWidth="1.5"
                        transform={`rotate(${i * 45} 20 20)`}
                      />
                    ))}
                  </svg>
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: "#0f2044" }}
                  >
                    Republic of the Philippines
                  </p>
                  <p className="text-sm" style={{ color: "#0f2044" }}>
                    Municipal Social Welfare and Development Office
                  </p>
                  <p
                    className="text-lg font-bold mt-1"
                    style={{ color: "#0f2044" }}
                  >
                    GMA, Cavite MSWDO
                  </p>
                </div>
              </div>

              <div className="text-center border-b border-slate-200 pb-6 mb-6">
                <p className="text-base font-bold uppercase tracking-widest text-slate-700">
                  Initial Assessment of Discernment Report
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  CICL Assessment — Computerized Assessment of Discernment
                  System
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold text-slate-500 w-32">
                      Case ID:
                    </span>
                    <span className="text-sm text-slate-800 font-medium">
                      {caseId}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold text-slate-500 w-32">
                      Date of Assessment:
                    </span>
                    <span className="text-sm text-slate-800 font-medium">
                      {reportDate}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold text-slate-500 w-32">
                      Assessing Officer:
                    </span>
                    <span className="text-sm text-slate-800 font-medium">
                      {assessingOfficer || "—"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold text-slate-500 w-32">
                      Supervisor:
                    </span>
                    <span className="text-sm text-slate-800 font-medium">
                      {supervisorName || "—"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 pt-4 border-t border-slate-200">
                    I. IDENTIFYING INFORMATION
                  </p>
                  <div className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2 text-sm text-slate-700">
                    <span className="font-semibold text-slate-500">Name:</span>
                    <span>
                      {intakeData.firstName} {intakeData.lastName}
                    </span>
                    <span className="font-semibold text-slate-500">Alias:</span>
                    <span>{intakeData.alias || "—"}</span>
                    <span className="font-semibold text-slate-500">DOB:</span>
                    <span>{intakeData.dateOfBirth || "—"}</span>
                    <span className="font-semibold text-slate-500">Birth Place:</span>
                    <span>{intakeData.placeOfBirth || "—"}</span>
                    <span className="font-semibold text-slate-500">
                      Age / Gender:
                    </span>
                    <span>
                      {intakeData.age} years old / {intakeData.gender}
                    </span>
                    <span className="font-semibold text-slate-500">Education:</span>
                    <span>{intakeData.highestEducation || "—"}</span>
                    <span className="font-semibold text-slate-500">Birth Status:</span>
                    <span>{intakeData.birthStatus || "—"}</span>
                    <span className="font-semibold text-slate-500">Disability:</span>
                    <span>{intakeData.disability || "—"}</span>
                    <span className="font-semibold text-slate-500">
                      Present Addr:
                    </span>
                    <span>{intakeData.presentAddress}</span>
                    <span className="font-semibold text-slate-500">
                      Perm. Addr:
                    </span>
                    <span>{intakeData.permanentAddress || "—"}</span>
                    <span className="font-semibold text-slate-500">Age at Offense:</span>
                    <span>{intakeData.ageAtOffense || "—"}</span>
                    <span className="font-semibold text-slate-500">
                      Guardian:
                    </span>
                    <span>
                      {intakeData.primaryGuardian} ({intakeData.contactNumber})
                    </span>
                  </div>
                  {childAge > 0 && childAge <= 15 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-300 text-xs text-amber-950 rounded-lg leading-relaxed">
                      <strong>STATUTORY NOTICE:</strong> Age at offense is 15 or below. Exempt from criminal liability under Section 6 of RA 9344, as amended by RA 10630. For referral to an intervention program (Section 20). For the social worker's confirmation.
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 pt-4 border-t border-slate-200">
                    II. FAMILY BACKGROUND
                  </p>
                  <table className="w-full text-sm text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 font-semibold text-slate-500">
                          Name
                        </th>
                        <th className="text-left py-2 font-semibold text-slate-500">
                          Rel.
                        </th>
                        <th className="text-left py-2 font-semibold text-slate-500">
                          Age
                        </th>
                        <th className="text-left py-2 font-semibold text-slate-500">
                          Occupation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {intakeData.familyMembers.length > 0 ? (
                        intakeData.familyMembers.map((fm, i) => (
                          <tr
                            key={i}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-2">{fm.name}</td>
                            <td className="py-2">{fm.relationship}</td>
                            <td className="py-2">{fm.age}</td>
                            <td className="py-2">{fm.occupation}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-2 italic text-slate-400"
                          >
                            No family records provided.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 pt-4 border-t border-slate-200">
                    III. CIRCUMSTANCES OF THE OFFENSE
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed text-justify">
                    The child in conflict with the law (CICL) is allegedly
                    involved in an incident of{" "}
                    <strong>{intakeData.offense}</strong> that occurred on{" "}
                    <strong>{intakeData.offenseDate}</strong> at{" "}
                    <strong>{intakeData.offenseLocation}</strong>.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 pt-4 border-t border-slate-200">
                    IV. INITIAL ASSESSMENT OF DISCERNMENT
                  </p>
                  {childAge > 0 && childAge <= 15 ? (
                    <div className="text-sm text-slate-800 space-y-2 leading-relaxed text-justify p-4 bg-amber-50/70 border border-amber-300 rounded-lg">
                      <p className="font-bold text-amber-950 uppercase text-xs">
                        Statutory Minimum Age Exemption (RA 9344, Sec. 6):
                      </p>
                      <p className="font-medium text-amber-900">
                        Age at offense is 15 or below. Exempt from criminal liability under Section 6 of RA 9344, as amended by RA 10630. For referral to an intervention program (Section 20). For the social worker's confirmation.
                      </p>
                      <p className="text-xs text-slate-500 italic pt-1 border-t border-amber-200">
                        Note: Administration of psychometric discernment assessment tools (LMD & IVJ) is not required nor applicable. Intervention planning proceeds via Section V functioning assessments and social worker recommendations.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700 space-y-3 leading-relaxed text-justify">
                      <p>
                        <span className="font-semibold">
                          A. Levels of Moral Development (LMD):
                        </span>{" "}
                        The child obtained a mean dilemma score of{" "}
                        <strong>{lmdRawMean.toFixed(2)}</strong>, which translates
                        to a Scaled Score of <strong>{lmdScaled}</strong> (classified as{" "}
                        <strong>{lmdLabel}</strong> level of moral reasoning).
                      </p>
                      <p>
                        <span className="font-semibold">
                          B. Index of Value Judgment (IVJ):
                        </span>{" "}
                        The child obtained a raw score of <strong>{rawIvj}/54</strong>, which translates
                        to a Scaled Score of <strong>{ivjScaled}</strong> (classified as{" "}
                        <strong>{ivjLabel}</strong> level of value judgment).
                      </p>
                      <p>
                        <span className="font-semibold">
                          C. Computed Results for Social Worker Review:
                        </span>{" "}
                        The combined average of the LMD and IVJ scaled scores is{" "}
                        <strong>{combinedAverageStr}</strong> (classified as{" "}
                        <strong>{discernmentLevel}</strong> level of discernment). Based on the DSWD Self-Instructional Manual and RA 9344 Guidelines, an average
                        score between 3.51 and 6.00 defines the child's capability to discern, while a score of 1.00 to 3.50 does not indicate discernment under the manual and is subject to social worker validation.
                      </p>
                      {computation.isInvalid ? (
                        <div className="mt-3 text-sm font-bold text-center py-3 bg-amber-50 text-amber-900 border border-amber-300">
                          ⚠️ ERROR: Assessment scores out of bounds. Discernment determination cannot be concluded.
                        </div>
                      ) : (
                        <div className="mt-3 text-sm py-3 px-4 bg-slate-50 border border-slate-300 leading-relaxed text-justify">
                          <span className="font-bold">COMPUTED RESULT (FOR SOCIAL WORKER REVIEW):</span> Combined average of <strong>{combinedAverageStr}</strong> is <strong>{hasDiscernment ? "at or above the 3.51 threshold" : "below the 3.51 threshold"}</strong> (classified as {discernmentLevel}). This serves as an algorithmic decision aid for the assessing social worker's review and validation pursuant to RA 9344 Guidelines, and does not constitute a final legal finding.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 pt-4 border-t border-slate-200">
                    V. FUNCTIONING ASSESSMENT
                  </p>
                  <div className="text-sm text-slate-700 space-y-3 leading-relaxed text-justify">
                    <p>
                      <span className="font-semibold">
                        Child Functioning Checklist (CFC):
                      </span>{" "}
                      Mean Score: <strong>{cfcScore > 0 ? cfcScore.toFixed(2) : "0.00"} / 4.00</strong> — <strong>{cfcLabel}</strong>.
                    </p>
                    <p>
                      <span className="font-semibold">
                        Family Functioning Checklist (FFC):
                      </span>{" "}
                      Mean Score: <strong>{ffcScore > 0 ? ffcScore.toFixed(2) : "0.00"} / 4.00</strong> — <strong>{ffcLabel}</strong>.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 pt-4 border-t border-slate-200">
                    VI. NARRATIVE FINDINGS
                  </p>
                  {narrativeFindings ? (
                    <p className="text-sm text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                      {narrativeFindings}
                    </p>
                  ) : (
                    <div className="py-3 space-y-4 min-h-[60px]">
                      <div className="border-b border-dashed border-slate-300 h-5" />
                      <div className="border-b border-dashed border-slate-300 h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 pt-4 border-t border-slate-200">
                    VII. RECOMMENDATIONS
                  </p>
                  {recommendations || assessmentData.notes ? (
                    <p className="text-sm text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                      {recommendations || assessmentData.notes}
                    </p>
                  ) : (
                    <div className="py-3 space-y-4 min-h-[60px]">
                      <div className="border-b border-dashed border-slate-300 h-5" />
                      <div className="border-b border-dashed border-slate-300 h-5" />
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-6 grid grid-cols-2 gap-12">
                  <div>
                    <div className="h-px bg-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-800 min-h-[1.25rem]">
                      {assessingOfficer ? assessingOfficer.toUpperCase() : ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      Assessing Social Worker
                    </p>
                  </div>
                  <div>
                    <div className="h-px bg-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-800 min-h-[1.25rem]">
                      {supervisorName ? supervisorName.toUpperCase() : ""}
                    </p>
                    <p className="text-sm text-slate-500">MSWDO Supervisor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
