import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAppStore } from "../store"
import { getFfcDescription } from "../utils/discernment"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings"
type AnswerVal = "yes" | "no" | "na"

interface AssessmentProps {
  onNavigate: (page: Page) => void
  onBack: () => void
}

interface FFCItem {
  id: string
  itemNumber: number
  category: string
  statement: string
  riskWeight: number
  isPositive: boolean
  recommendedIntervention?: string
}

export default function FFCAssessment({ onNavigate, onBack }: AssessmentProps) {
  const [ffcItems, setFfcItems] = useState<FFCItem[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, AnswerVal>>({})
  const [notes, setNotes] = useState("")

  const setAssessmentData = useAppStore((state) => state.setAssessmentData)
  const intakeData = useAppStore((state) => state.intakeData)
  const currentCaseId = useAppStore((state) => state.currentCaseId)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(
          "/api/get_observational_indicators.php?type=FFC",
        )
        const data = await res.json()
        if (data.success) {
          const items: FFCItem[] = data.indicators.map((i: any, index: number) => ({
            id: i.id.toString(),
            itemNumber: i.item_number ? parseInt(i.item_number, 10) : index + 1,
            category: i.category,
            statement: i.statement,
            riskWeight: parseInt(i.risk_weight, 10) || 1,
            isPositive: i.is_positive !== undefined ? Boolean(Number(i.is_positive)) : true,
            recommendedIntervention: i.recommended_intervention,
          }))
          setFfcItems(items)

          // Restore previous answers if available
          const existingAnswers = useAppStore.getState().assessmentData.answers || []
          const prevAnswers: Record<string, AnswerVal> = {}

          items.forEach((item) => {
            const match = existingAnswers.find(
              (a) => a.questionText === item.statement || a.questionText === `${item.itemNumber}. ${item.statement}`,
            )
            if (match) {
              if (match.selectedAnswer === "Yes") {
                prevAnswers[item.id] = "yes"
              } else if (match.selectedAnswer === "No") {
                prevAnswers[item.id] = "no"
              } else if (match.selectedAnswer === "Not Applicable") {
                prevAnswers[item.id] = "na"
              }
            }
          })

          if (Object.keys(prevAnswers).length > 0) {
            setAnswers(prevAnswers)
          }
        }
      } catch (e) {
        console.error("Failed to load FFC items", e)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const clientName = intakeData.firstName
    ? `${intakeData.firstName} ${intakeData.lastName}`
    : "Unknown Client"
  const clientInitials = intakeData.firstName
    ? `${intakeData.firstName[0]}${intakeData.lastName[0]}`.toUpperCase()
    : "UN"

  const setItemAnswer = (id: string, val: AnswerVal) => {
    setAnswers((prev) => {
      const next = { ...prev }
      if (next[id] === val) {
        delete next[id] // toggle off if clicked again
      } else {
        next[id] = val
      }
      return next
    })
  }

  // DSWD Scoring Rule Formulation (Annex X & Manual p. 19):
  // - For positive items: "Yes" is ideal -> gets credited weight; "No" gets 0.
  // - For negative items: "No" is ideal -> gets credited weight; "Yes" gets 0 (family conflict/risk present).
  // - "N/A" is excluded from applicable items.
  const answeredItems = ffcItems.filter((item) => answers[item.id] !== undefined)
  const applicableItems = answeredItems.filter((item) => answers[item.id] !== "na")
  const applicableCount = applicableItems.length

  let creditedWeightsSum = 0
  let creditedCount = 0

  applicableItems.forEach((item) => {
    const ans = answers[item.id]
    const isCredited = (item.isPositive && ans === "yes") || (!item.isPositive && ans === "no")
    if (isCredited) {
      creditedWeightsSum += item.riskWeight
      creditedCount++
    }
  })

  // Mean score per DSWD Annex X: Credited Weights ÷ Credited Items (Appendix method)
  const ffcScore = creditedCount > 0
    ? Math.max(1.00, Math.min(4.00, Math.round((creditedWeightsSum / creditedCount) * 100) / 100))
    : answeredItems.length > 0
      ? 1.00
      : 0

  const handleComplete = () => {
    const processedAnswers: any[] = []

    ffcItems.forEach((item) => {
      const ans = answers[item.id]
      const isNA = ans === "na"
      const isCredited = (item.isPositive && ans === "yes") || (!item.isPositive && ans === "no")

      processedAnswers.push({
        category: item.category,
        questionText: `${item.itemNumber}. ${item.statement}`,
        selectedAnswer: isNA ? "Not Applicable" : ans === "yes" ? "Yes" : ans === "no" ? "No" : "Unanswered",
        scoreWeight: isCredited ? item.riskWeight : 0,
        recommendedIntervention:
          (!item.isPositive && ans === "yes") || (item.isPositive && ans === "no")
            ? item.recommendedIntervention
            : undefined,
      })
    })

    const ffcCategories = new Set([
      "Positive Family Relationships",
      "Negative Family Relationships",
      "Positive Coping Style",
      "Parenting & Discipline",
      "Family Dynamics",
      "Socio-Economic Stressors",
    ])
    const currentAnswers = (useAppStore.getState().assessmentData.answers || []).filter(
      (a) => !ffcCategories.has(a.category),
    )

    setAssessmentData({
      ffcScore,
      ffcCheckedCount: creditedCount,
      ffcApplicableCount: applicableCount,
      ffcWeightSum: creditedWeightsSum,
      answers: [...currentAnswers, ...processedAnswers],
      notes: notes,
    })

    onNavigate("results")
  }

  const categories = [
    "Positive Family Relationships",
    "Negative Family Relationships",
    "Positive Coping Style",
  ] as const

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 transition-colors">
        <div className="flex items-center px-6 py-4 gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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
            Back to Hub
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">
              Family Functioning Checklist (FFC - 28 Items)
            </h1>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
        {/* Client info banner */}
        <div className="w-full flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {clientInitials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {clientName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentCaseId || "Unknown ID"} · DSWD FFC 28-Item Family Assessment Tool
            </p>
          </div>
        </div>

        {/* Real-Time Mathematical Indicator */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-indigo-200/80 dark:border-indigo-800/80 p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  DSWD Family Functioning Scoring (Annex X & Manual p. 19)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                  Credited Weights ÷ Credited Items
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  Credited Weights:{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-base">
                    {creditedWeightsSum}
                  </strong>
                </div>
                <span className="text-slate-300 dark:text-slate-600 font-bold text-base">÷</span>
                <div>
                  Credited Items:{" "}
                  <strong className="text-slate-900 dark:text-white font-bold text-base">
                    {creditedCount}
                  </strong>
                  <span className="text-xs text-slate-400 ml-1">
                    ({applicableCount} applicable, {ffcItems.length - answeredItems.length} unanswered)
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-600 font-bold text-base">=</span>
                <div>
                  Mean Score:{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {ffcScore > 0 ? ffcScore.toFixed(2) : "0.00"}
                  </strong>{" "}
                  <span className="text-xs text-slate-400">/ 4.00</span>
                </div>
              </div>
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-5 text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-0.5">
                FFC Classification
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                {getFfcDescription(ffcScore)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-8 text-center text-sm">
          Select <strong>Yes</strong>, <strong>No</strong>, or <strong>N/A</strong> for each family characteristic. For positive traits, <em>Yes</em> earns credit. For negative relationships, <em>No</em> earns credit (reflecting healthy functioning free of conflict).
        </p>

        <div className="w-full space-y-8">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Loading FFC items...
            </div>
          ) : (
            <>
              {categories.map((category, idx) => {
                const itemsInCategory = ffcItems.filter(
                  (item) => item.category === category,
                )
                if (itemsInCategory.length === 0) return null
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={category}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-white/50 dark:border-slate-700/60 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-indigo-500/10 to-transparent dark:from-indigo-900/40 px-8 py-5 border-b border-indigo-100 dark:border-slate-700 flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shadow-sm">
                          {idx + 1}
                        </span>
                        {category}
                      </h2>
                      <span className="text-xs font-semibold text-slate-400">
                        {itemsInCategory.length} Items
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100/60 dark:divide-slate-700/50 p-4 sm:p-6 space-y-3">
                      {itemsInCategory.map((item) => {
                        const ans = answers[item.id]
                        const isCredited = (item.isPositive && ans === "yes") || (!item.isPositive && ans === "no")

                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                              ans === "na"
                                ? "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60"
                                : isCredited
                                ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800/60"
                                : ans !== undefined
                                ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                                : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-400">
                                    Item #{item.itemNumber}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      item.isPositive
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                    }`}
                                  >
                                    {item.isPositive ? "Positive Trait (Ideal: Yes)" : "Risk / Conflict (Ideal: No)"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    Assigned Weight: {item.riskWeight}
                                  </span>
                                  {isCredited && (
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                                      +{item.riskWeight} pts credited
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                                  {item.statement}
                                </p>
                              </div>

                              {/* Segmented Yes / No / N/A Buttons */}
                              <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <button
                                  type="button"
                                  onClick={() => setItemAnswer(item.id, "yes")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    ans === "yes"
                                      ? "bg-indigo-600 text-white shadow-sm"
                                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  }`}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setItemAnswer(item.id, "no")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    ans === "no"
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  }`}
                                >
                                  No
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setItemAnswer(item.id, "na")}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    ans === "na"
                                      ? "bg-slate-600 text-white shadow-sm"
                                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                  }`}
                                >
                                  N/A
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}

              {/* Notes */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                  Overall Assessor Notes
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Enter overall clinical notes regarding the family's functioning..."
                  className="w-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-end w-full pb-12">
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-8 py-3.5 text-base font-bold text-white rounded-xl transition-all shadow-md hover:shadow-lg bg-indigo-600 hover:bg-indigo-700"
          >
            Submit FFC Evaluation
            <svg
              className="w-5 h-5"
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
        </div>
      </main>
    </div>
  )
}
