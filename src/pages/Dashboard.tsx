import { useState, useEffect, useMemo, useRef } from "react"
import { useAppStore } from "../store"
import { motion, AnimatePresence } from "framer-motion"
import { exportToCSV } from "../utils/export"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings"

interface DashboardProps {
  onNavigate: (page: Page) => void
  onViewCase?: (caseId: string) => void
}

interface CaseData {
  id: string
  name: string
  age: number | string
  referral: string
  status: string
  sla: string
  offense: string
}

const statusStyles: Record<string, string> = {
  Safe: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  Pending:
    "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  Urgent:
    "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
}

export default function Dashboard({ onNavigate, onViewCase }: DashboardProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [offenseFilter, setOffenseFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("All Time")
  const [isArchivedView, setIsArchivedView] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [cases, setCases] = useState<CaseData[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const currentUser = useAppStore((state) => state.currentUser)
  const notifications = useAppStore((state) => state.notifications)
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead)
  const markAllNotificationsAsRead = useAppStore((state) => state.markAllNotificationsAsRead)
  const setIntakeData = useAppStore((state) => state.setIntakeData)
  const setAssessmentData = useAppStore((state) => state.setAssessmentData)
  const setCurrentCaseId = useAppStore((state) => state.setCurrentCaseId)
  const resetState = useAppStore((state) => state.resetState)

  const setNotifications = useAppStore((state) => state.setNotifications)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const fetchData = async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      try {
        const [resCases, resAnalytics, resNotifications] = await Promise.all([
          fetch(`/api/get_cases.php?archived=${isArchivedView ? "1" : "0"}`),
          fetch("/api/get_dashboard_analytics.php"),
          fetch("/api/get_notifications.php"),
        ])
        const resultCases = await resCases.json()
        const resultAnalytics = await resAnalytics.json()
        const resultNotifications = await resNotifications.json()

        if (resultCases.success) {
          setCases(resultCases.cases)
        }
        if (resultAnalytics.success) {
          setAnalytics(resultAnalytics)
        }
        if (resultNotifications.success) {
          // Merge read states with incoming backend notifications
          setNotifications((prevNotifs: any) => {
            const readIds = new Set(prevNotifs.filter((p: any) => p.read).map((p: any) => p.id));
            return resultNotifications.notifications.map((n: any) => ({
                 ...n,
                 read: readIds.has(n.id)
            }));
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        if (showLoading) setIsLoading(false)
      }
    }
    
    fetchData(true)
    
    // Real-time polling every 15 seconds
    intervalId = setInterval(() => {
      fetchData(false)
    }, 15000)

    return () => clearInterval(intervalId)
  }, [isArchivedView])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input when user presses '/'
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchFocused(true)
      }
      if (e.key === "Escape") {
        setIsSearchFocused(false)
        searchInputRef.current?.blur()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleViewReport = async (caseIdRaw: string) => {
    // Extract actual numeric ID from the CICL-YYYY-XXXX format
    const numericId = parseInt(caseIdRaw.replace(/CICL-\d{4}-/, ""), 10)

    try {
      const response = await fetch(`/api/get_case_details.php?id=${numericId}`)
      const result = await response.json()

      if (result.success) {
        const c = result.case || {}
        setIntakeData({
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          age: c.age || "",
          gender: c.gender || "",
          alias: c.alias || "",
          dateOfBirth: c.dateOfBirth || "",
          placeOfBirth: c.placeOfBirth || "",
          highestEducation: c.highestEducation || "",
          birthStatus: c.birthStatus || "",
          disability: c.disability || "",
          presentAddress: c.presentAddress || c.address || "",
          permanentAddress: c.permanentAddress || "",
          ageAtOffense: c.ageAtOffense || "",
          contactNumber: c.contactNumber || "",
          offense: c.offense || "",
          offenseDate: c.offenseDate || "",
          offenseLocation: c.offenseLocation || "",
          primaryGuardian: c.primaryGuardian || ""
        })

        if (result.assessment) {
          setAssessmentData({
            lmdScore: result.assessment.lmdScore || 0,
            ivjScore: result.assessment.ivjScore || 0,
            cfcScore: result.assessment.cfcScore || 0,
            ffcScore: result.assessment.ffcScore || 0,
            riskIndex: result.assessment.riskIndex || 0,
            answers: result.answers || []
          })
        }
        
        setCurrentCaseId(caseIdRaw)
        onNavigate("results")
      } else {
        alert(result.error || "Failed to load case details")
      }
    } catch (error) {
      alert("Network error while fetching case details")
    }
  }

  const handleEditCase = async (caseIdRaw: string) => {
    const numericId = parseInt(caseIdRaw.replace(/CICL-\d{4}-/, ""), 10)
    try {
      const response = await fetch(`/api/get_case_details.php?id=${numericId}`)
      const result = await response.json()
      if (result.success) {
        const c = result.case
        const mappedData = {
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          age: c.age || "",
          gender: c.gender || "",
          alias: c.alias || "",
          dateOfBirth: c.dateOfBirth || "",
          placeOfBirth: c.placeOfBirth || "",
          highestEducation: c.highestEducation || "",
          birthStatus: c.birthStatus || "",
          disability: c.disability || "",
          presentAddress: c.presentAddress || c.address || "",
          permanentAddress: c.permanentAddress || "",
          ageAtOffense: c.ageAtOffense || "",
          contactNumber: c.contactNumber || "",
          primaryGuardian: c.primaryGuardian || "",
          familyMembers:
            result.familyMembers && result.familyMembers.length > 0
              ? result.familyMembers.map((m: any) => ({
                  name: m.name || "",
                  relationship: m.relationship || "",
                  age: m.age?.toString() || "",
                  occupation: m.occupation || "",
                }))
              : [],
          offense: c.offense || "",
          offenseDate: c.offenseDate || "",
          offenseLocation: c.offenseLocation || "",
        }
        setIntakeData(mappedData)
        if (result.assessmentData) {
          setAssessmentData(result.assessmentData)
        }
        setCurrentCaseId(caseIdRaw)
        onNavigate("intake")
      } else {
        alert(result.error || "Failed to load case details for editing")
      }
    } catch (error) {
      alert("Network error while fetching case details")
    }
  }

  const handleStartAssessment = async (caseIdRaw: string) => {
    const numericId = parseInt(caseIdRaw.replace(/CICL-\d{4}-/, ""), 10)
    try {
      const response = await fetch(`/api/get_case_details.php?id=${numericId}`)
      const result = await response.json()
      if (result.success) {
        const c = result.case
        const mappedData = {
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          age: c.age || "",
          gender: c.gender || "",
          alias: c.alias || "",
          dateOfBirth: c.dateOfBirth || "",
          placeOfBirth: c.placeOfBirth || "",
          highestEducation: c.highestEducation || "",
          birthStatus: c.birthStatus || "",
          disability: c.disability || "",
          presentAddress: c.presentAddress || c.address || "",
          permanentAddress: c.permanentAddress || "",
          ageAtOffense: c.ageAtOffense || "",
          contactNumber: c.contactNumber || "",
          primaryGuardian: c.primaryGuardian || "",
          familyMembers:
            result.familyMembers && result.familyMembers.length > 0
              ? result.familyMembers.map((m: any) => ({
                  name: m.name || "",
                  relationship: m.relationship || "",
                  age: m.age?.toString() || "",
                  occupation: m.occupation || "",
                }))
              : [],
          offense: c.offense || "",
          offenseDate: c.offenseDate || "",
          offenseLocation: c.offenseLocation || "",
        }
        setIntakeData(mappedData)
        if (result.assessmentData) {
          setAssessmentData(result.assessmentData)
        }
        setCurrentCaseId(caseIdRaw)
        onNavigate("assessment")
      } else {
        alert(result.error || "Failed to load case details for assessment")
      }
    } catch (error) {
      alert("Network error while fetching case details")
    }
  }

  const handleArchiveCase = async (caseIdRaw: string) => {
    if (!confirm("Are you sure you want to archive this case?")) return

    const numericId = parseInt(caseIdRaw.replace(/CICL-\d{4}-/, ""), 10)

    try {
      const response = await fetch("/api/archive_case.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: numericId, requesterId: currentUser?.id }),
      })
      const result = await response.json()
      if (result.success) {
        setCases((prev) => prev.filter((c) => c.id !== caseIdRaw))
      } else {
        alert(result.error || "Failed to archive case")
      }
    } catch (error) {
      alert("Network error while archiving case")
    }
    setOpenMenu(null)
  }

  const handleRestoreCase = async (caseIdRaw: string) => {
    if (!confirm("Are you sure you want to restore this case?")) return

    const numericId = parseInt(caseIdRaw.replace(/CICL-\d{4}-/, ""), 10)

    try {
      const response = await fetch("/api/restore_case.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: numericId, requesterId: currentUser?.id }),
      })
      const result = await response.json()
      if (result.success) {
        setCases((prev) => prev.filter((c) => c.id !== caseIdRaw))
      } else {
        alert(result.error || "Failed to restore case")
      }
    } catch (error) {
      alert("Network error while restoring case")
    }
    setOpenMenu(null)
  }

  const uniqueOffenses = useMemo(() => {
    const offenses = new Set(cases.map((c) => c.offense))
    return ["All", ...Array.from(offenses)]
  }, [cases])

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return cases.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.offense?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
    )
  }, [cases, search])

  const filtered = cases.filter((c) => {
    const matchStatus = statusFilter === "All" || c.status === statusFilter
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.offense?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    const matchOffense = offenseFilter === "All" || c.offense === offenseFilter

    let matchDate = true
    if (dateFilter === "Last 30 Days") {
      const caseDate = new Date(c.referral)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      matchDate = caseDate >= thirtyDaysAgo
    } else if (dateFilter === "This Year") {
      const caseDate = new Date(c.referral)
      const thisYear = new Date().getFullYear()
      matchDate = caseDate.getFullYear() === thisYear
    }

    return matchStatus && matchSearch && matchOffense && matchDate
  })

  // Computed Stats
  const pendingCount = cases.filter((c) => c.status === "Pending").length
  const reportsCount = cases.filter((c) => c.status !== "Pending").length

  const STATUS_COLORS: Record<string, string> = {
    Safe: "#10b981",
    Pending: "#f59e0b",
    Urgent: "#ef4444",
  }

  const DISCERNMENT_COLORS: Record<string, string> = {
    "Very Poor": "#ef4444",
    "Poor": "#f97316",
    "Below Average": "#f59e0b",
    "Average": "#3b82f6",
    "Above Average": "#6366f1",
    "Superior": "#10b981",
  }

  const DISCERNMENT_TIERS = [
    { name: "Superior", range: "5.51 – 6.00", color: "#10b981" },
    { name: "Above Average", range: "5.01 – 5.50", color: "#6366f1" },
    { name: "Average", range: "3.51 – 5.00", color: "#3b82f6" },
    { name: "Below Average", range: "2.51 – 3.50", color: "#f59e0b" },
    { name: "Poor", range: "1.51 – 2.50", color: "#f97316" },
    { name: "Very Poor", range: "1.00 – 1.50", color: "#ef4444" },
  ]

  const GENDER_COLORS: Record<string, string> = {
    Female: "#6366f1", // Slate Indigo (Institutional)
    Male: "#2563eb",   // Royal Cobalt Blue
    Other: "#64748b",  // Neutral Slate
  }

  const totalAssessed = useMemo(() => {
    return analytics?.discernmentLevels
      ? analytics.discernmentLevels.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0)
      : 0
  }, [analytics])

  const activeDiscernmentLevels = useMemo(() => {
    return (analytics?.discernmentLevels || []).filter((item: any) => Number(item.value) > 0)
  }, [analytics])

  const totalGender = useMemo(() => {
    return analytics?.genderDistribution
      ? analytics.genderDistribution.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0)
      : cases.length
  }, [analytics, cases])

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors relative overflow-hidden">
      <style>{`
        .recharts-pie-sector {
          transition: filter 0.3s ease !important;
          cursor: pointer;
        }
        .recharts-pie-sector:hover {
          filter: brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.2));
        }
        .recharts-bar-rectangle {
          cursor: pointer;
        }
      `}</style>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 sticky top-0 z-30 transition-colors shadow-sm">
        <div ref={searchContainerRef} className="relative w-full md:flex-1 md:max-w-md group">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearch(e.target.value)
              setIsSearchFocused(true)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const el = document.getElementById("caseload-table")
                el?.scrollIntoView({ behavior: "smooth" })
                setIsSearchFocused(false)
              }
            }}
            placeholder="Search cases, ID, or names..."
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner dark:shadow-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                searchInputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd className="hidden md:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-none">
              /
            </kbd>
          )}

          {/* Live Search Results Dropdown */}
          <AnimatePresence>
            {isSearchFocused && search.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-[420px] flex flex-col"
              >
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Search Results ({searchResults.length})
                  </span>
                  <span>
                    Press <kbd className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px]">ESC</kbd> to close
                  </span>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-700/40">
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onViewCase?.(c.id)
                          setIsSearchFocused(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50/70 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {c.name}
                            </span>
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                              {c.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="truncate font-medium">{c.offense}</span>
                            <span>•</span>
                            <span>Age {c.age}</span>
                            <span>•</span>
                            <span>Ref: {c.referral}</span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              statusStyles[c.status] || "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {c.status}
                          </span>
                          <svg
                            className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No cases found
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        No cases matching &ldquo;{search}&rdquo;. Try another name, ID, or offense.
                      </p>
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {searchResults.length > 6
                        ? `Showing 6 of ${searchResults.length} matches`
                        : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("caseload-table")
                        el?.scrollIntoView({ behavior: "smooth" })
                        setIsSearchFocused(false)
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      View in Case List &darr;
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto md:overflow-visible pb-1 md:pb-0 md:ml-auto">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm shrink-0 font-medium border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 md:px-4 py-2 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer shadow-sm"
          >
            <option value="All Time">All Time</option>
            <option value="This Year">This Year</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>

          <select
            value={offenseFilter}
            onChange={(e) => setOffenseFilter(e.target.value)}
            className="text-sm shrink-0 font-medium border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 md:px-4 py-2 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all max-w-[150px] truncate cursor-pointer shadow-sm"
          >
            {uniqueOffenses.map((offense) => (
              <option key={offense} value={offense}>
                {offense === "All" ? "All Offenses" : offense}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm shrink-0 font-medium border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 md:px-4 py-2 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Safe">Safe</option>
            <option value="Urgent">Urgent</option>
          </select>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative shrink-0 p-2 md:p-2.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800 animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Notifications
                    </h3>
                    <button
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-500">No new notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 ${
                              !n.read ? "bg-blue-50/40 dark:bg-blue-900/20" : ""
                            }`}
                          >
                            <div className="mt-0.5">
                              {n.type === "info" && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                              )}
                              {n.type === "warning" && (
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                              )}
                              {n.type === "error" && (
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                              )}
                              {n.type === "success" && (
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              )}
                            </div>
                            <div>
                              <p
                                className={`text-sm ${
                                  !n.read
                                    ? "font-bold text-slate-900 dark:text-white"
                                    : "font-medium text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {n.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 font-semibold tracking-wide uppercase">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-8 space-y-8 relative z-10">
        {/* Greeting / Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {currentUser?.fullName || "Assessor"}
              </h1>
              {currentUser?.role === "social_worker" ? (
                <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  RSW
                </span>
              ) : currentUser?.role === "admin" ? (
                <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Admin
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>GMA, Cavite MSWDO</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetState()
              onNavigate("intake")
            }}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Intake
          </button>
        </motion.div>

        {/* Metric Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            {
              label: "Active CICL Cases",
              value: isLoading ? "-" : cases.length.toString(),
              trend: "Total registered",
              trendUp: true,
              iconBg: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
            {
              label: "Pending Assessments",
              value: isLoading ? "-" : pendingCount.toString(),
              trend: "Requires evaluation",
              trendUp: false,
              iconBg: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              label: "Evaluated / Completed",
              value: isLoading ? "-" : reportsCount.toString(),
              trend: "Assessed records",
              trendUp: true,
              iconBg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
          ].map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              <div
                className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                  {card.value}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-xs font-medium ${card.trendUp ? 'text-slate-500 dark:text-slate-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    • {card.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Charts - Unified Institutional Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Cases per Month */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Cases per Month
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Monthly Intake & Caseload Inflow
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                  Past 12 Months
                </span>
              </div>
              <div className="h-[230px] w-full">
                {isLoading || !analytics?.casesPerMonth?.length ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                    {isLoading ? "Loading data..." : "No data available"}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.casesPerMonth}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCasesClinical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.95}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.65}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                        className="dark:stroke-slate-700/60"
                      />
                      <XAxis
                        dataKey={"month" as any}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "10px",
                          border: "1px solid #334155",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.2)",
                          color: "#f8fafc",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "#f8fafc", fontWeight: 600 }}
                        labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                        cursor={{ fill: "rgba(37, 99, 235, 0.08)" } as any}
                      />
                      <Bar
                        dataKey={"count" as any}
                        name="Cases"
                        fill="url(#colorCasesClinical)"
                        radius={[4, 4, 0, 0] as any}
                        activeBar={{ fill: '#1d4ed8' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Total Inflow: <strong className="text-slate-800 dark:text-slate-200">{cases.length} cases</strong></span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">GMA MSWDO</span>
            </div>
          </div>

          {/* Chart 2: Discernment Levels */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Discernment Levels
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    DSWD Standards (1.00 – 6.00 Scale)
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-full">
                  {totalAssessed} Assessed
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Donut with center total */}
                <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                  {isLoading || totalAssessed === 0 ? (
                    <div className="text-xs text-slate-400">No assessed cases</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activeDiscernmentLevels}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={68}
                            paddingAngle={3}
                            dataKey={"value" as any}
                          >
                            {activeDiscernmentLevels.map((entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={DISCERNMENT_COLORS[entry.name] || "#3b82f6"}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderRadius: "8px",
                              border: "1px solid #334155",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                          {totalAssessed}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          Assessed
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* 6-Tier Compact Breakdown Grid */}
                <div className="flex-1 w-full grid grid-cols-2 gap-2 text-xs">
                  {DISCERNMENT_TIERS.map((tier) => {
                    const match = analytics?.discernmentLevels?.find((d: any) => d.name === tier.name)
                    const count = Number(match?.value) || 0
                    const pct = totalAssessed > 0 ? ((count / totalAssessed) * 100).toFixed(0) : "0"

                    return (
                      <div
                        key={tier.name}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: tier.color }}
                            />
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] truncate" title={tier.name}>
                              {tier.name}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                            {count}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{tier.range}</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Discernment Scale: 1.00 – 6.00</span>
              <span className="text-slate-500">Sec. IV RA 9344</span>
            </div>
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Chart 3: Gender Distribution (Clean Cobalt & Slate-Indigo, NO HOT PINK) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Gender Demographics
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Caseload Distribution by Gender
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                  {totalGender} Total Clients
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Donut with center total */}
                <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                  {isLoading || !analytics?.genderDistribution?.length ? (
                    <div className="text-xs text-slate-400">No data available</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.genderDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={68}
                            paddingAngle={4}
                            dataKey={"value" as any}
                          >
                            {analytics.genderDistribution.map((entry: any, index: number) => {
                              const genderName = entry.name?.toLowerCase().includes("fem") ? "Female" : "Male"
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={GENDER_COLORS[genderName] || (index === 0 ? "#6366f1" : "#2563eb")}
                                />
                              )
                            })}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderRadius: "8px",
                              border: "1px solid #334155",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                          {totalGender}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          Clients
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Explicit Side Breakdown Cards */}
                <div className="flex-1 w-full space-y-3">
                  {(analytics?.genderDistribution || []).map((entry: any, idx: number) => {
                    const isFem = entry.name?.toLowerCase().includes("fem")
                    const label = isFem ? "Female" : "Male"
                    const color = isFem ? "#6366f1" : "#2563eb"
                    const count = Number(entry.value) || 0
                    const pct = totalGender > 0 ? ((count / totalGender) * 100).toFixed(1) : "0"

                    return (
                      <div
                        key={entry.name || idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-md"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {count} {count === 1 ? "case" : "cases"}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              ({pct}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Standard Institutional Palette</span>
              <span className="text-slate-500">Gender Ratio</span>
            </div>
          </div>

          {/* Chart 4: Age Demographics (Clinical Navy Blue, NO RANDOM GREEN) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    Age Demographics
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Statutory Age Brackets (RA 9344 / RA 10630)
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                  Age at Offense
                </span>
              </div>

              <div className="h-[170px] w-full">
                {isLoading || !analytics?.ageDistribution?.length ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                    {isLoading ? "Loading data..." : "No data available"}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.ageDistribution}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-700/60" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis dataKey={"name" as any} type="category" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "10px",
                          border: "1px solid #334155",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.2)",
                          color: "#f8fafc",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "#f8fafc", fontWeight: 600 }}
                        labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                        cursor={{ fill: "rgba(37, 99, 235, 0.08)" } as any}
                      />
                      <Bar
                        dataKey={"value" as any}
                        name="Clients"
                        fill="#2563eb"
                        radius={[0, 6, 6, 0] as any}
                        barSize={22}
                        activeBar={{ fill: '#1d4ed8' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Statutory Note Strip */}
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">12–15 yrs</span>
                    <span className="font-black text-blue-700 dark:text-blue-400 text-xs">25 cases</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">Statutorily Exempt (Sec. 6)</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">16–18 yrs</span>
                    <span className="font-black text-blue-700 dark:text-blue-400 text-xs">5 cases</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">Discernment Assessment</p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Jurisdiction: RA 9344 Sec. 6</span>
              <span className="text-slate-500">Juvenile Demographics</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div id="caseload-table" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-visible transition-colors mt-6 scroll-mt-24">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Case List
                </h2>
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium">
                    Search: &ldquo;{search}&rdquo;
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="hover:text-blue-800 dark:hover:text-blue-200 font-bold ml-0.5"
                      title="Clear search"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {filtered.length} cases matching filters
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                <button
                  onClick={() => setIsArchivedView(false)}
                  className={`flex-1 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    !isArchivedView
                      ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setIsArchivedView(true)}
                  className={`flex-1 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isArchivedView
                      ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Archived
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV(filtered, "cases_report.csv")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-600 hover:shadow-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>

                <button
                  onClick={() => {
                    resetState()
                    onNavigate("intake")
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:shadow-md whitespace-nowrap"
                  style={{ background: "#2a4f9e" }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Intake
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
                  {[
                    "Case ID",
                    "Client Name",
                    "Age",
                    "Referral Date",
                    "Offense",
                    "Status",
                    "SLA Countdown",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filtered.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors group"
                  >
                    <td
                      className="px-4 py-3.5 font-mono text-xs font-medium text-blue-700 dark:text-blue-400 cursor-pointer hover:underline"
                      onClick={() => onViewCase?.(row.id)}
                    >
                      {row.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-semibold flex-shrink-0">
                          {row.name
                            .split(" ")
                            .filter((n) => n.length > 0)
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {row.age}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {row.referral}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {row.offense}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.status.toLowerCase().includes("not applicable") ? (
                        <span
                          title="Statutorily Exempt from criminal responsibility under RA 9344 Sec. 6 (Age ≤ 15). Transferred to intervention program."
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          ⊘ Statutorily Exempt (≤15)
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            statusStyles[row.status] || "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {row.status === "Urgent" && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                          )}
                          {row.status === "Pending" && (
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5" />
                          )}
                          {row.status === "Pending" ? "Pending Assessment" : row.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-mono text-xs font-medium ${
                          row.status === "Urgent"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {row.sla}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === row.id ? null : row.id)
                        }
                        className={`p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${
                          openMenu === row.id
                            ? "opacity-100 bg-slate-100 dark:bg-slate-700"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      {openMenu === row.id && (
                        <div className="absolute right-4 top-10 z-30 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 py-1 w-40">
                          <button
                            onClick={() => {
                              onViewCase?.(row.id)
                              setOpenMenu(null)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            View Case
                          </button>
                          {row.status === "Pending" && (
                            <button
                              onClick={() => {
                                handleStartAssessment(row.id)
                                setOpenMenu(null)
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              Start Assessment
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleViewReport(row.id)
                              setOpenMenu(null)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            View Report
                          </button>
                          <button
                            onClick={() => {
                              handleEditCase(row.id)
                              setOpenMenu(null)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Edit Case
                          </button>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                          {currentUser?.role === 'admin' && (
                            <>
                              {isArchivedView ? (
                                <button
                                  onClick={() => handleRestoreCase(row.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  Restore
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleArchiveCase(row.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  Archive
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm"
                    >
                      No cases found matching your search.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm"
                    >
                      Loading cases...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
