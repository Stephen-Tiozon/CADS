import { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { useAppStore } from "../store"
import { computeAssessmentResults } from "../utils/discernment"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings" | "case_details"
type Tab = "overview" | "assessment" | "notes" | "attachments"

interface CaseDetailsProps {
  onNavigate: (page: Page) => void
  caseId: string
}

interface CaseInfo {
  id: number
  formattedId: string
  firstName: string
  lastName: string
  alias: string
  dateOfBirth: string
  placeOfBirth: string
  highestEducation: string
  birthStatus: string
  disability: string
  presentAddress: string
  permanentAddress: string
  ageAtOffense: number
  age: number
  gender: string
  address: string
  contactNumber: string
  primaryGuardian: string
  offense: string
  offenseDate: string
  offenseLocation: string
  createdAt: string
  socialWorkerName?: string
  status: string
}

interface FamilyMember {
  id: number
  name: string
  relationship: string
  age: number
  occupation: string
}

interface AssessmentScores {
  lmdScore: number
  riskIndex: number
  ivjScore: number
  ffcScore: number
  cfcScore: number
}

interface DispositionPlan {
  id: number
  case_id: number
  disposition_type: string
  description: string
  start_date: string
  end_date: string
  status: string
  created_by_name: string
  created_at: string
}

interface CaseNote {
  id: number
  case_id: number
  social_worker_id: number
  note_date: string
  note_category: string
  note_content: string
  author_name: string
  created_at: string
}

interface CaseFile {
  id: number
  case_id: number
  file_name: string
  file_path: string
  uploaded_by: string
  uploaded_at: string
}

interface InterventionSession {
  id: number
  disposition_plan_id: number
  update_date: string
  update_type: string
  notes: string
  attendance: string
  raw_notes: string
  author_name: string | null
  created_at: string
}

const DISPOSITION_TYPES = [
  "Diversion Program",
  "Community-Based Rehabilitation",
  "Residential Care / Shelter",
  "Counseling & Therapy",
  "Educational Support Program",
  "Family Reunification",
  "Restorative Justice",
  "Probation / Supervised Release",
  "Vocational Training",
  "Other",
]

function ScoreBar({
  label,
  score,
  max,
  color,
  displayScore,
}: {
  label: string
  score: number
  max: number
  color: string
  displayScore?: string | number
}) {
  const pct = Math.min(Math.max(0, (score / max) * 100), 100)
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {label}
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          {displayScore !== undefined ? displayScore : score}/{max}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function CaseDetails({ onNavigate, caseId }: CaseDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [assessment, setAssessment] = useState<AssessmentScores | null>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [dispositions, setDispositions] = useState<DispositionPlan[]>([])
  const [notes, setNotes] = useState<CaseNote[]>([])
  const [files, setFiles] = useState<CaseFile[]>([])

  // Disposition form
  const [dispType, setDispType] = useState("")
  const [dispDesc, setDispDesc] = useState("")
  const [dispStart, setDispStart] = useState("")
  const [dispEnd, setDispEnd] = useState("")
  const [dispStatus, setDispStatus] = useState("Active")
  const [dispMessage, setDispMessage] = useState("")
  const [isSavingDisp, setIsSavingDisp] = useState(false)

  // Case note form
  const [noteCategory, setNoteCategory] = useState("General Note")
  const [noteContent, setNoteContent] = useState("")
  const [noteMessage, setNoteMessage] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)

  // Archiving
  const [isArchiving, setIsArchiving] = useState(false)

  // Attachments
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Intervention Tracker
  const [expandedDisp, setExpandedDisp] = useState<number | null>(null)
  const [sessions, setSessions] =
    useState<Record<number, InterventionSession[]>>({})
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0],
  )
  const [sessionType, setSessionType] = useState("Monthly Session")
  const [sessionAttendance, setSessionAttendance] = useState("Present")
  const [sessionNotes, setSessionNotes] = useState("")
  const [isSavingSession, setIsSavingSession] = useState(false)
  const [sessionMessage, setSessionMessage] = useState("")
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const currentUser = useAppStore((state) => state.currentUser)
  const contentRef = useRef<HTMLDivElement>(null)

  const setIntakeData = useAppStore((state) => state.setIntakeData)
  const setAssessmentData = useAppStore((state) => state.setAssessmentData)
  const setCurrentCaseId = useAppStore((state) => state.setCurrentCaseId)

  const handlePrint = () => {
    if (!caseInfo) return
    setCurrentCaseId(caseInfo.formattedId || caseId)
    setIntakeData({
      firstName: caseInfo.firstName || "",
      lastName: caseInfo.lastName || "",
      age: caseInfo.age || "",
      gender: caseInfo.gender || "",
      alias: caseInfo.alias || "",
      dateOfBirth: caseInfo.dateOfBirth || "",
      placeOfBirth: caseInfo.placeOfBirth || "",
      highestEducation: caseInfo.highestEducation || "",
      birthStatus: caseInfo.birthStatus || "",
      disability: caseInfo.disability || "",
      presentAddress: caseInfo.presentAddress || caseInfo.address || "",
      permanentAddress: caseInfo.permanentAddress || "",
      ageAtOffense: caseInfo.ageAtOffense || "",
      contactNumber: caseInfo.contactNumber || "",
      offense: caseInfo.offense || "",
      offenseDate: caseInfo.offenseDate || "",
      offenseLocation: caseInfo.offenseLocation || "",
      primaryGuardian: caseInfo.primaryGuardian || "",
      createdAt: caseInfo.createdAt || "",
      socialWorkerName: caseInfo.socialWorkerName || currentUser?.fullName || "",
      familyMembers: (familyMembers || []).map((fm) => ({
        name: fm.name,
        relationship: fm.relationship,
        age: typeof fm.age === "number" ? fm.age : (parseInt(String(fm.age), 10) || ""),
        occupation: fm.occupation || "",
      })),
    })

    if (assessment) {
      setAssessmentData({
        lmdScore: assessment.lmdScore || 0,
        ivjScore: assessment.ivjScore || 0,
        cfcScore: assessment.cfcScore || 0,
        ffcScore: assessment.ffcScore || 0,
        riskIndex: assessment.riskIndex || 0,
        answers: answers || []
      })
    }
    
    onNavigate("results")
  }

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const numericId = parseInt(caseId.replace(/CICL-\d{4}-/, ""), 10)
        const response = await fetch(`/api/get_case_details.php?id=${numericId}`)
        const data = await response.json()
        if (data.success) {
          setCaseInfo(data.case)
          setFamilyMembers(data.familyMembers || [])
          setAssessment(data.assessment || null)
          setAnswers(data.answers || [])
          setDispositions(data.dispositions || [])
          setNotes(data.notes || [])
          setFiles(data.files || [])
        }
      } catch (err) {
        console.error("Failed to fetch case details", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDetails()
  }, [caseId])

  const handleSaveDisposition = async () => {
    if (!caseInfo || !dispType) return
    setIsSavingDisp(true)
    try {
      const response = await fetch("/api/save_disposition.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseInfo.id,
          dispositionType: dispType,
          description: dispDesc,
          startDate: dispStart,
          endDate: dispEnd,
          status: dispStatus,
          createdBy: currentUser?.id,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setDispMessage("Disposition plan saved successfully!")
        // Refresh dispositions
        const res = await fetch(`/api/get_case_details.php?id=${caseId}`)
        const refreshed = await res.json()
        if (refreshed.success) setDispositions(refreshed.dispositions || [])
        // Reset form
        setDispType("")
        setDispDesc("")
        setDispStart("")
        setDispEnd("")
        setDispStatus("Active")
        setTimeout(() => setDispMessage(""), 3000)
      } else {
        setDispMessage(data.error || "Failed to save.")
      }
    } catch {
      setDispMessage("Network error.")
    } finally {
      setIsSavingDisp(false)
    }
  }

  const handleAddNote = async () => {
    if (!caseInfo || !noteContent.trim()) return
    setIsSavingNote(true)
    try {
      const response = await fetch("/api/save_case_note.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseInfo.id,
          socialWorkerId: currentUser?.id,
          noteCategory: noteCategory,
          noteContent: noteContent.trim(),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setNotes((prev) => [data.note, ...prev])
        setNoteContent("")
        setNoteCategory("General Note")
        setNoteMessage("Note added successfully!")
        setTimeout(() => setNoteMessage(""), 3000)
      } else {
        setNoteMessage(data.error || "Failed to add note.")
      }
    } catch {
      setNoteMessage("Network error.")
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>, droppedFile?: File) => {
    let file: File;
    if (droppedFile) {
      file = droppedFile;
    } else {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      file = target.files[0];
    }
    
    if (!caseInfo) return
    
    const formData = new FormData()
    formData.append("case_id", caseInfo.id.toString())
    formData.append("file", file)
    formData.append("uploaded_by", currentUser?.fullName || "Unknown")

    setIsUploadingFile(true)
    setUploadMessage("")
    try {
      const response = await fetch("/api/upload_case_file.php", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setFiles((prev) => [data.file, ...prev])
        setUploadMessage("File uploaded successfully!")
      } else {
        setUploadMessage(data.error || "Failed to upload file.")
      }
    } catch {
      setUploadMessage("Network error during upload.")
    } finally {
      setIsUploadingFile(false)
      setTimeout(() => setUploadMessage(""), 4000)
      if ('target' in e && (e.target as any).value) {
        (e.target as any).value = "" // Reset input
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e, e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const handleDeleteFile = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    try {
      const response = await fetch("/api/delete_case_file.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (data.success) {
        setFiles(files.filter(f => f.id !== id))
      } else {
        alert(data.error || "Failed to delete file")
      }
    } catch {
      alert("Network error.")
    }
  }

  const handleUpdateDispositionStatus = async (
    dispId: number,
    newStatus: string,
  ) => {
    try {
      const response = await fetch("/api/update_disposition_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispositionId: dispId,
          status: newStatus,
        }),
      })
      const data = await response.json()
      if (data.success) {
        // Refresh dispositions
        const res = await fetch(`/api/get_case_details.php?id=${caseId}`)
        const refreshed = await res.json()
        if (refreshed.success) setDispositions(refreshed.dispositions || [])
      }
    } catch {
      console.error("Failed to update status")
    }
  }

  const handleArchiveCase = async () => {
    if (
      !window.confirm(
        "Are you sure you want to archive this case? It will be removed from the active dashboard.",
      )
    )
      return
    setIsArchiving(true)
    try {
      const response = await fetch("/api/archive_case.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: caseInfo?.id }),
      })
      const data = await response.json()
      if (data.success) {
        onNavigate("dashboard")
      } else {
        alert(data.error || "Failed to archive case")
      }
    } catch {
      alert("Network error.")
    } finally {
      setIsArchiving(false)
    }
  }

  const statusStyles: Record<string, string> = {
    Safe: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    Urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  }

  const dispStatusStyles: Record<string, string> = {
    Active: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    Completed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    "Successfully Completed":
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    Cancelled:
      "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  }

  const SESSION_TYPES = [
    "Monthly Session",
    "Rehab Check-in",
    "Home Visit",
    "Court Update",
    "General Progress",
  ]
  const ATTENDANCE_OPTIONS = ["Present", "Absent", "Excused"]

  const sessionTypeIcons: Record<string, string> = {
    "Monthly Session":
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    "Rehab Check-in":
      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    "Home Visit":
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    "Court Update":
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    "General Progress":
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  }

  const attendanceColors: Record<string, string> = {
    Present:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Absent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    Excused:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  }

  const handleExpandDisposition = async (dispId: number) => {
    if (expandedDisp === dispId) {
      setExpandedDisp(null)
      return
    }
    setExpandedDisp(dispId)
    // Fetch sessions if not cached
    if (!sessions[dispId]) {
      setIsLoadingSessions(true)
      try {
        const res = await fetch(
          `/api/get_intervention_sessions.php?disposition_plan_id=${dispId}`,
        )
        const data = await res.json()
        if (data.success) {
          setSessions((prev) => ({ ...prev, [dispId]: data.sessions }))
        }
      } catch {
        console.error("Failed to fetch sessions")
      } finally {
        setIsLoadingSessions(false)
      }
    }
  }

  const handleSaveSession = async (dispId: number) => {
    if (!sessionNotes.trim()) return
    setIsSavingSession(true)
    try {
      const res = await fetch("/api/save_intervention_session.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispositionPlanId: dispId,
          sessionDate,
          sessionType,
          notes: sessionNotes.trim(),
          attendance: sessionAttendance,
          createdBy: currentUser?.id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        // Add author name from current user
        data.session.author_name = currentUser?.fullName || null
        setSessions((prev) => ({
          ...prev,
          [dispId]: [data.session, ...(prev[dispId] || [])],
        }))
        setSessionNotes("")
        setSessionDate(new Date().toISOString().split("T")[0])
        setSessionType("Monthly Session")
        setSessionAttendance("Present")
        setSessionMessage("Session logged successfully!")
        setTimeout(() => setSessionMessage(""), 3000)
      } else {
        setSessionMessage(data.error || "Failed to save session.")
      }
    } catch {
      setSessionMessage("Network error.")
    } finally {
      setIsSavingSession(false)
    }
  }

  // Compute intervention plans from answers
  const interventionPlans = Array.from(
    new Set(
      answers
        .filter((a: any) => a.recommended_intervention)
        .map((a: any) => a.recommended_intervention),
    ),
  ).filter(Boolean) as string[]

  let hasDiscernment: boolean | null = false
  let trueRiskIndex = 0
  let computation: ReturnType<typeof computeAssessmentResults> | null = null

  if (assessment) {
    computation = computeAssessmentResults({
      lmdScore: assessment.lmdScore,
      ivjScore: assessment.ivjScore,
      cfcScore: assessment.cfcScore,
      ffcScore: assessment.ffcScore,
    })
    hasDiscernment = computation.hasDiscernment

    trueRiskIndex =
      assessment.riskIndex > 0
        ? assessment.riskIndex
        : assessment.cfcScore + assessment.ffcScore
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading case details…
          </p>
        </div>
      </div>
    )
  }

  if (!caseInfo) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <p className="text-slate-500 dark:text-slate-400">Case not found.</p>
      </div>
    )
  }

  const tabs: { id: Tab, label: string, icon: string }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      id: "assessment",
      label: "Assessment",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      id: "notes",
      label: "Notes",
      icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
    },
    {
      id: "attachments",
      label: "Attachments",
      icon: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
    },
  ]

  return (
    <div ref={contentRef} className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Back to Dashboard"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {caseInfo.firstName} {caseInfo.lastName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[caseInfo.status] || statusStyles.Pending}`}
              >
                {caseInfo.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {caseInfo.formattedId} · Referred{" "}
              {new Date(caseInfo.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
              title="Print Report as PDF"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              onClick={handleArchiveCase}
              disabled={isArchiving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Archive Case"
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              {isArchiving ? "Archiving..." : "Archive"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mt-4 -mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
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
                  d={tab.icon}
                />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Case Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Case Timeline
              </h2>
              <div className="relative flex items-center justify-between max-w-2xl mx-auto mb-4">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-1000"
                  style={{
                    width: assessment ? "100%" : "0%",
                  }}
                />

                {/* Steps */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 bg-blue-600 text-white`}
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold mt-2 text-slate-800 dark:text-slate-200">
                    Intake Created
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(caseInfo.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 transition-colors ${
                      assessment
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
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
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-xs font-semibold mt-2 ${
                      assessment
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-500"
                    }`}
                  >
                    Discernment Assessment
                  </span>
                  <span className="text-xs text-slate-500">
                    {assessment ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    label: "Full Name",
                    value: `${caseInfo.firstName} ${caseInfo.lastName}`,
                  },
                  { label: "Age", value: caseInfo.age },
                  { label: "Gender", value: caseInfo.gender },
                  { label: "Present Address", value: caseInfo.presentAddress || caseInfo.address },
                  { label: "Permanent Address", value: caseInfo.permanentAddress },
                  {
                    label: "Primary Guardian",
                    value: caseInfo.primaryGuardian,
                  },
                  { label: "Contact Number", value: caseInfo.contactNumber },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={
                      item.label === "Address"
                        ? "sm:col-span-2 lg:col-span-3"
                        : ""
                    }
                  >
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium">
                      {item.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Offense Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Offense Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Offense
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium">
                    {caseInfo.offense || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Date of Offense
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium">
                    {caseInfo.offenseDate || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium">
                    {caseInfo.offenseLocation || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Family Composition */}
            {familyMembers.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-colors">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Family Composition
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Relationship
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Occupation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyMembers.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                        >
                          <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium">
                            {m.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {m.relationship}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {m.age}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {m.occupation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ASSESSMENT TAB */}
        {activeTab === "assessment" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {assessment ? (
              <>
                {/* Score Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-colors">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Assessment Scores (DSWD Manual Standard)
                  </h2>
                  <div className="space-y-5">
                    <ScoreBar
                      label="Levels of Moral Development (LMD) — Scaled Score"
                      score={computation?.lmdScaled || assessment.lmdScore}
                      max={6}
                      color="#3b82f6"
                      displayScore={`${computation?.lmdScaled || assessment.lmdScore} (${computation?.lmdLabel || "Stage"})`}
                    />
                    <ScoreBar
                      label="Index of Value Judgment (IVJ) — Scaled Score"
                      score={computation?.ivjScaled || 0}
                      max={6}
                      color="#8b5cf6"
                      displayScore={`${computation?.ivjScaled || 0} (Raw: ${assessment.ivjScore}/54)`}
                    />
                    <ScoreBar
                      label="Child Functioning Checklist (CFC) — Mean Score"
                      score={assessment.cfcScore}
                      max={4}
                      color="#10b981"
                      displayScore={`${Number(assessment.cfcScore).toFixed(2)} (${computation?.cfcLabel || "Functioning"})`}
                    />
                    <ScoreBar
                      label="Family Functioning Checklist (FFC) — Mean Score"
                      score={assessment.ffcScore}
                      max={4}
                      color="#06b6d4"
                      displayScore={`${Number(assessment.ffcScore).toFixed(2)} (${computation?.ffcLabel || "Functioning"})`}
                    />
                  </div>
                </div>

                {/* Quick Interpretation */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-colors">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Computed Results for Social Worker Review
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {computation?.isInvalid ? (
                      <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          ⚠️ Error: Score Out of Bounds
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
                          {computation.errorMessage || "Score lampas sa valid 1.00-6.00 range. Walang discernment conclusion na maipapakita."}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`p-4 rounded-xl border ${
                          hasDiscernment
                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        <p
                          className={`text-sm font-bold ${
                            hasDiscernment
                              ? "text-red-700 dark:text-red-400"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          Computed Result (For Social Worker Review):{" "}
                          {hasDiscernment
                            ? "At or above the 3.51 threshold"
                            : "Below the 3.51 threshold"}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Combined Average: {computation?.combinedAverageStr || "0.00"} ({computation?.discernmentLevel || "Unclassified"}).
                          {hasDiscernment
                            ? " Score is 3.51 - 6.00: Meets discernment threshold (Decision aid for Social Worker review)."
                            : " Score is 1.00 - 3.50: Below the 3.51 discernment threshold (Decision aid for Social Worker review)."}
                        </p>
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-xl border ${
                        (computation?.cfcScore || 0) <= 2.5
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          (computation?.cfcScore || 0) <= 2.5
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        Child & Family Status: {computation?.cfcLabel} / {computation?.ffcLabel}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        CFC Score: {Number(assessment.cfcScore).toFixed(2)}/4.00 · FFC Score: {Number(assessment.ffcScore).toFixed(2)}/4.00.
                      </p>
                    </div>

                    {interventionPlans.length > 0 && (
                      <div className="sm:col-span-2 mt-2 p-4 rounded-xl border bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                          Diversion & Intervention Plan
                        </p>
                        <p className="text-xs text-indigo-900/80 dark:text-indigo-200 mb-2">
                          Based on the specific risk indicators identified
                          during assessment, the following tailored
                          interventions are recommended:
                        </p>
                        <ul className="list-disc list-inside text-xs text-indigo-800 dark:text-indigo-300 space-y-1">
                          {interventionPlans.map((plan, i) => (
                            <li key={i}>{plan}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center transition-colors">
                <svg
                  className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  No assessment has been completed yet.
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Complete an assessment from the Dashboard to see results here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === "notes" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Add Note Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                Add Case Note
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                >
                  <option value="General Note">General Note</option>
                  <option value="Progress Report">Progress Report</option>
                  <option value="Incident">Incident</option>
                  <option value="Meeting Summary">Meeting Summary</option>
                </select>
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                placeholder="Type your case note here… (e.g., meeting summary, behavioral observation, progress update)"
                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {noteMessage}
                </span>
                <button
                  onClick={handleAddNote}
                  disabled={isSavingNote || !noteContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  {isSavingNote ? "Saving…" : "Add Note"}
                </button>
              </div>
            </div>

            {/* Notes Timeline */}
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0 uppercase">
                        {note.author_name?.[0] || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {note.author_name || "Unknown"}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                note.note_category === "Incident"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                  : note.note_category === "Progress Report"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                    : note.note_category === "Meeting Summary"
                                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                              }`}
                            >
                              {note.note_category || "General Note"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {new Date(note.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            {" · "}
                            {new Date(note.created_at).toLocaleTimeString(
                              "en-US",
                              { hour: "numeric", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 whitespace-pre-wrap">
                          {note.note_content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors">
                <p className="text-slate-400 dark:text-slate-500 text-sm">
                  No case notes yet. Add one above to start the timeline.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ATTACHMENTS TAB */}
        {activeTab === "attachments" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Case Files & Evidence
              </h2>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-all duration-200 ${
                  isDragging 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner" 
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploadingFile}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isUploadingFile 
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                  }`}
                >
                  {isUploadingFile ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {isDragging ? "Drop File Here" : "Select or Drop File to Upload"}
                    </>
                  )}
                </label>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Upload scanned documents, court orders, images, or birth certificates.
                </p>
                {uploadMessage && (
                  <p className={`mt-4 text-sm font-medium ${uploadMessage.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {uploadMessage}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Uploaded Documents ({files.length})
                </h3>
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map(file => {
                      const isImage = file.file_name.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
                      return (
                      <div key={file.id} className="flex items-start justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                        <div className="flex items-start gap-4 overflow-hidden">
                          {isImage ? (
                            <div 
                              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700"
                              onClick={() => setPreviewImage(`/api/${file.file_path}`)}
                            >
                              <img src={`/api/${file.file_path}`} alt={file.file_name} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="overflow-hidden py-1">
                            {isImage ? (
                              <button 
                                onClick={() => setPreviewImage(`/api/${file.file_path}`)}
                                className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors text-left"
                                title={file.file_name}
                              >
                                {file.file_name}
                              </button>
                            ) : (
                              <a 
                                href={`/api/${file.file_path}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors"
                                title={file.file_name}
                              >
                                {file.file_name}
                              </a>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                              <span>{file.uploaded_by}</span>
                              <span>•</span>
                              <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                          title="Delete File"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <p className="text-slate-400 dark:text-slate-500">No attachments found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
              <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
                onClick={() => setPreviewImage(null)}
              >
                <div 
                  className="relative max-w-5xl max-h-full flex items-center justify-center"
                  onClick={e => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full p-2"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-slate-700" 
                  />
                  <div className="absolute -bottom-12 left-0 right-0 text-center">
                    <a 
                      href={previewImage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in New Tab
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
