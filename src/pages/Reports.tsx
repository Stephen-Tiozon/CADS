import { useState, useEffect } from "react"
import { useAppStore } from "../store"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings" | "reports"

interface ReportsProps {
  onNavigate: (page: Page) => void
}

export default function Reports({ onNavigate }: ReportsProps) {
  const [cases, setCases] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reportPeriod, setReportPeriod] = useState("all-time")
  const { currentUser } = useAppStore()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [resCases, resAnalytics] = await Promise.all([
          fetch(`/api/get_cases.php?archived=0`),
          fetch("/api/get_dashboard_analytics.php"),
        ])
        const resultCases = await resCases.json()
        const resultAnalytics = await resAnalytics.json()

        if (resultCases.success) {
          setCases(resultCases.cases)
        }
        if (resultAnalytics.success) {
          setAnalytics(resultAnalytics)
        }
      } catch (error) {
        console.error("Failed to fetch report data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const DISCERNMENT_COLORS: Record<string, string> = {
    "Low Discernment": "#ef4444",
    "Medium Discernment": "#f59e0b",
    "High Discernment": "#10b981",
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] transition-colors relative print:bg-white print:min-h-0 print:block">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
      
      {/* Background decoration for screen only */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-600/10 to-transparent dark:from-blue-600/5 pointer-events-none print:hidden" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none print:hidden" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none print:hidden" />

      {/* Top Bar - Hidden when printing */}
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 transition-colors print:hidden">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm flex-shrink-0"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 truncate">
              System Reports
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Comprehensive Analytics & Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <option value="all-time">All Time</option>
              <option value="this-year">This Year (2024)</option>
              <option value="last-month">Last Month</option>
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }}
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0"
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
            Export to PDF
          </button>
        </div>
      </header>

      {/* Screen Content - Modern Dashboard View */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10 print:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-500 font-medium animate-pulse">Gathering analytics...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Aggregate Case Analytics</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live Data • {reportPeriod === "all-time" ? "All Time to Date" : reportPeriod === "this-year" ? "Fiscal Year 2024" : "Last Month"}
                </p>
              </div>
            </div>

            {/* 1. Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-24 h-24 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Active Cases</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{cases.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-24 h-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Urgent / High Risk</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-4xl font-black text-red-600 dark:text-red-500 tracking-tight">{cases.filter(c => c.status === 'Urgent').length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-24 h-24 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-500/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Assessments</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-4xl font-black text-amber-600 dark:text-amber-500 tracking-tight">{cases.filter(c => c.status === 'Pending').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Charts / Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Intake Volume */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Intake Volume</h3>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">Past 6 Months</span>
                </div>
                <div className="h-64 flex-1">
                  {analytics?.casesPerMonth ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.casesPerMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey={(d: any) => d.month} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff', backdropFilter: 'blur(8px)' }}
                        />
                        <Bar dataKey={(d: any) => d.count} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Discernment Levels */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Discernment Levels</h3>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">Overall</span>
                </div>
                <div className="h-64 flex-1">
                  {analytics?.discernmentLevels ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.discernmentLevels}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey={(d: any) => d.value}
                          label={({ name, percent }: any) =>
                            percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
                          }
                          labelLine={false}
                        >
                          {analytics.discernmentLevels.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={DISCERNMENT_COLORS[entry.name] || "#3b82f6"} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff', backdropFilter: 'blur(8px)' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 3. Primary Risk Factors */}
              <div className="lg:col-span-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Common Risk Factors</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {analytics?.riskFactors && analytics.riskFactors.length > 0 ? (
                    <div className="space-y-5">
                      {analytics.riskFactors.map((rf: any, i: number) => (
                        <div key={i} className="group">
                          <div className="flex justify-between items-start text-sm mb-2 gap-4">
                            <span className="font-medium text-slate-700 dark:text-slate-300 leading-snug">
                              {rf.name}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                              {rf.count} cases
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-red-500 to-rose-400 h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                              style={{ width: `${Math.max(5, (rf.count / analytics.riskFactors[0].count) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-400">
                      No significant risk factors recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Active Caseload Registry */}
              <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center bg-white/40 dark:bg-slate-800/40">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Caseload Registry</h3>
                  <button onClick={() => onNavigate("dashboard")} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    View All &rarr;
                  </button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0">
                      <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">Case ID</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Client Name</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Offense</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {cases.slice(0, 10).map((c) => (
                        <tr key={c.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                            {c.id}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                              {c.name.charAt(0)}
                            </div>
                            {c.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {c.offense}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              c.status === "Urgent"
                                ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                                : c.status === "Pending"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                            }`}>
                              {c.status === "Urgent" && <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 mr-1.5 animate-pulse" />}
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {cases.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            No active cases found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- Print View (Hidden on Screen) --- */}
      <div className="hidden print:block print:p-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white text-black print:overflow-visible">
            {/* Report Header */}
            <div className="p-8 border-b border-black pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0 border-[#0f2044] text-[#0f2044]">
                    <svg viewBox="0 0 40 40" className="w-10 h-10">
                      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
                      <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      {[...Array(8)].map((_, i) => (
                        <line key={i} x1="20" y1="2" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" transform={`rotate(${i * 45} 20 20)`} />
                      ))}
                    </svg>
                  </div>
                  <div className="text-[#0f2044]">
                    <h2 className="text-sm font-bold uppercase tracking-widest">Republic of the Philippines</h2>
                    <p className="text-sm">Municipal Social Welfare and Development Office</p>
                    <p className="text-lg font-bold">GMA, Cavite MSWDO</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Generated On</p>
                  <p className="text-sm font-medium text-black">{currentDate}</p>
                </div>
              </div>

              <div className="text-center mt-8">
                <h1 className="text-2xl font-bold uppercase tracking-wider text-black">Aggregate Case Analytics Report</h1>
                <p className="text-sm text-gray-600 mt-2">Computerized Assessment of Discernment System (CADS)</p>
                <p className="text-sm font-semibold text-black mt-1">
                  Period: {reportPeriod === "all-time" ? "All Time to Date" : reportPeriod === "this-year" ? "Fiscal Year 2024" : "Last Month"}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-gray-500">Loading report data...</div>
            ) : (
              <div className="p-8 space-y-10">
                {/* 1. Summary Statistics */}
                <section>
                  <h3 className="text-lg font-bold text-black border-b-2 border-black pb-2 mb-6">1. Executive Summary</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="border border-gray-300 rounded-xl p-6 shadow-sm flex items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Total Active Cases</p>
                        <p className="text-3xl font-black text-black">{cases.length}</p>
                      </div>
                    </div>
                    <div className="border border-gray-300 rounded-xl p-6 shadow-sm flex items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Urgent/High Risk</p>
                        <p className="text-3xl font-black text-black">{cases.filter(c => c.status === 'Urgent').length}</p>
                      </div>
                    </div>
                    <div className="border border-gray-300 rounded-xl p-6 shadow-sm flex items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Pending Assessments</p>
                        <p className="text-3xl font-black text-black">{cases.filter(c => c.status === 'Pending').length}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Charts / Analytics */}
                <section className="print:break-inside-avoid">
                  <h3 className="text-lg font-bold text-black border-b-2 border-black pb-2 mb-6">2. Analytical Breakdown</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="border border-gray-300 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-black text-center mb-4">Intake Volume (Past 6 Months)</h4>
                      <div className="h-64 flex items-center justify-center">
                        {analytics?.casesPerMonth && (
                          <BarChart width={300} height={240} data={analytics.casesPerMonth} margin={{ top: 10, right: 10, bottom: 35, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey={(d: any) => d.month} tick={{ fontSize: 9, fill: '#000' }} angle={-45} textAnchor="end" dx={-5} dy={5} interval={0} />
                            <YAxis tick={{ fontSize: 10, fill: '#000' }} allowDecimals={false} />
                            <Bar dataKey={(d: any) => d.count} fill="#000" />
                          </BarChart>
                        )}
                      </div>
                    </div>
                    <div className="border border-gray-300 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-black text-center mb-4">Overall Discernment Levels</h4>
                      <div className="h-64 flex items-center justify-center">
                        {analytics?.discernmentLevels && (
                          <PieChart width={300} height={240} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                            <Pie
                              data={analytics.discernmentLevels}
                              cx="50%"
                              cy="45%"
                              innerRadius={40}
                              outerRadius={65}
                              dataKey={(d: any) => d.value}
                              label={({ name, percent }: any) => percent > 0 ? `${name.split(" ")[0]} (${(percent * 100).toFixed(0)}%)` : ""}
                              labelLine={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '3 3' }}
                            >
                              {analytics.discernmentLevels.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={DISCERNMENT_COLORS[entry.name] || "#3b82f6"} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={20} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          </PieChart>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Top Risk Factors */}
                <section className="print:break-inside-avoid">
                  <h3 className="text-lg font-bold text-black border-b-2 border-black pb-2 mb-4">3. Primary Risk Factors Identified</h3>
                  <div className="bg-white p-5 rounded-lg border border-gray-300">
                    {analytics?.riskFactors && analytics.riskFactors.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.riskFactors.map((rf: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-black">{i + 1}. {rf.name}</span>
                              <span className="font-bold text-black">{rf.count} cases</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-black h-full" style={{ width: `${Math.max(5, (rf.count / analytics.riskFactors[0].count) * 100)}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No significant risk factors recorded yet.</p>
                    )}
                  </div>
                </section>

                {/* 4. Active Caseload Registry */}
                <section className="print:mt-8">
                  <h3 className="text-lg font-bold text-black border-b-2 border-black pb-2 mb-4">4. Active Caseload Registry</h3>
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border border-gray-400 font-semibold text-black">Case ID</th>
                        <th className="px-3 py-2 border border-gray-400 font-semibold text-black">Client Name</th>
                        <th className="px-3 py-2 border border-gray-400 font-semibold text-black">Offense</th>
                        <th className="px-3 py-2 border border-gray-400 font-semibold text-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((c) => (
                        <tr key={c.id}>
                          <td className="px-3 py-2 border border-gray-400 font-mono text-xs text-black">{c.id}</td>
                          <td className="px-3 py-2 border border-gray-400 font-medium text-black">{c.name}</td>
                          <td className="px-3 py-2 border border-gray-400 text-black">{c.offense}</td>
                          <td className="px-3 py-2 border border-gray-400 text-black font-bold">{c.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                {/* Signatures */}
                <div className="mt-16 pt-8 grid grid-cols-2 gap-12 print:break-inside-avoid">
                  <div>
                    <div className="h-px bg-black mb-2" />
                    <p className="text-sm font-semibold text-black uppercase min-h-[1.25rem]">{currentUser?.fullName || ""}</p>
                    <p className="text-xs text-gray-600">Report Generator / {currentUser?.role?.replace("_", " ") || "Social Worker"}</p>
                  </div>
                  <div>
                    <div className="h-px bg-black mb-2" />
                    <p className="text-sm font-semibold text-black uppercase">Approved By (MSWDO Head)</p>
                    <p className="text-xs text-gray-600">Signature over printed name</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
