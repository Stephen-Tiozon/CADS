import { useState } from "react"
import { useAppStore } from "../store"

type Page = "dashboard" | "intake" | "assessment" | "results" | "reports" | "users" | "settings" | "audit_logs"

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}

const navItems = [
  {
    id: "dashboard" as Page,
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    id: "intake" as Page,
    label: "CICL Intake",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    id: "assessment" as Page,
    label: "Assessments",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    id: "reports" as Page,
    label: "Reports",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "audit_logs" as Page,
    label: "Audit Logs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function Sidebar({
  currentPage,
  onNavigate,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { currentUser } = useAppStore()

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      <aside
        className={`print:hidden fixed lg:static top-0 left-0 z-50 h-[100dvh] flex flex-col transition-all duration-300 backdrop-blur-xl border-r border-white/10 ${
          isCollapsed ? "lg:w-20 w-64" : "w-64"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ 
          background: "linear-gradient(180deg, rgba(10,22,40,0.95) 0%, rgba(15,32,68,0.98) 100%)",
        }}
      >
        {/* Brand */}
        <div
          className="px-5 py-6 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors relative group overflow-hidden"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="Toggle Sidebar"
        >
          <div
            className={`flex items-center gap-3 relative z-10 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <img
              src="/cads-logo.jpg"
              alt="CADS Logo"
              className="h-10 w-auto object-contain rounded-xl bg-white p-1 flex-shrink-0 transition-all relative z-10 shadow-sm"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1 transition-all duration-300">
                <div className="text-white font-extrabold text-base tracking-wide flex items-center gap-2 leading-tight">
                  CADS
                </div>
                <div className="text-slate-300 text-[11px] font-medium tracking-tight whitespace-nowrap truncate" title="MSWDO · Discernment System">
                  MSWDO · Discernment System
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav
          className={`flex-1 py-6 space-y-1.5 overflow-y-auto custom-scrollbar ${isCollapsed ? "px-2" : "px-3"}`}
        >
          {!isCollapsed && (
            <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-widest px-3 mb-4 mt-2">
              Main Menu
            </p>
          )}
          {isCollapsed && <div className="w-6 h-px bg-white/10 mx-auto mb-4 mt-2" />}

          {(() => {
            const items = navItems.filter((item) => {
              // Assessments can only be administered by Social Workers (CADS Algorithm 1)
              if (currentUser?.role === "admin" && item.id === "assessment") {
                return false;
              }
              return true;
            });
            if (currentUser?.role === "admin") {
              items.push({
                id: "users" as Page,
                label: "Users",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              });
            }
            return items.map((item) => {
              const active = currentPage === item.id
              return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
                } rounded-xl text-sm font-semibold transition-all duration-300 text-left relative overflow-hidden group ${
                  active
                    ? "text-white shadow-lg shadow-blue-900/40"
                    : "text-blue-200/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-blue-700/80" />
                )}
                {active && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-full" />
                )}
                <span className={`relative z-10 transition-transform duration-300 ${active ? "text-white scale-110" : "text-blue-400/70 group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="relative z-10">{item.label}</span>}
              </button>
              )
            })
          })()}

          <div
            className={`pt-6 mt-6 border-t border-white/5 ${
              isCollapsed ? "px-0" : ""
            }`}
          >
            {!isCollapsed && (
              <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-widest px-3 mb-4">
                System
              </p>
            )}
            {isCollapsed && (
              <div className="w-6 h-px bg-white/10 mx-auto mb-4 hidden" />
            )}

            <button
              onClick={() => onNavigate("settings")}
              title={isCollapsed ? "Settings" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
              } rounded-xl text-sm font-semibold transition-all duration-300 text-left relative overflow-hidden group ${
                currentPage === "settings"
                  ? "text-white shadow-lg shadow-blue-900/40"
                  : "text-blue-200/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {currentPage === "settings" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
              )}
              {currentPage === "settings" && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-full" />
              )}
              <span
                className={`relative z-10 transition-transform duration-300 ${
                  currentPage === "settings" ? "text-white scale-110" : "text-blue-400/70 group-hover:scale-110"
                }`}
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
                    strokeWidth={1.75}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              {!isCollapsed && <span className="relative z-10">Settings</span>}
            </button>
          </div>
        </nav>

        {/* Search Hint */}
        {!isCollapsed && (
          <div className="px-4 py-3 mx-4 mb-4 rounded-lg bg-[#0f2044] border border-white/10 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Global Search</span>
            </div>
            <div className="flex items-center gap-1 opacity-70 font-mono bg-white/10 px-1.5 py-0.5 rounded">
              <span className="text-[10px]">CTRL</span>+<span className="text-[10px]">K</span>
            </div>
          </div>
        )}

        {/* User */}
        <div
          className={`pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/10 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "flex-col gap-3" : "gap-3"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 transition-all uppercase overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.fullName?.[0] || "U"
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 transition-all duration-300">
                <p className="text-white text-xs font-semibold truncate">
                  {currentUser?.fullName || "User"}
                </p>
                <p className="text-blue-400 text-xs truncate">
                  {currentUser?.role || "Social Worker"}
                </p>
              </div>
            )}
            <button
              onClick={onLogout}
              className={`text-blue-400/60 hover:text-red-400 transition-colors flex-shrink-0 ${
                isCollapsed ? "mt-1 p-2 bg-white/5 rounded-lg" : ""
              }`}
              title="Sign out"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
