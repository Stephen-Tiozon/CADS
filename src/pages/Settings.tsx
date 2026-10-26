import React, { useState } from "react"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings"

interface SettingsProps {
  onNavigate: (page: Page) => void
  theme?: "light" | "dark" | "system"
  onThemeChange?: (theme: "light" | "dark" | "system") => void
}

import { useAppStore } from "../store"
import AssessmentSettings from "./AssessmentSettings"
import Cropper, { Area } from "react-easy-crop"
import getCroppedImg from "../utils/cropImage"

type Tab = "profile" | "notifications" | "security" | "assessments" | "system"

export default function Settings({
  onNavigate,
  theme = "light",
  onThemeChange,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const { currentUser, setCurrentUser } = useAppStore()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Image Crop State
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || "")
  const [username, setUsername] = useState(currentUser?.username || "")
  const [email, setEmail] = useState(currentUser?.email || "")
  const [profileMessage, setProfileMessage] = useState("")

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [securityMessage, setSecurityMessage] = useState("")

  // Notification Form State
  const [notifAssessments, setNotifAssessments] = useState(
    () => localStorage.getItem("notif_assessments") !== "false",
  )
  const [notifSla, setNotifSla] = useState(
    () => localStorage.getItem("notif_sla") !== "false",
  )
  const [notifWeekly, setNotifWeekly] = useState(
    () => localStorage.getItem("notif_weekly") === "true",
  )

  const handleSaveProfile = async () => {
    if (!currentUser) return
    try {
      const response = await fetch("/api/update_profile.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          fullName,
          username,
          email,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setProfileMessage("Profile updated successfully.")
        setCurrentUser({ ...currentUser, fullName, username, email })
        setTimeout(() => setProfileMessage(""), 3000)
      } else {
        setProfileMessage(data.error || "Failed to update profile.")
      }
    } catch (e) {
      setProfileMessage("Network error.")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setCropImage(reader.result?.toString() || null)
      setIsCropping(true)
    })
    reader.readAsDataURL(file)
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onCropComplete = React.useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleUploadCroppedAvatar = async () => {
    if (!cropImage || !croppedAreaPixels || !currentUser) return

    try {
      const croppedFile = await getCroppedImg(cropImage, croppedAreaPixels)
      if (!croppedFile) {
        setProfileMessage("Failed to crop image.")
        return
      }

      // Convert cropped file to Base64 Data URL to transmit via clean JSON payload
      // This bypasses free web host firewall blocks (403 Forbidden) on multipart/form-data
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(croppedFile)
      })

      const response = await fetch("/api/upload_avatar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          avatar: base64Data,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setCurrentUser({ ...currentUser, avatarUrl: data.avatarUrl })
        setProfileMessage("Avatar updated successfully.")
        setTimeout(() => setProfileMessage(""), 3000)
      } else {
        setProfileMessage(data.error || "Failed to upload avatar.")
      }
    } catch (e: any) {
      setProfileMessage(e?.message ? `Upload failed: ${e.message}` : "Network error during upload.")
    } finally {
      setIsCropping(false)
      setCropImage(null)
    }
  }

  const handleSaveSecurity = async () => {
    if (!currentUser) return
    if (newPassword !== confirmPassword) {
      setSecurityMessage("New passwords do not match.")
      return
    }
    if (!currentPassword || !newPassword) {
      setSecurityMessage("Please fill in all fields.")
      return
    }
    try {
      const response = await fetch("/api/update_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword,
          newPassword,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSecurityMessage("Password updated successfully.")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setSecurityMessage(""), 3000)
      } else {
        setSecurityMessage(data.error || "Failed to update password.")
      }
    } catch (e) {
      setSecurityMessage("Network error.")
    }
  }

  const handleToggleNotif = (
    key: string,
    value: boolean,
    setter: (val: boolean) => void,
  ) => {
    setter(value)
    localStorage.setItem(key, String(value))
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-[#0a1628] flex flex-col transition-colors relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Cropper Modal */}
      {isCropping && cropImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Adjust Avatar</h3>
            </div>
            <div className="relative h-64 sm:h-80 w-full bg-slate-100 dark:bg-slate-900/50">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-700/50">
              <div className="mb-5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Zoom Level</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => {
                    setZoom(Number(e.target.value))
                  }}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsCropping(false)
                    setCropImage(null)
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadCroppedAvatar}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                >
                  Save Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 px-8 py-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
        <div>
          <h1 className="font-extrabold text-slate-900 dark:text-white text-2xl tracking-tight">
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your account and global system preferences
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 relative z-10">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === "notifications"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === "security"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security & 2FA
          </button>

          <button
            onClick={() => setActiveTab("assessments")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === "assessments"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Question Banks
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === "system"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5"
                : "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            System
          </button>
        </div>

        {/* Setting Panels */}
        <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden transition-colors min-h-[600px]">
          {activeTab === "profile" && (
            <div className="p-8 lg:p-10">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">
                Profile Information
              </h2>

              <div className="flex items-center gap-8 mb-10">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold uppercase overflow-hidden shadow-lg shadow-blue-500/30">
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
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Change Avatar
                  </button>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium">
                    JPG, GIF or PNG. Max size of 5MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Username (for login)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={currentUser?.role === 'admin' ? 'Administrator' : 'Social Worker'}
                    disabled
                    className="w-full px-4 py-3 text-sm border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl text-slate-500 dark:text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-8">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {profileMessage}
                </span>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 dark:text-white">
                      New Assessments
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Get notified when a new CICL assessment is assigned to
                      you.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 dark:text-white">
                      SLA Warnings
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Receive alerts when an assessment is nearing its Service
                      Level Agreement deadline.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 dark:text-white">
                      Weekly Reports
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Get an email summary of your completed reports every
                      Monday.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifWeekly}
                      onChange={(e) =>
                        handleToggleNotif(
                          "notif_weekly",
                          e.target.checked,
                          setNotifWeekly,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">
                Security Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full max-w-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full max-w-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full max-w-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-8">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {securityMessage}
                </span>
                <button
                  onClick={handleSaveSecurity}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Update Password
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Add an extra layer of security to your account by enabling
                  two-factor authentication.
                </p>
                <button className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}
          {activeTab === "assessments" && <AssessmentSettings />}
          {activeTab === "system" && (
            <div className="p-8 lg:p-10">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">
                System Preferences
              </h2>

              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-widest">
                    Appearance
                  </h3>
                  <div className="grid grid-cols-3 gap-4 max-w-lg">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={theme === "light"}
                        onChange={() => onThemeChange?.("light")}
                        className="sr-only peer"
                      />
                      <div className="border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col items-center gap-3 peer-checked:border-blue-500 dark:peer-checked:border-blue-500 peer-checked:bg-blue-50/50 dark:peer-checked:bg-blue-900/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-400 peer-checked:text-blue-700 dark:peer-checked:text-blue-400">
                          Light
                        </span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={() => onThemeChange?.("dark")}
                        className="sr-only peer"
                      />
                      <div className="border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col items-center gap-3 peer-checked:border-blue-500 dark:peer-checked:border-blue-500 peer-checked:bg-blue-50/50 dark:peer-checked:bg-blue-900/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 shadow-inner flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-400 peer-checked:text-blue-700 dark:peer-checked:text-blue-400">
                          Dark
                        </span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={theme === "system"}
                        onChange={() => onThemeChange?.("system")}
                        className="sr-only peer"
                      />
                      <div className="border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col items-center gap-3 peer-checked:border-blue-500 dark:peer-checked:border-blue-500 peer-checked:bg-blue-50/50 dark:peer-checked:bg-blue-900/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div className="absolute inset-0 bg-slate-800 dark:bg-slate-900 w-1/2"></div>
                          <svg className="w-5 h-5 text-slate-400 dark:text-slate-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-400 peer-checked:text-blue-700 dark:peer-checked:text-blue-400">
                          System
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-2xl pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Language
                    </label>
                    <select className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all appearance-none">
                      <option>English (US)</option>
                      <option>Tagalog</option>
                      <option>Cebuano</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Timezone
                    </label>
                    <select className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all appearance-none text-ellipsis">
                      <option>(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi</option>
                      <option>(GMT+08:00) Kuala Lumpur, Singapore</option>
                      <option>(GMT+08:00) Taipei</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
