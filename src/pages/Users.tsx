import { useState, useEffect } from "react"
import { useAppStore } from "../store"
import { motion, AnimatePresence } from "framer-motion"

type Page = "login" | "dashboard" | "intake" | "assessment" | "results" | "reports" | "users" | "settings" | "case_details"

interface UsersProps {
  onNavigate: (page: Page) => void
}

export default function Users({ onNavigate }: UsersProps) {
  const { currentUser } = useAppStore()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  
  // Form State
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("social_worker")
  const [password, setPassword] = useState("")
  
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/get_users.php")
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers()
    }
  }, [currentUser])

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">You do not have the required administrative privileges to view this page.</p>
          <button
            onClick={() => onNavigate("dashboard")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const openAddModal = () => {
    setEditingUser(null)
    setUsername("")
    setFullName("")
    setEmail("")
    setRole("social_worker")
    setPassword("")
    setErrorMsg("")
    setShowModal(true)
  }

  const openEditModal = (user: any) => {
    setEditingUser(user)
    setUsername(user.username)
    setFullName(user.fullName)
    setEmail(user.email || "")
    setRole(user.role)
    setPassword("") // Leave blank to not update password
    setErrorMsg("")
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate/delete this user? This cannot be undone.")) return
    
    try {
      const res = await fetch("/api/delete_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, requesterId: currentUser?.id })
      })
      const data = await res.json()
      if (data.success) {
        setUsers(users.filter(u => u.id !== id))
      } else {
        alert("Failed to delete user: " + data.error)
      }
    } catch (error) {
      alert("Network error.")
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg("")

    try {
      const payload = {
        id: editingUser?.id,
        username,
        fullName,
        email,
        role,
        password: password || undefined,
        requesterId: currentUser?.id
      }

      const res = await fetch("/api/save_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        fetchUsers() // Refresh list
      } else {
        setErrorMsg(data.error || "Failed to save user.")
      }
    } catch (error) {
      setErrorMsg("Network error occurred.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0a1628] transition-colors relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none" />

      <header className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 px-8 py-6 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="font-extrabold text-slate-900 dark:text-white text-2xl tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage system administrators and social workers</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Invite User
        </button>
      </header>

      <main className="flex-1 p-8 lg:p-12 z-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-white/50 dark:border-slate-700/50 overflow-hidden">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium tracking-wide">Loading staff directory...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b-2 border-slate-200 dark:border-slate-700/80">
                      <th className="px-8 py-5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Staff Member</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Username</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role / Status</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {users.map((user, index) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-white/60 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                              {user.fullName?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-base">{user.fullName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email || 'No email provided'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            @{user.username}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
                            }`}>
                              {user.role === 'admin' ? 'Administrator' : 'Social Worker'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                              Active
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </button>
                            {user.id !== currentUser?.id && (
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                    {editingUser ? "Edit User Profile" : "Invite New User"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Configure account details and permissions.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 rounded-xl transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSaveUser} className="p-8 space-y-5">
                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-bold border border-red-100 dark:border-red-800/50">
                    {errorMsg}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. Juan dela Cruz"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Username</label>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
                      placeholder="maria.abad"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role</label>
                    <select 
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="social_worker">Social Worker</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
                    placeholder="m.abad@mswdo.gov.ph"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {editingUser ? "Reset Password (Optional)" : "Initial Password"}
                  </label>
                  <input 
                    type="password" 
                    required={!editingUser}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <div className="pt-6 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700/50 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    {isSaving ? "Saving..." : editingUser ? "Save Changes" : "Send Invite"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
