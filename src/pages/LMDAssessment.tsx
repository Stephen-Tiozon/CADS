import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { useAppStore } from "../store"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings"

interface AssessmentProps {
  onNavigate: (page: Page) => void
  onBack: () => void
}

export interface LMDQuestion {
  id: number
  dilemma: string
  options: string[]
  scores: number[]
}

export default function LMDAssessment({ onNavigate, onBack }: AssessmentProps) {
  const [questions, setQuestions] = useState<LMDQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/get_lmd_questions.php")
        const result = await response.json()
        if (result.success) {
          setQuestions(result.questions)
        }
      } catch (error) {
        console.error("Failed to load LMD questions")
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const assessmentSchema = useMemo(() => {
    return z.object({
      answers: z
        .record(z.string(), z.number())
        .refine((data) => Object.keys(data).length === questions.length, {
          message: "All questions must be answered",
        }),
      notes: z.string().optional(),
    })
  }, [questions.length])

  type AssessmentFormData = z.infer<typeof assessmentSchema>
  const [currentQ, setCurrentQ] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const [paused, setPaused] = useState(false)

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { isValid },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      answers: {},
      notes: "",
    },
    mode: "onChange",
  })

  const selected = watch("answers") || {}
  const notes = watch("notes") || ""

  const question = questions[currentQ]
  const progress = ((currentQ + 1) / questions.length) * 100
  const isLast = currentQ === questions.length - 1

  const setAssessmentData = useAppStore((state) => state.setAssessmentData)
  const intakeData = useAppStore((state) => state.intakeData)

  const currentCaseId = useAppStore((state) => state.currentCaseId)

  const clientName = intakeData.firstName
    ? `${intakeData.firstName} ${intakeData.lastName}`
    : "Unknown Client"
  const clientInitials = intakeData.firstName
    ? `${intakeData.firstName[0]}${intakeData.lastName[0]}`.toUpperCase()
    : "UN"

  const handleComplete = (data: AssessmentFormData) => {
    const { answers, notes } = data
    let lmdTotal = 0

    questions.forEach((q, idx) => {
      const qIndex = (idx + 1).toString()
      const selectedIdx = answers[qIndex]
      if (selectedIdx !== undefined) {
        lmdTotal += q.scores[selectedIdx]
      }
    })

    const avgLmd = Math.round((lmdTotal / questions.length) * 100) / 100

    // Package the raw answers
    const processedAnswers = questions.map((q, idx) => {
      const qIndex = (idx + 1).toString()
      const selectedIdx = answers[qIndex]
      return {
        category: "General",
        questionText: q.dilemma,
        selectedAnswer: q.options[selectedIdx],
        scoreWeight: selectedIdx,
      }
    })

    const existingAssessmentData = useAppStore.getState().assessmentData;

    setAssessmentData({
      ...existingAssessmentData,
      lmdScore: avgLmd,
      answers: [
        ...(existingAssessmentData?.answers?.filter(a => a.category !== "General") || []),
        ...processedAnswers
      ],
      notes: notes || existingAssessmentData?.notes || "",
    })

    onNavigate("results")
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Loading assessment...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">
          No LMD questions found. Please add them in the Assessment Tools
          settings.
        </p>
        <button onClick={onBack} className="mt-4 text-blue-600 underline">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Minimalist Top Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 transition-colors">
        <div className="flex items-center px-6 py-3 gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex-shrink-0"
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
            Exit
          </button>

          <div className="flex-1 flex flex-col items-center">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Levels of Moral Development (LMD) Tool
            </p>
            <div className="relative w-full max-w-2xl">
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #1e3a73, #3563c4)",
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Question {currentQ + 1} of {questions.length}
            </p>
          </div>

          <button
            onClick={() => setPaused(!paused)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  paused
                    ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    : "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              />
            </svg>
            {paused ? "Resume" : "Pause"} Assessment
          </button>
        </div>
      </header>

      {/* Pause Overlay */}
      {paused && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-amber-600 dark:text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Assessment Paused
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              The timer is stopped. Resume when you are ready to continue the
              interview.
            </p>
            <button
              onClick={() => setPaused(false)}
              className="w-full py-3 text-white font-semibold rounded-lg text-sm"
              style={{ background: "#2a4f9e" }}
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          {/* Client info banner */}
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {clientInitials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {clientName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentCaseId || "Unknown ID"} · LMD Assessment
              </p>
            </div>
          </div>

          {/* Question Card */}
          <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-white/40 dark:border-slate-700/60 p-8 sm:p-10 transition-colors z-10">
            {/* Soft decorative background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    Moral Dilemma {currentQ + 1}
                  </span>
                </div>

                {/* Dilemma text in serif */}
                <p
                  className="text-slate-800 dark:text-slate-200 leading-relaxed mb-10 text-lg sm:text-xl font-medium"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  {question.dilemma}
                </p>

                {/* Answer Cards */}
                <div className="space-y-4">
                  {question.options.map((opt, i) => {
                    const isSelected = selected[question.id] === i
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setValue("answers", { ...selected, [question.id]: i }, {
                            shouldValidate: true,
                          })
                        }
                        className={`group w-full text-left flex items-start gap-4 px-6 py-5 rounded-2xl border-2 transition-all duration-300 ease-out transform active:scale-[0.98] ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-500 shadow-md shadow-blue-500/10"
                            : "bg-white/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 scale-110 shadow-sm shadow-blue-500/50"
                              : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500"
                          }`}
                        >
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </motion.svg>
                          )}
                        </div>
                        <span
                          className={`text-base leading-relaxed transition-colors ${
                            isSelected
                              ? "text-slate-900 dark:text-white font-bold"
                              : "text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                          }`}
                        >
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Observation Notes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-4 h-4 text-slate-400 dark:text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Assessor's Observation Notes
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  (Optional)
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${
                  notesOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {notesOpen && (
              <div className="px-5 pb-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <textarea
                  rows={3}
                  {...register("notes")}
                  placeholder="Note the respondent's reaction, hesitation, body language, or verbatim responses relevant to this question..."
                  className="w-full mt-3 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all"
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pb-8">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
              Previous
            </button>

            <span className="text-xs text-slate-400 dark:text-slate-500">
              {currentQ + 1} / {questions.length}
            </span>

            {isLast ? (
              <button
                onClick={handleSubmit(handleComplete)}
                disabled={!isValid}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg bg-emerald-600 hover:bg-emerald-700"
              >
                Complete Assessment
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQ(Math.min(questions.length - 1, currentQ + 1))
                }
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg"
                style={{ background: "#2a4f9e" }}
              >
                Next
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
