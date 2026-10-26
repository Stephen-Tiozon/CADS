import { useState, useEffect } from "react"
import { LMDQuestion } from "./LMDAssessment"

interface IVJQuestion {
  id: number
  assessment_type: string
  statement: string
  is_reverse_scored: boolean
}

export interface ObsIndicator {
  id: number
  type: string
  category: string
  statement: string
  risk_weight: number
  recommended_intervention?: string
}

export default function AssessmentSettings() {
  const [activeTab, setActiveTab] = useState<"IVJ" | "LMD" | "CFC" | "FFC">(
    "IVJ",
  )
  const [ivjQuestions, setIvjQuestions] = useState<IVJQuestion[]>([])
  const [lmdQuestions, setLmdQuestions] = useState<LMDQuestion[]>([])
  const [cfcIndicators, setCfcIndicators] = useState<ObsIndicator[]>([])
  const [ffcIndicators, setFfcIndicators] = useState<ObsIndicator[]>([])
  const [loading, setLoading] = useState(true)

  // IVJ State
  const [isAddingIvj, setIsAddingIvj] = useState(false)
  const [editIvjId, setEditIvjId] = useState<number | null>(null)
  const [newStatement, setNewStatement] = useState("")
  const [newIsReverseScored, setNewIsReverseScored] = useState(false)

  // LMD State
  const [isAddingLmd, setIsAddingLmd] = useState(false)
  const [editLmdId, setEditLmdId] = useState<number | null>(null)
  const [newDilemma, setNewDilemma] = useState("")
  const [newOptions, setNewOptions] = useState<string[]>(Array(6).fill(""))
  const [newScores, setNewScores] = useState<number[]>([1, 2, 3, 4, 5, 6])

  // Observational State (CFC/FFC)
  const [isAddingObs, setIsAddingObs] = useState(false)
  const [editObsId, setEditObsId] = useState<number | null>(null)
  const [newObsCategory, setNewObsCategory] = useState("")
  const [newObsStatement, setNewObsStatement] = useState("")
  const [newObsRiskWeight, setNewObsRiskWeight] = useState(1)
  const [newObsIntervention, setNewObsIntervention] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resIvj, resLmd, resCfc, resFfc] = await Promise.all([
        fetch("/api/get_questions.php?type=IVJ"),
        fetch("/api/get_lmd_questions.php"),
        fetch("/api/get_observational_indicators.php?type=CFC"),
        fetch("/api/get_observational_indicators.php?type=FFC"),
      ])
      const dataIvj = await resIvj.json()
      const dataLmd = await resLmd.json()
      const dataCfc = await resCfc.json()
      const dataFfc = await resFfc.json()

      if (dataIvj.success) setIvjQuestions(dataIvj.questions)
      if (dataLmd.success) setLmdQuestions(dataLmd.questions)
      if (dataCfc.success) setCfcIndicators(dataCfc.indicators)
      if (dataFfc.success) setFfcIndicators(dataFfc.indicators)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // IVJ Handlers
  const handleSaveIvj = async () => {
    if (!newStatement.trim()) return
    try {
      const res = await fetch("/api/save_question.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editIvjId,
          assessment_type: "IVJ",
          statement: newStatement,
          is_reverse_scored: newIsReverseScored,
        }),
      })
      if ((await res.json()).success) {
        setIsAddingIvj(false)
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteIvj = async (id: number) => {
    if (!confirm("Are you sure you want to delete this IVJ question?")) return
    try {
      const res = await fetch("/api/delete_question.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if ((await res.json()).success) fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const startEditIvj = (q: IVJQuestion) => {
    setEditIvjId(q.id)
    setNewStatement(q.statement)
    setNewIsReverseScored(q.is_reverse_scored)
    setIsAddingIvj(true)
  }

  // LMD Handlers
  const handleSaveLmd = async () => {
    if (!newDilemma.trim() || newOptions.some((o) => !o.trim())) return
    try {
      const res = await fetch("/api/save_lmd_question.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editLmdId,
          dilemma: newDilemma,
          options: newOptions,
          scores: newScores,
        }),
      })
      if ((await res.json()).success) {
        setIsAddingLmd(false)
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteLmd = async (id: number) => {
    if (!confirm("Are you sure you want to delete this LMD dilemma?")) return
    try {
      const res = await fetch("/api/delete_lmd_question.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if ((await res.json()).success) fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const startEditLmd = (q: LMDQuestion) => {
    setEditLmdId(q.id)
    setNewDilemma(q.dilemma)
    setNewOptions(q.options)
    setNewScores(q.scores)
    setIsAddingLmd(true)
  }

  // Obs Handlers (CFC & FFC)
  const handleSaveObs = async () => {
    if (!newObsStatement.trim() || !newObsCategory.trim()) return
    try {
      const res = await fetch("/api/save_observational_indicator.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editObsId,
          type: activeTab,
          category: newObsCategory,
          statement: newObsStatement,
          risk_weight: newObsRiskWeight,
          recommended_intervention: newObsIntervention,
        }),
      })
      if ((await res.json()).success) {
        setIsAddingObs(false)
        fetchData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteObs = async (id: number) => {
    if (!confirm("Are you sure you want to delete this indicator?")) return
    try {
      const res = await fetch("/api/delete_observational_indicator.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if ((await res.json()).success) fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const startEditObs = (ind: ObsIndicator) => {
    setEditObsId(ind.id)
    setNewObsCategory(ind.category)
    setNewObsStatement(ind.statement)
    setNewObsRiskWeight(ind.risk_weight)
    setNewObsIntervention(ind.recommended_intervention || "")
    setIsAddingObs(true)
  }

  return (
    <div className="p-8 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Question Banks Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage standardized items and dilemmas for IVJ, LMD, CFC, and FFC assessment tools.
          </p>
        </div>

        {activeTab === "IVJ" ? (
          <button
            onClick={() => {
              setEditIvjId(null)
              setNewStatement("")
              setNewIsReverseScored(false)
              setIsAddingIvj(true)
            }}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            + Add IVJ Question
          </button>
        ) : activeTab === "LMD" ? (
          <button
            onClick={() => {
              setEditLmdId(null)
              setNewDilemma("")
              setNewOptions(Array(6).fill(""))
              setNewScores([1, 2, 3, 4, 5, 6])
              setIsAddingLmd(true)
            }}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            + Add LMD Dilemma
          </button>
        ) : (
          <button
            onClick={() => {
              setEditObsId(null)
              setNewObsCategory("")
              setNewObsStatement("")
              setNewObsRiskWeight(1)
              setNewObsIntervention("")
              setIsAddingObs(true)
            }}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            + Add Indicator
          </button>
        )}
      </div>

      <div className="flex overflow-x-auto custom-scrollbar bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-full sm:w-max mb-8 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
          {(["IVJ", "LMD", "CFC", "FFC"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setIsAddingIvj(false)
                setIsAddingLmd(false)
                setIsAddingObs(false)
              }}
              className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab === "IVJ"
                ? "Value Judgment"
                : tab === "LMD"
                  ? "Moral Dev"
                  : tab === "CFC"
                    ? "Child Functioning"
                    : "Family Functioning"}
            </button>
          ))}
        </div>

      {activeTab === "IVJ" && (
        <>
          {isAddingIvj && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-4 uppercase tracking-wide">
                {editIvjId ? "Edit Question" : "Add New Question"} (IVJ)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Statement
                  </label>
                  <textarea
                    value={newStatement}
                    onChange={(e) => setNewStatement(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="reverseScored"
                    checked={newIsReverseScored}
                    onChange={(e) => setNewIsReverseScored(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300"
                  />
                  <label
                    htmlFor="reverseScored"
                    className="text-sm text-slate-700 dark:text-slate-300"
                  >
                    Reverse Scored (Answering "Yes" indicates lack of
                    discernment / higher risk)
                  </label>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setIsAddingIvj(false)}
                    className="px-4 py-2 text-sm text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIvj}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Loading IVJ questions...
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Statement</th>
                    <th className="px-6 py-3 font-medium">Scoring Logic</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {ivjQuestions.map((q, idx) => (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{idx + 1}</td>
                      <td className="px-6 py-4 max-w-md">{q.statement}</td>
                      <td className="px-6 py-4">
                        {q.is_reverse_scored ? (
                          <span className="inline-flex px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                            Reverse (Yes = Bad)
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                            Normal (No = Bad)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => startEditIvj(q)}
                          className="text-blue-600 mr-4 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIvj(q.id)}
                          className="text-red-600 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "LMD" && (
        <>
          {isAddingLmd && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-4 uppercase tracking-wide">
                {editLmdId ? "Edit Dilemma" : "Add New Dilemma"} (LMD)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dilemma
                  </label>
                  <textarea
                    value={newDilemma}
                    onChange={(e) => setNewDilemma(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Options & Scores (1-6)
                  </label>
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex gap-3">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newOptions]
                          opts[i] = e.target.value
                          setNewOptions(opts)
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      />
                      <input
                        type="number"
                        value={newScores[i]}
                        onChange={(e) => {
                          const sc = [...newScores]
                          sc[i] = parseInt(e.target.value) || 0
                          setNewScores(sc)
                        }}
                        className="w-20 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 text-center"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setIsAddingLmd(false)}
                    className="px-4 py-2 text-sm text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLmd}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Loading LMD questions...
            </div>
          ) : (
            <div className="space-y-4">
              {lmdQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-slate-800 dark:text-white">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">
                        #{idx + 1}
                      </span>
                      {q.dilemma}
                    </h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEditLmd(q)}
                        className="text-blue-600 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLmd(q.id)}
                        className="text-red-600 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className="flex gap-2 items-start p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800"
                      >
                        <span className="font-bold text-slate-400 mt-0.5">
                          {q.scores[i]}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 leading-tight">
                          {opt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {lmdQuestions.length === 0 && (
                <div className="py-10 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
                  No LMD questions found. Add some above.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CFC / FFC SECTION */}
      {(activeTab === "CFC" || activeTab === "FFC") && (
        <>
          {isAddingObs && (
            <div className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 mb-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                {editObsId ? "Edit Indicator" : "Add New Indicator"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newObsCategory}
                    onChange={(e) => setNewObsCategory(e.target.value)}
                    placeholder="e.g. Cognitive/Intellectual, Family Dynamics"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Statement
                  </label>
                  <input
                    type="text"
                    value={newObsStatement}
                    onChange={(e) => setNewObsStatement(e.target.value)}
                    placeholder="e.g. Shows no remorse or empathy"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Risk Weight (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newObsRiskWeight}
                    onChange={(e) =>
                      setNewObsRiskWeight(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Recommended Intervention (Optional)
                  </label>
                  <input
                    type="text"
                    value={newObsIntervention}
                    onChange={(e) => setNewObsIntervention(e.target.value)}
                    placeholder="e.g. Cognitive Behavioral Therapy (CBT)"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddingObs(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveObs}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Save Indicator
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Loading indicators...
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === "CFC" ? cfcIndicators : ffcIndicators).map(
                (ind, idx) => (
                  <div
                    key={ind.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex items-start gap-4"
                  >
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold px-3 py-1 rounded border border-indigo-200 dark:border-indigo-800 mt-0.5">
                      +{ind.risk_weight}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        {ind.category}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                        {ind.statement}
                      </p>
                      {ind.recommended_intervention && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800">
                          ↳ Plan: {ind.recommended_intervention}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => startEditObs(ind)}
                        className="text-indigo-600 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteObs(ind.id)}
                        className="text-red-600 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ),
              )}
              {(activeTab === "CFC" ? cfcIndicators : ffcIndicators).length ===
                0 && (
                <div className="py-10 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
                  No indicators found for {activeTab}. Add some above.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
