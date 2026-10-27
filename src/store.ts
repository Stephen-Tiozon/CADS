import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  username: string
  fullName: string
  email?: string
  role: string
  avatarUrl?: string
  loginTime?: number
  sessionToken?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: number
}

export interface FamilyMember {
  name: string
  relationship: string
  age: number | ""
  occupation: string
}

export interface IntakeData {
  firstName: string
  lastName: string
  age: number | ""
  gender: string
  alias: string
  dateOfBirth: string
  placeOfBirth: string
  highestEducation: string
  birthStatus: string
  disability: string
  presentAddress: string
  permanentAddress: string
  ageAtOffense: number | ""
  primaryGuardian: string
  contactNumber: string
  familyMembers: FamilyMember[]
  offense: string
  offenseDate: string
  offenseLocation: string
  createdAt?: string
  socialWorkerName?: string
}

export interface AssessmentAnswer {
  category: string
  questionText: string
  selectedAnswer: string
  scoreWeight: number
  recommendedIntervention?: string
}

export interface AssessmentData {
  lmdScore: number
  ivjScore: number
  riskIndex: number
  ffcScore: number
  cfcScore: number
  iviScore: number
  cfcCheckedCount?: number
  cfcWeightSum?: number
  cfcApplicableCount?: number
  ffcCheckedCount?: number
  ffcWeightSum?: number
  ffcApplicableCount?: number
  answers: AssessmentAnswer[]
  notes?: string
  narrativeFindings?: string
}

interface AppState {
  currentUser: User | null
  currentCaseId: string | null
  intakeData: IntakeData
  assessmentData: AssessmentData
  notifications: Notification[]
  setCurrentUser: (user: User | null) => void
  setCurrentCaseId: (id: string | null) => void
  setIntakeData: (data: Partial<IntakeData>) => void
  setAssessmentData: (data: Partial<AssessmentData>) => void
  setNotifications: (notifications: Notification[] | ((prev: Notification[]) => Notification[])) => void
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  clearNotifications: () => void
  resetState: () => void
}

const defaultIntakeData: IntakeData = {
  firstName: "",
  lastName: "",
  age: "",
  gender: "",
  alias: "",
  dateOfBirth: "",
  placeOfBirth: "",
  highestEducation: "",
  birthStatus: "",
  disability: "",
  presentAddress: "",
  permanentAddress: "",
  ageAtOffense: "",
  primaryGuardian: "",
  contactNumber: "",
  familyMembers: [{ name: "", relationship: "", age: "", occupation: "" }],
  offense: "",
  offenseDate: "",
  offenseLocation: "",
}

const defaultAssessmentData: AssessmentData = {
  lmdScore: 0,
  ivjScore: 0,
  riskIndex: 0,
  ffcScore: 0,
  cfcScore: 0,
  iviScore: 0,
  answers: [],
  notes: "",
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      currentCaseId: null,
      intakeData: defaultIntakeData,
      assessmentData: defaultAssessmentData,
      notifications: [],
      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentCaseId: (id) => set({ currentCaseId: id }),
      setIntakeData: (data) =>
        set((state) => ({
          intakeData: { ...state.intakeData, ...data },
        })),
      setAssessmentData: (data) =>
        set((state) => ({
          assessmentData: { ...state.assessmentData, ...data },
        })),
      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              ...notif,
              id: Math.random().toString(36).substring(7),
              read: false,
              createdAt: Date.now(),
            },
            ...state.notifications,
          ],
        })),
      setNotifications: (updaterOrNotifs) => 
        set((state) => ({ 
          notifications: typeof updaterOrNotifs === 'function' ? updaterOrNotifs(state.notifications) : updaterOrNotifs 
        })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),
      resetState: () =>
        set({
          currentCaseId: null,
          intakeData: defaultIntakeData,
          assessmentData: defaultAssessmentData,
        }),
    }),
    {
      name: "cads-app-storage",
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
)
