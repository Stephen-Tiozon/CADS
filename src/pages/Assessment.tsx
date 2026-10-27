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
  const [showAgeWarningModal, setShowAgeWarningModal] = useState(false)
  const [pendingTool, setPendingTool] = useState<AssessmentType | null>(null)
  const [exemptConfirmed, setExemptConfirmed] = useState(false)

  const childAge = Number(intakeData.age || intakeData.ageAtOffense || 0)
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
    if (isUnderAgeExempt && !exemptConfirmed) {
      setPendingTool(tool)
      setShowAgeWarningModal(true)
    } else {
      setView(tool)
    }
  }

  const handleConfirmExemptProceed = () => {
    setExemptConfirmed(true)
    setShowAgeWarningModal(false)
    if (pendingTool) {
      setView(pendingTool)
      setPendingTool(null)
    }
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-8">
      {/* Age 15 Exemption Confirmation Modal */}
      {showAgeWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 dark:border-amber-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Statutory Notice: Child Exempt from Criminal Responsibility
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-0.5">
                  Republic Act 9344, Section 20
                </p>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 space-y-2 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 leading-relaxed">
              <p>
                The child <strong>{clientName}</strong> is <strong>{childAge} years old</strong> (15 years of age or below).
              </p>
              <p>
                Pursuant to Section 20 of RA 9344 (Juvenile Justice and Welfare Act of 2006), a child fifteen (15) years of age or under at the time of the commission of the offense is <strong>exempt from criminal responsibility</strong> and shall be subjected to an appropriate intervention program.
              </p>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Are you administering this assessment strictly for psychosocial intervention and rehabilitation planning purposes?
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAgeWarningModal(false)
                  setPendingTool(null)
                }}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel / Return
              </button>
              <button
                onClick={handleConfirmExemptProceed}
                className="px-5 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition-all"
              >
                Proceed for Intervention Planning
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full">
        {/* Banner for Age 15 & below */}
        {isUnderAgeExempt && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 rounded">
                  RA 9344 Sec. 20 Alert
                </span>
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Client is {childAge} years old
                </span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 mt-1 leading-relaxed">
                Child is exempt from criminal responsibility under RA 9344. Any assessment administered is strictly for developmental evaluation and community/institutional intervention planning.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Assessment Hub
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Select an assessment tool for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {clientName}
              </span>
              .
            </p>
          </div>
          <button
            onClick={() => onNavigate("dashboard")}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LMD Card */}
          <div
            onClick={() => handleSelectTool("lmd")}
            className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center justify-center">
              {assessmentData.lmdScore > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-5 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Level of Moral Development (LMD)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              A 14-item moral dilemma questionnaire evaluating the child's moral
              reasoning and ability to discern right from wrong.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              {assessmentData.lmdScore > 0 ? "Review/Retake Assessment" : "Start Assessment"} &rarr;
            </span>
          </div>

          {/* IVJ Card */}
          <div
            onClick={() => handleSelectTool("ivj")}
            className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center justify-center">
              {assessmentData.ivjScore > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-5 text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Index of Value Judgment (IVJ)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              A 54-item Yes/No questionnaire measuring the child's understanding
              of social norms, rules, and property rights.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
              {assessmentData.ivjScore > 0 ? "Review/Retake Assessment" : "Start Assessment"} &rarr;
            </span>
          </div>

          {/* CFC Card */}
          <div
            onClick={() => handleSelectTool("cfc")}
            className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center justify-center">
              {assessmentData.cfcScore > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-5 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Child Functioning (CFC)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Observational checklist regarding the child's cognitive and
              psychological state.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              {assessmentData.cfcScore > 0 ? "Review/Retake Assessment" : "Start Assessment"} &rarr;
            </span>
          </div>

          {/* FFC Card */}
          <div
            onClick={() => handleSelectTool("ffc")}
            className="group cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 p-6 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center justify-center">
              {assessmentData.ffcScore > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Pending
                </span>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mb-5 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Family Functioning (FFC)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Checklist concerning family dynamics, parenting, and home
              environment.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
              {assessmentData.ffcScore > 0 ? "Review/Retake Assessment" : "Start Assessment"} &rarr;
            </span>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onNavigate("results")}
            disabled={assessmentData.lmdScore === 0 || assessmentData.ivjScore === 0}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
              assessmentData.lmdScore > 0 && assessmentData.ivjScore > 0
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 hover:shadow-blue-500/25"
                : "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70 shadow-none"
            }`}
          >
            Generate Initial Assessment of Discernment Report
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
