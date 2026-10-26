import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import LoginPage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import IntakeForm from "./pages/IntakeForm"
import Assessment from "./pages/Assessment"
import Results from "./pages/Results"
import Sidebar from "./components/Sidebar"
import Settings from "./pages/Settings"
import CaseDetails from "./pages/CaseDetails"
import { useAppStore } from "./store"

import Reports from "./pages/Reports"
import Users from "./pages/Users"
import AuditLogs from "./pages/AuditLogs"
import GlobalSearch from "./components/GlobalSearch"

type Page = "login" | "dashboard" | "intake" | "assessment" | "results" | "reports" | "users" | "settings" | "case_details" | "audit_logs"

const appPages = [
  "dashboard",
  "intake",
  "assessment",
  "results",
  "reports",
  "users",
  "settings",
  "audit_logs",
] as const
type AppPage = typeof appPages[number]

export default function App() {
  const { currentUser, setCurrentUser } = useAppStore()
  const [page, setPage] = useState<Page>(() => {
    const saved = sessionStorage.getItem("cad_page") as Page | null
    return currentUser ? (saved || "dashboard") : "login"
  })
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (
      localStorage.getItem("theme") as "light" | "dark" | "system" || "light"
    )
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(() => {
    return sessionStorage.getItem("cad_case_id") || null
  })

  useEffect(() => {
    if (page !== "login") {
      sessionStorage.setItem("cad_page", page)
    }
    if (selectedCaseId) {
      sessionStorage.setItem("cad_case_id", selectedCaseId)
    } else {
      sessionStorage.removeItem("cad_case_id")
    }
  }, [page, selectedCaseId])

  const navigateToCase = (caseId: string) => {
    setSelectedCaseId(caseId)
    setPage("case_details")
    setMobileMenuOpen(false)
  }

  // Session Expiration Check
  useEffect(() => {
    if (currentUser) {
      const now = Date.now()
      const loginTime = currentUser.loginTime || now
      if (now - loginTime > 24 * 60 * 60 * 1000) {
        // Expired
        setCurrentUser(null)
        setPage("login")
      } else if (page === "login") {
        // Prevent getting stuck on login page if logged in
        setPage("dashboard")
      }
    } else {
      if (page !== "login") setPage("login")
    }
  }, [currentUser, page, setCurrentUser])

  // Real-time Single Active Session Enforcement
  // If this user logs in on another device, this session is superseded and logged out automatically.
  useEffect(() => {
    if (!currentUser?.id || !currentUser?.sessionToken) return

    const verifyActiveSession = async () => {
      try {
        const res = await fetch("/api/check_session.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            sessionToken: currentUser.sessionToken,
          }),
        })
        const data = await res.json()
        if (!data.success && data.code === "SESSION_SUPERSEDED") {
          sessionStorage.setItem(
            "session_notice",
            "Your account was logged in from another device. You have been logged out for security."
          )
          sessionStorage.removeItem("cad_page")
          sessionStorage.removeItem("cad_case_id")
          setCurrentUser(null)
          setPage("login")
        }
      } catch (err) {
        // Transient network drops ignored
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        verifyActiveSession()
      }
    }

    window.addEventListener("focus", verifyActiveSession)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Periodic heartbeat check every 6 seconds
    const interval = setInterval(verifyActiveSession, 6000)

    return () => {
      window.removeEventListener("focus", verifyActiveSession)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(interval)
    }
  }, [currentUser, setCurrentUser])

  useEffect(() => {
    localStorage.setItem("theme", theme)
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Force light mode during print
  useEffect(() => {
    let wasDark = false;
    
    const handleBeforePrint = () => {
      const root = window.document.documentElement;
      if (root.classList.contains("dark")) {
        wasDark = true;
        root.classList.remove("dark");
      } else {
        wasDark = false;
      }
    };
    
    const handleAfterPrint = () => {
      if (wasDark) {
        window.document.documentElement.classList.add("dark");
      }
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const navigate = (p: Page) => {
    setPage(p)
    setMobileMenuOpen(false) // Close menu on navigation
  }

  if (page === "login") {
    return <LoginPage onLogin={() => navigate("dashboard")} />
  }

  // Assessment page has its own full-screen layout without sidebar
  if (page === "assessment") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="assessment"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          <Assessment onNavigate={(p) => navigate(p as Page)} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors print:block print:overflow-visible print:min-h-0">
      <GlobalSearch 
        onNavigateToCase={(id) => {
          setSelectedCaseId(id.toString())
          navigate("case_details")
        }} 
      />
      <Sidebar
        currentPage={page as AppPage}
        onNavigate={(p) => navigate(p as Page)}
        onLogout={async () => {
          if (currentUser?.id) {
            try {
              await fetch("/api/logout.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser.id }),
              })
            } catch (e) {}
          }
          setCurrentUser(null)
          sessionStorage.removeItem("cad_page")
          sessionStorage.removeItem("cad_case_id")
          navigate("login")
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen print:h-auto print:block">
        {/* Mobile Header */}
        <div className="lg:hidden print:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between z-20 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <img
              src="/cads-logo.jpg"
              alt="CADS Logo"
              className="h-8 w-auto object-contain rounded-md bg-white dark:bg-white/90 p-0.5"
            />
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">
              CADS
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Main Content Area with Animation */}
        <div className="flex-1 overflow-y-auto relative print:overflow-visible print:static">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-0 print:relative print:inset-auto"
            >
              <div className="min-h-full flex flex-col print:min-h-0 print:block">
                {page === "dashboard" && (
                  <Dashboard
                    onNavigate={(p) => navigate(p as Page)}
                    onViewCase={navigateToCase}
                  />
                )}
                {page === "intake" && (
                  <IntakeForm onNavigate={(p) => navigate(p as Page)} />
                )}
                {page === "results" && (
                  <Results onNavigate={(p) => navigate(p as Page)} />
                )}
                {page === "reports" && (
                  <Reports onNavigate={(p) => navigate(p as Page)} />
                )}
                {page === "users" && currentUser?.role === "admin" && (
                  <Users onNavigate={(p) => navigate(p as Page)} />
                )}
                {page === "users" && currentUser?.role !== "admin" && (
                   <div className="flex-1 flex items-center justify-center min-h-[50vh] text-slate-500 dark:text-slate-400">
                     <div className="text-center">
                       <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                       <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                       <p>You do not have permission to view the user management panel.</p>
                       <button onClick={() => navigate("dashboard")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Return to Dashboard</button>
                     </div>
                   </div>
                )}
                {page === "settings" && (
                  <Settings
                    onNavigate={(p) => navigate(p as Page)}
                    theme={theme}
                    onThemeChange={setTheme}
                  />
                )}
                {page === "case_details" && selectedCaseId && (
                  <CaseDetails
                    onNavigate={(p) => navigate(p as Page)}
                    caseId={selectedCaseId}
                  />
                )}
                {page === "audit_logs" && (
                  <AuditLogs />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
