import { useState } from "react"
import LMDAssessment from "./LMDAssessment"
import IVJAssessment from "./IVJAssessment"
import CFCAssessment from "./CFCAssessment"
import FFCAssessment from "./FFCAssessment"
import { useAppStore } from "../store"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings"
type AssessmentType = "hub" | "lmd" | "ivj" | "cfc" | "ffc"

interface Props {
  onNavigate: (page: Page) => void
}

export default function Assessment({ onNavigate }: Props) {
  const [view, setView] = useState<AssessmentType>("hub")
  const currentUser = useAppStore((state) => state.currentUser)
  const intakeData = useAppStore((state) => state.intakeData)
  const assessmentData = useAppStore((state) => state.assessmentData)

  const childAge = Number(intakeData.ageAtOffense || intakeData.age || 0)
  const isUnderAgeExempt = childAge > 0 && childAge <= 15

  const clientName = intakeData.firstName
    ? `${intakeData.firstName} ${intakeData.lastName}`
    : "Unknown Client"

  // Restrict assessment administration to Social Workers (Algorithm 1)
  if (currentUser?.role === "admin") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Social Worker Access Only
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            In accordance with CADS Algorithm 1, discernment assessment administration is strictly designated to Registered Social Workers (RSW). Administrators hold oversight, audit, and user management privileges.
          </p>
          <button
            onClick={() => onNavigate("dashboard")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-blue-500/20"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleSelectTool = (tool: AssessmentType) => {
    if (isUnderAgeExempt && (tool === "lmd" || tool === "ivj")) {
      return
    }
    setView(tool)
  }

  if (view === "lmd")
    return (
      <LMDAssessment onNavigate={onNavigate} onBack={() => setView("hub")} />
    )
  if (view === "ivj")
    return (
      <IVJAssessment onNavigate={onNavigate} onBack={() => setView("hub")} />
    )
  if (view === "cfc")
    return (
      <CFCAssessment onNavigate={onNavigate} onBack={() => setView("hub")} />
    )
  if (view === "ffc")
    return (
      <FFCAssessment onNavigate={onNavigate} onBack={() => setView("hub")} />
    )

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 sm:p-8">
      <div className="max-w-5xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
              <span>MSWDO Case Management</span>
              <span>•</span>
              <span>Case Evaluation</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Assessment Hub
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Administer standardized assessment instruments for client:{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {clientName}
              </span>
              {childAge > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {childAge} yrs old at offense
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => onNavigate("dashboard")}
            className="self-start sm:self-auto px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODULE 1: SECTION IV. INITIAL ASSESSMENT OF DISCERNMENT  */}
        {/* ======================================================== */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Module 1 · Algorithmic Decision Aid
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Section IV: Initial Assessment of Discernment
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Administered for CICL aged above 15 and below 18 pursuant to RA 9344 Section 6 to assess cognitive and moral capability to discern right from wrong.
              </p>
            </div>
            {!isUnderAgeExempt && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Progress:{" "}
                <strong className="text-blue-700 dark:text-blue-400">
                  {(assessmentData.lmdScore > 0 ? 1 : 0) + (assessmentData.ivjScore > 0 ? 1 : 0)} / 2
                </strong>{" "}
                Completed
              </span>
            )}
          </div>

          {/* If age <= 15: Statutory Notice Banner inside Module 1 */}
          {isUnderAgeExempt ? (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-200 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded">
                    RA 9344 Sec. 6 Exemption
                  </span>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Statutorily Exempt from Discernment Assessment
                  </span>
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-200 mt-1.5 leading-relaxed font-medium">
                  Age at offense is 15 or below ({childAge} years old). Exempt from criminal liability under Section 6 of RA 9344, as amended by RA 10630. Administration of psychometric discernment tools (LMD and IVJ) is not applicable. Please proceed to <strong>Module 2 (Functioning Checklists)</strong> below for referral to an intervention program under Section 20.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LMD Card */}
              <div
                onClick={() => handleSelectTool("lmd")}
                className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 shadow-sm hover:shadow-md p-6 transition-all duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    {assessmentData.lmdScore > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed (Score: {assessmentData.lmdScore})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                        Pending Assessment
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    Level of Moral Development (LMD)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    A 14-item moral dilemma questionnaire evaluating the child's moral reasoning stage and ability to discern right from wrong.
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                  <span>{assessmentData.lmdScore > 0 ? "Review / Retake Tool" : "Start Administration"}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* IVJ Card */}
              <div
                onClick={() => handleSelectTool("ivj")}
                className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 shadow-sm hover:shadow-md p-6 transition-all duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {assessmentData.ivjScore > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed (Score: {assessmentData.ivjScore})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                        Pending Assessment
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    Index of Value Judgment (IVJ)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    A 54-item Yes/No situational judgment instrument measuring the child's understanding of social norms, laws, and property rights.
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                  <span>{assessmentData.ivjScore > 0 ? "Review / Retake Tool" : "Start Administration"}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODULE 2: SECTION V. FUNCTIONING & CONTEXTUAL PROFILING  */}
        {/* ======================================================== */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                  Module 2 · Contextual Profiling
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Section V: Child & Family Functioning Checklists
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Administered for all CICL to identify risk and protective factors for individualized intervention and diversion programming (RA 9344 Sec. 20).
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Progress:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {(assessmentData.cfcScore > 0 ? 1 : 0) + (assessmentData.ffcScore > 0 ? 1 : 0)} / 2
              </strong>{" "}
              Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CFC Card */}
            <div
              onClick={() => handleSelectTool("cfc")}
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm hover:shadow-md p-6 transition-all duration-200 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  {assessmentData.cfcScore > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  Child Functioning Checklist (CFC)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  A 35-item observational inventory evaluating cognitive, emotional, behavioral, and peer functioning indicators.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{assessmentData.cfcScore > 0 ? "Review / Retake Checklist" : "Start Administration"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* FFC Card */}
            <div
              onClick={() => handleSelectTool("ffc")}
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm hover:shadow-md p-6 transition-all duration-200 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  {assessmentData.ffcScore > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  Family Functioning Checklist (FFC)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  A 28-item checklist evaluating parenting practices, household stability, and environmental risk/protective dynamics.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{assessmentData.ffcScore > 0 ? "Review / Retake Checklist" : "Start Administration"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Report Action Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            {isUnderAgeExempt ? (
              <span>
                Client is statutorily exempt from discernment assessment. Ready to generate Section V intervention report.
              </span>
            ) : assessmentData.lmdScore > 0 && assessmentData.ivjScore > 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                ✓ Required discernment modules (LMD & IVJ) are completed.
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                ⚠️ Complete both LMD and IVJ to compute discernment decision aid and generate report.
              </span>
            )}
          </div>

          <button
            onClick={() => onNavigate("results")}
            disabled={!isUnderAgeExempt && (assessmentData.lmdScore === 0 || assessmentData.ivjScore === 0)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-sm ${
              isUnderAgeExempt || (assessmentData.lmdScore > 0 && assessmentData.ivjScore > 0)
                ? "bg-blue-700 hover:bg-blue-800 shadow-blue-900/20 hover:shadow-md cursor-pointer"
                : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            Generate Initial Assessment of Discernment Report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
