import { useState, useEffect } from "react"
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

interface Question {
  id: number
  assessment_type: string
  statement: string
  is_reverse_scored: boolean
}

function IVJAssessmentForm({
  onNavigate,
  onBack,
  questions,
  schema,
}: AssessmentProps & { questions: Question[], schema: any }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [paused, setPaused] = useState(false)

  type AssessmentFormData = z.infer<typeof schema>

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isValid },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(schema),
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
  const existingAssessmentData = useAppStore((state) => state.assessmentData)

  const currentCaseId = useAppStore((state) => state.currentCaseId)

  const clientName = intakeData.firstName
    ? `${intakeData.firstName} ${intakeData.lastName}`
    : "Unknown Client"
  const clientInitials = intakeData.firstName
    ? `${intakeData.firstName[0]}${intakeData.lastName[0]}`.toUpperCase()
    : "UN"

  const handleComplete = (data: AssessmentFormData) => {
    const { answers, notes } = data
    let ivjScore = 0

    questions.forEach((q, idx) => {
      const qIndex = (idx + 1).toString()
      const answer = answers[qIndex]
      if (answer !== undefined) {
        // DSWD Index of Value Judgment Scoring:
        // Positive items (!q.is_reverse_scored): Correct answer is Right/Tama (true)
        // Negative items (q.is_reverse_scored): Correct answer is Wrong/Mali (false)
        const isCorrect = q.is_reverse_scored ? answer === false : answer === true
        if (isCorrect) ivjScore += 1
      }
    })

    const processedAnswers = questions.map((q, idx) => {
      const qIndex = (idx + 1).toString()
      const answer = answers[qIndex]
      const isCorrect =
        (q.is_reverse_scored && !answer) || (!q.is_reverse_scored && answer)
      return {
        category: "IVJ",
        questionText: q.statement,
        selectedAnswer: answer ? "Right (Tama)" : "Wrong (Mali)",
        scoreWeight: isCorrect ? 1 : 0,
      }
    })

    setAssessmentData({
      ...existingAssessmentData,
      ivjScore: ivjScore,
      answers: [
        ...(existingAssessmentData?.answers || []),
        ...processedAnswers,
      ],
      notes: notes,
    })

    onNavigate("results")
  }

  const handleAnswer = (val: boolean) => {
    setValue("answers", { ...selected, [currentQ + 1]: val }, {
      shouldValidate: true,
    })

    // Auto-advance after a short delay to let them see the button state change
    if (!isLast) {
      setTimeout(() => {
        setCurrentQ((q) => Math.min(questions.length - 1, q + 1))
      }, 350)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
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
              Index of Value Judgment (IVJ) Tool
            </p>
            <div className="relative w-full max-w-2xl">
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
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
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
      </header>

      {paused && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Assessment Paused
            </h3>
            <button
              onClick={() => setPaused(false)}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg text-sm"
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {clientInitials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {clientName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentCaseId || "Unknown ID"} · IVJ Assessment
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-white/40 dark:border-slate-700/60 p-8 sm:p-12 transition-colors text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10"
              >
                <span className="relative z-10 text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3 py-1.5 rounded-full uppercase tracking-widest mb-8 inline-block shadow-sm">
                  Item {currentQ + 1}
                </span>

                <h2
                  className="relative z-10 text-slate-900 dark:text-slate-100 leading-relaxed mb-12 text-2xl sm:text-3xl font-medium max-w-2xl mx-auto"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  "{question.statement}"
                </h2>

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-lg mx-auto">
                  <button
                    onClick={() => handleAnswer(true)}
                    className={`group flex-1 w-full flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all duration-300 ease-out transform active:scale-95 ${
                      selected[currentQ + 1] === true
                        ? "bg-gradient-to-b from-purple-500 to-purple-700 border-purple-600 shadow-[0_8px_30px_rgb(147,51,234,0.3)] ring-4 ring-purple-600/20"
                        : "bg-white/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        selected[currentQ + 1] === true
                          ? "bg-white/20 text-white scale-110"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-xl font-bold tracking-wide transition-colors ${
                        selected[currentQ + 1] === true
                          ? "text-white"
                          : "text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300"
                      }`}
                    >
                      Right (Tama)
                    </span>
                  </button>

                  <button
                    onClick={() => handleAnswer(false)}
                    className={`group flex-1 w-full flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all duration-300 ease-out transform active:scale-95 ${
                      selected[currentQ + 1] === false
                        ? "bg-gradient-to-b from-slate-700 to-slate-900 border-slate-800 shadow-[0_8px_30px_rgb(15,23,42,0.3)] ring-4 ring-slate-800/20"
                        : "bg-white/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        selected[currentQ + 1] === false
                          ? "bg-white/20 text-white scale-110"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-xl font-bold tracking-wide transition-colors ${
                        selected[currentQ + 1] === false
                          ? "text-white"
                          : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                      }`}
                    >
                      Wrong (Mali)
                    </span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pb-8">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            <span className="text-xs text-slate-400 dark:text-slate-500">
              {currentQ + 1} / {questions.length}
            </span>

            {isLast ? (
              <div className="flex items-center gap-3">
                {!isValid && (
                  <span className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    Please answer all 54 questions to complete.
                  </span>
                )}
                <button
                  onClick={handleSubmit(handleComplete)}
                  disabled={!isValid}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  Complete
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  setCurrentQ(Math.min(questions.length - 1, currentQ + 1))
                }
                disabled={selected[currentQ + 1] === undefined}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg bg-purple-600 hover:bg-purple-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function IVJAssessment(props: AssessmentProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/get_questions.php?type=IVJ")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions.length > 0) {
          setQuestions(data.questions)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-500 animate-pulse font-medium">
          Loading Assessment...
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          No Questions Found
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          There are no questions configured for the IVJ Assessment. Please go to
          Settings &gt; Assessment Tools to add them.
        </p>
        <button
          onClick={props.onBack}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium"
        >
          Go Back
        </button>
      </div>
    )
  }

  const dynamicSchema = z.object({
    answers: z
      .record(z.string(), z.boolean())
      .refine((data) => Object.keys(data).length === questions.length, {
        message: "All questions must be answered",
      }),
    notes: z.string().optional(),
  })

  return (
    <IVJAssessmentForm
      {...props}
      questions={questions}
      schema={dynamicSchema}
    />
  )
}
