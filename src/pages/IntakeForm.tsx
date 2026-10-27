import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppStore } from "../store"

type Page = "dashboard" | "intake" | "assessment" | "results" | "settings"

interface IntakeFormProps {
  onNavigate: (page: Page) => void
}

const steps = [
  { id: 1, label: "Identifying Data", desc: "Personal information" },
  { id: 2, label: "Family Composition", desc: "Household members" },
  { id: 3, label: "Circumstances", desc: "Offense & background" },
  { id: 4, label: "Review & Submit", desc: "Confirm and save" },
]

const offenses = [
  "Theft / Robbery",
  "Physical Assault",
  "Vandalism",
  "Illegal Drug Use",
  "Truancy / Absenteeism",
  "Shoplifting",
  "Cybercrime",
  "Sexual Misconduct",
  "Other",
]

const intakeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  alias: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  highestEducation: z.string().min(1, "Highest education is required"),
  birthStatus: z.string().min(1, "Birth status is required"),
  disability: z.string().optional(),
  age: z.coerce.number().min(1, "Age is required"),
  ageAtOffense: z.coerce
    .number()
    .min(1, "Age at offense is required")
    .max(17, "Intake rejected: The individual was 18 years of age or older at the time of the offense and cannot be registered as a CICL under RA 9344."),
  gender: z.string().min(1, "Gender is required"),
  presentAddress: z.string().min(1, "Present address is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  contactNumber: z.string().min(1, "Contact is required"),
  familyMembers: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      relationship: z.string().min(1, "Relationship is required"),
      age: z.coerce.number().min(1, "Age is required"),
      occupation: z.string(),
    }),
  ),
  offense: z.string().min(1, "Offense is required"),
  offenseDate: z.string().min(1, "Date of incident is required"),
  offenseLocation: z.string().min(1, "Location is required"),
})

type IntakeFormData = z.infer<typeof intakeSchema>

export default function IntakeForm({ onNavigate }: IntakeFormProps) {
  const [step, setStep] = useState(1)
  const [offenseSearch, setOffenseSearch] = useState("")
  const [offenseOpen, setOffenseOpen] = useState(false)

  const setStoreIntakeData = useAppStore((state) => state.setIntakeData)
  const storeIntakeData = useAppStore((state) => state.intakeData)
  const currentCaseId = useAppStore((state) => state.currentCaseId)
  const setCurrentCaseId = useAppStore((state) => state.setCurrentCaseId)
  const currentUser = useAppStore((state) => state.currentUser)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema) as any,
    defaultValues: {
      firstName: storeIntakeData.firstName,
      lastName: storeIntakeData.lastName,
      alias: storeIntakeData.alias,
      dateOfBirth: storeIntakeData.dateOfBirth,
      placeOfBirth: storeIntakeData.placeOfBirth,
      highestEducation: storeIntakeData.highestEducation,
      birthStatus: storeIntakeData.birthStatus,
      disability: storeIntakeData.disability,
      age: storeIntakeData.age === "" ? undefined : storeIntakeData.age,
      ageAtOffense: storeIntakeData.ageAtOffense === "" ? undefined : storeIntakeData.ageAtOffense,
      gender: storeIntakeData.gender,
      presentAddress: storeIntakeData.presentAddress,
      permanentAddress: storeIntakeData.permanentAddress,
      contactNumber: storeIntakeData.contactNumber,
      offense: storeIntakeData.offense,
      offenseDate: storeIntakeData.offenseDate,
      offenseLocation: storeIntakeData.offenseLocation,
      familyMembers:
        storeIntakeData.familyMembers &&
        storeIntakeData.familyMembers.length > 0
          ? storeIntakeData.familyMembers.map((m) => ({
              ...m,
              age: m.age === "" ? undefined : m.age,
            })) as any
          : [
              { name: "", relationship: "", age: undefined, occupation: "" },
            ] as any,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyMembers",
  } as any)

  // Cast fields to the correct type to resolve editor red lines
  const familyFields =
    fields as unknown as IntakeFormData["familyMembers"][number] & {
      id: string
    }[]

  const selectedOffense = watch("offense")
  const formData = watch()
  const dob = watch("dateOfBirth")
  const offenseDate = watch("offenseDate")

  // Auto-compute Current Age and Age at Time of Offense from Date of Birth & Date of Offense
  useEffect(() => {
    if (dob) {
      const dobDate = new Date(dob)
      const today = new Date()
      if (!isNaN(dobDate.getTime())) {
        let curAge = today.getFullYear() - dobDate.getFullYear()
        const m = today.getMonth() - dobDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          curAge--
        }
        if (curAge >= 0 && curAge !== getValues("age")) {
          setValue("age", curAge, { shouldValidate: true })
        }
      }
    }

    if (dob && offenseDate) {
      const dobDate = new Date(dob)
      const offDate = new Date(offenseDate)
      if (!isNaN(dobDate.getTime()) && !isNaN(offDate.getTime())) {
        if (offDate >= dobDate) {
          let offAge = offDate.getFullYear() - dobDate.getFullYear()
          const m = offDate.getMonth() - dobDate.getMonth()
          if (m < 0 || (m === 0 && offDate.getDate() < dobDate.getDate())) {
            offAge--
          }
          if (offAge >= 0 && offAge !== getValues("ageAtOffense")) {
            setValue("ageAtOffense", offAge, { shouldValidate: true })
          }
        }
      }
    }
  }, [dob, offenseDate, setValue, getValues])

  const filteredOffenses = offenses.filter((o) =>
    o.toLowerCase().includes(offenseSearch.toLowerCase()),
  )

  const handleNextStep = async () => {
    let isValid = false
    if (step === 1) {
      const dobVal = watch("dateOfBirth")
      const offDateVal = watch("offenseDate")
      if (dobVal && offDateVal) {
        const dDob = new Date(dobVal)
        const dOff = new Date(offDateVal)
        const dToday = new Date()
        dToday.setHours(23, 59, 59, 999)

        if (dOff < dDob) {
          alert("Date of incident cannot be earlier than date of birth.")
          return
        }
        if (dOff > dToday) {
          alert("Date of incident cannot be a future date.")
          return
        }
      }

      const offAgeVal = watch("ageAtOffense")
      if (offAgeVal !== undefined && Number(offAgeVal) >= 18) {
        alert("Intake rejected: The individual was 18 years of age or older at the time of the offense and cannot be registered as a Child in Conflict with the Law (CICL) under RA 9344.")
        return
      }

      isValid = await trigger([
        "firstName",
        "lastName",
        "alias",
        "dateOfBirth",
        "offenseDate",
        "placeOfBirth",
        "highestEducation",
        "birthStatus",
        "disability",
        "age",
        "ageAtOffense",
        "gender",
        "presentAddress",
        "permanentAddress",
        "contactNumber",
      ])
    } else if (step === 2) {
      isValid = await trigger(["familyMembers"])
    } else if (step === 3) {
      isValid = await trigger(["offense", "offenseDate", "offenseLocation"])
    }

    if (isValid) {
      setStoreIntakeData(watch())
      setStep(step + 1)
    }
  }

  const onSubmit = async (data: any) => {
    if (step !== 4) {
      // Prevent premature submission (e.g., if user presses Enter in an input field)
      handleNextStep()
      return
    }
    setStoreIntakeData(data)
    setIsSaving(true)

    try {
      if (currentCaseId) {
        const response = await fetch("/api/update_case.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: currentCaseId, intakeData: data }),
        })
        const result = await response.json()
        if (!result.success) {
          alert(result.error || "Failed to update case.")
          setIsSaving(false)
          return
        }
      } else {
        const response = await fetch("/api/save_case.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intakeData: data,
            userId: currentUser?.id,
            userName: currentUser?.fullName || currentUser?.username || "Social Worker",
          }),
        })
        const result = await response.json()
        if (!result.success) {
          alert(result.error || "Failed to register new case.")
          setIsSaving(false)
          return
        }
        const currentYear = new Date().getFullYear()
        const newCaseId = `CICL-${currentYear}-${result.case_id.toString().padStart(4, "0")}`
        setCurrentCaseId(newCaseId)
      }
    } catch (error) {
      alert("Network error while registering case.")
      setIsSaving(false)
      return
    } finally {
      setIsSaving(false)
    }

    const childAge = Number(data.ageAtOffense || data.age || 0)
    const isExempt = childAge > 0 && childAge <= 15
    const promptMsg = isExempt
      ? "Intake record registered successfully! Client is statutorily exempt (≤15) under RA 9344 Sec. 6.\n\nWould you like to proceed to Section V Functioning Checklists now?"
      : "Intake record registered successfully! Case is registered with 'Pending Assessment' status.\n\nWould you like to proceed immediately to administer the Discernment Assessment?"

    if (window.confirm(promptMsg)) {
      onNavigate("assessment")
    } else {
      onNavigate("dashboard")
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-[#0a1628] transition-colors relative overflow-x-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Step Sidebar / Mobile Step Header */}
      <div className="w-full lg:w-72 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-slate-200/50 dark:border-white/10 p-4 sm:p-6 lg:p-8 flex-shrink-0 transition-colors z-10 flex flex-col">
        <button
          onClick={() => onNavigate("dashboard")}
          className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium mb-4 lg:mb-12 transition-all"
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
          Back to Dashboard
        </button>

        <div className="mb-2">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight">
            CICL Intake
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 sm:mt-1 leading-relaxed">
            Register a new Child in Conflict with the Law (CICL) case profile.
          </p>
        </div>

        {/* Mobile Stepper (< lg) */}
        <div className="lg:hidden mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />
            <div
              className="absolute left-6 top-3.5 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 -z-0"
              style={{
                width: `${((step - 1) / (steps.length - 1)) * 100}%`,
                maxWidth: "calc(100% - 48px)",
              }}
            />
            {steps.map((s) => {
              const done = s.id < step
              const active = s.id === step
              return (
                <div key={s.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                      done
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
                        : active
                          ? "bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                          : "bg-white/90 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    {done ? "✓" : s.id}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold truncate max-w-[65px] text-center ${
                      active
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : done
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {s.label.split(" ")[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Desktop Stepper (lg+) */}
        <div className="hidden lg:block relative mt-10 flex-1">
          {/* Track background */}
          <div
            className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full"
            style={{ zIndex: 0 }}
          />
          {/* Active track */}
          <div
            className="absolute left-[15px] top-2 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500 transition-all duration-700 rounded-full"
            style={{
              height: `${((step - 1) / (steps.length - 1)) * 100}%`,
              zIndex: 1,
            }}
          />
          <div className="space-y-10 relative">
            {steps.map((s) => {
              const done = s.id < step
              const active = s.id === step
              return (
                <div key={s.id} className="flex items-start gap-5 relative group">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 relative z-10 shadow-sm ${
                      done
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
                        : active
                          ? "bg-white dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 ring-4 ring-blue-500/10 dark:ring-blue-400/10"
                          : "bg-white/80 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {done ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    ) : (
                      s.id
                    )}
                  </div>
                  <div className={`pt-1 transition-all duration-300 ${active ? "translate-x-1" : ""}`}>
                    <p
                      className={`text-sm font-bold tracking-wide ${
                        active
                          ? "text-slate-900 dark:text-white"
                          : done
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      active ? "text-blue-600/80 dark:text-blue-400/80 font-medium" : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex flex-col z-10 w-full min-w-0">
        <div className="flex-1 p-3 sm:p-6 lg:p-12 overflow-y-auto custom-scrollbar flex justify-center items-start">
          <div className="w-full max-w-4xl">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl shadow-slate-200/50 dark:shadow-black/40 border border-white/50 dark:border-slate-700/50 overflow-hidden transition-colors flex flex-col min-h-[auto] lg:min-h-[600px]">
              
              {/* Header */}
              <div className="px-5 py-4 sm:px-10 sm:py-8 border-b border-slate-100/60 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 flex items-center justify-between">
                <div>
                  <motion.h3 
                    key={`title-${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
                  >
                    {steps[step - 1].label}
                  </motion.h3>
                  <motion.p 
                    key={`desc-${step}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 sm:mt-1.5"
                  >
                    {steps[step - 1].desc}
                  </motion.p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm">{step}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-medium text-xs sm:text-sm">/ {steps.length}</span>
                </div>
              </div>

              <div className="p-4 sm:p-8 lg:p-10 flex-1 flex flex-col">
                <form id="intake-form" className="flex-1 flex flex-col">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="space-y-7 flex-1"
                      >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            First Name
                          </label>
                          <input
                            type="text"
                            {...register("firstName")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                            placeholder="Enter first name"
                          />
                          {errors.firstName?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.firstName.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Last Name
                          </label>
                          <input
                            type="text"
                            {...register("lastName")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                            placeholder="Enter last name"
                          />
                          {errors.lastName?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.lastName.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            {...register("dateOfBirth")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                          />
                          {errors.dateOfBirth?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.dateOfBirth.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Date of Incident / Offense
                          </label>
                          <input
                            type="date"
                            {...register("offenseDate")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                          />
                          {errors.offenseDate?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.offenseDate.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Auto-Computed Ages from DOB and Date of Offense */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              Current Age
                            </label>
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                              Auto-computed
                            </span>
                          </div>
                          <input
                            type="number"
                            {...register("age")}
                            readOnly
                            tabIndex={-1}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl text-slate-900 dark:text-white font-bold cursor-not-allowed outline-none select-none"
                            placeholder="Calculated from Date of Birth"
                          />
                          {errors.age?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.age.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              Age at Time of Offense
                            </label>
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                              Auto-computed (RA 9344)
                            </span>
                          </div>
                          <input
                            type="number"
                            {...register("ageAtOffense")}
                            readOnly
                            tabIndex={-1}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl text-slate-900 dark:text-white font-bold cursor-not-allowed outline-none select-none"
                            placeholder="Calculated from DOB & Date of Incident"
                          />
                          {errors.ageAtOffense?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.ageAtOffense.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Statutory Banners based on ageAtOffense */}
                      {Boolean(formData.ageAtOffense && Number(formData.ageAtOffense) >= 18) && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-xs text-red-800 dark:text-red-200 flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-wider text-[11px] text-red-700 dark:text-red-300">
                              Intake Rejected: Not a CICL
                            </p>
                            <p className="mt-0.5 leading-relaxed">
                              The individual was 18 years of age or older ({formData.ageAtOffense} years old) at the time of the offense and cannot be registered as a Child in Conflict with the Law (CICL) under RA 9344. Case must be referred to the adult criminal justice system.
                            </p>
                          </div>
                        </div>
                      )}

                      {Boolean(formData.ageAtOffense && Number(formData.ageAtOffense) > 0 && Number(formData.ageAtOffense) <= 15) && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
                              Statutory Notice (RA 9344, Sec. 6 & Sec. 20)
                            </p>
                            <p className="mt-0.5 leading-relaxed">
                              Age at offense is 15 or below. Exempt from criminal liability under Section 6 of RA 9344, as amended by RA 10630. For referral to an intervention program (Section 20). For the social worker's confirmation.
                            </p>
                          </div>
                        </div>
                      )}

                      {Boolean(formData.age && formData.ageAtOffense && Number(formData.age) >= 18 && Number(formData.ageAtOffense) < 18) && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                          <span className="font-bold">ℹ️ Status:</span> Current age is {formData.age}, but age at offense was {formData.ageAtOffense} (under 18). Eligible as a Child in Conflict with the Law (CICL) pursuant to RA 9344.
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Alias
                          </label>
                          <input
                            type="text"
                            {...register("alias")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                            placeholder="Enter alias (Optional)"
                          />
                          {errors.alias?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.alias.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Contact Number
                          </label>
                          <input
                            type="tel"
                            {...register("contactNumber")}
                            placeholder="09XX XXX XXXX"
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                          />
                          {errors.contactNumber?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.contactNumber.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Place of Birth
                          </label>
                          <input
                            type="text"
                            {...register("placeOfBirth")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                            placeholder="Enter place of birth"
                          />
                          {errors.placeOfBirth?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.placeOfBirth.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Sex Assigned at Birth
                          </label>
                          <select
                            {...register("gender")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none appearance-none"
                          >
                            <option value="">Select sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          {errors.gender?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.gender.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Birth Status
                          </label>
                          <select
                            {...register("birthStatus")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none appearance-none"
                          >
                            <option value="">Select status</option>
                            <option value="Legitimate">Legitimate</option>
                            <option value="Illegitimate">Illegitimate</option>
                          </select>
                          {errors.birthStatus?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.birthStatus.message)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Highest Educ. Attained
                          </label>
                          <select
                            {...register("highestEducation")}
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none appearance-none"
                          >
                            <option value="">Select education</option>
                            <option value="Elementary Level">Elementary Level</option>
                            <option value="Elementary Graduate">Elementary Graduate</option>
                            <option value="High School Level">High School Level</option>
                            <option value="High School Graduate">High School Graduate</option>
                            <option value="College Level">College Level</option>
                            <option value="College Graduate">College Graduate</option>
                            <option value="Out of School Youth">Out of School Youth</option>
                            <option value="None">None</option>
                          </select>
                          {errors.highestEducation?.message && (
                            <p className="text-red-500 text-xs mt-1">
                              {String(errors.highestEducation.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          Disability
                        </label>
                        <input
                          type="text"
                          {...register("disability")}
                          className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                          placeholder="Enter disability (Optional)"
                        />
                        {errors.disability?.message && (
                          <p className="text-red-500 text-xs mt-1">
                            {String(errors.disability.message)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          Present Address
                        </label>
                        <input
                          type="text"
                          {...register("presentAddress")}
                          placeholder="House No., Street, Barangay, City/Municipality, Province"
                          className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                        />
                        {errors.presentAddress?.message && (
                          <p className="text-red-500 text-xs mt-1">
                            {String(errors.presentAddress.message)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          Permanent Address
                        </label>
                        <input
                          type="text"
                          {...register("permanentAddress")}
                          placeholder="House No., Street, Barangay, City/Municipality, Province"
                          className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                        />
                        {errors.permanentAddress?.message && (
                          <p className="text-red-500 text-xs mt-1">
                            {String(errors.permanentAddress.message)}
                          </p>
                        )}
                      </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        List all household members including the CICL.
                      </p>
                      <div className="border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-x-auto bg-white/30 dark:bg-slate-900/30">
                        <table className="w-full min-w-[550px] text-sm">
                          <thead className="bg-slate-100/50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700/80">
                            <tr>
                              {[
                                "Name",
                                "Relationship",
                                "Age",
                                "Occupation",
                                "",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {familyFields.map((field, index) => (
                              <tr
                                key={field.id}
                                className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors"
                              >
                                <td className="px-5 py-4 align-top w-[30%]">
                                  <input
                                    {...register(`familyMembers.${index}.name`)}
                                    className="w-full px-3.5 py-2 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Full Name"
                                  />
                                  {errors.familyMembers?.[index]?.name && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {String(
                                        errors.familyMembers?.[index]?.name
                                          ?.message,
                                      )}
                                    </p>
                                  )}
                                </td>
                                <td className="px-5 py-4 align-top w-[25%]">
                                  <input
                                    {...register(
                                      `familyMembers.${index}.relationship`,
                                    )}
                                    className="w-full px-3.5 py-2 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
                                    placeholder="e.g. Father"
                                  />
                                  {errors.familyMembers?.[index]
                                    ?.relationship && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {String(
                                        errors.familyMembers?.[index]
                                          ?.relationship?.message,
                                      )}
                                    </p>
                                  )}
                                </td>
                                <td className="px-5 py-4 align-top w-[15%]">
                                  <input
                                    type="number"
                                    {...register(`familyMembers.${index}.age`)}
                                    className="w-full px-3.5 py-2 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Age"
                                  />
                                  {errors.familyMembers?.[index]?.age && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {String(
                                        errors.familyMembers?.[index]?.age
                                          ?.message,
                                      )}
                                    </p>
                                  )}
                                </td>
                                <td className="px-5 py-4 align-top w-[25%]">
                                  <input
                                    {...register(
                                      `familyMembers.${index}.occupation`,
                                    )}
                                    className="w-full px-3.5 py-2 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Optional"
                                  />
                                </td>
                                <td className="px-5 py-4 text-right align-top w-[5%]">
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors mt-0.5"
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="bg-slate-50/80 dark:bg-slate-900/50 px-5 py-3 border-t-2 border-slate-200 dark:border-slate-700/80">
                          <button
                            type="button"
                            onClick={() =>
                              append({
                                name: "",
                                relationship: "",
                                age: undefined as any,
                                occupation: "",
                              })
                            }
                            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 transition-colors px-3 py-1.5 -ml-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
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
                                strokeWidth={3}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Add Family Member
                          </button>
                        </div>
                      </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                      <div className="space-y-6">
                        <div className="space-y-1.5 relative z-20">
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Offense Committed
                          </label>
                          <input type="hidden" {...register("offense")} />
                          <button
                            type="button"
                            onClick={() => setOffenseOpen(!offenseOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 rounded-xl text-left bg-white/50 dark:bg-slate-900/40 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                          >
                          <span
                            className={
                              selectedOffense
                                ? "text-slate-800 dark:text-white"
                                : "text-slate-400 dark:text-slate-500"
                            }
                          >
                            {selectedOffense || "Select offense type"}
                          </span>
                          <svg
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              offenseOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {errors.offense?.message && (
                          <p className="text-red-500 text-xs mt-1">
                            {String(errors.offense.message)}
                          </p>
                        )}

                        {offenseOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                              <input
                                type="text"
                                value={offenseSearch}
                                onChange={(e) =>
                                  setOffenseSearch(e.target.value)
                                }
                                placeholder="Search offense..."
                                className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto py-1">
                              {filteredOffenses.map((o) => (
                                <button
                                  key={o}
                                  type="button"
                                  onClick={() => {
                                    setValue("offense", o, {
                                      shouldValidate: true,
                                    })
                                    setOffenseOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400"
                                >
                                  {o}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              Date of Incident
                            </label>
                            <input
                              type="date"
                              {...register("offenseDate")}
                              className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
                            />
                            {errors.offenseDate?.message && (
                              <p className="text-red-500 text-xs mt-1">
                                {String(errors.offenseDate.message)}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              Place of Incident
                            </label>
                            <input
                              type="text"
                              {...register("offenseLocation")}
                              placeholder="Barangay, City"
                              className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
                            />
                            {errors.offenseLocation?.message && (
                              <p className="text-red-500 text-xs mt-1">
                                {String(errors.offenseLocation.message)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-200/50 dark:border-blue-800/50 rounded-2xl px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                            <svg
                              className="w-5 h-5 text-blue-600 dark:text-blue-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="mt-0.5">
                            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Ready to Submit</h4>
                            <p className="text-xs text-blue-800/70 dark:text-blue-200/70 mt-1">
                              Please review the information below. You can always edit it later from the Case Dashboard.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden bg-white/30 dark:bg-slate-900/30">
                          <div className="bg-slate-100/50 dark:bg-slate-800/50 px-5 py-3 border-b-2 border-slate-200 dark:border-slate-700/80">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              Identifying Data
                            </p>
                          </div>
                          <div className="px-5 py-4 divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="py-2.5 flex items-start gap-4">
                              <span className="text-xs font-semibold text-slate-500 w-24">Full Name</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.firstName} {formData.lastName}</span>
                            </div>
                            <div className="py-2.5 flex items-start gap-4">
                              <span className="text-xs font-semibold text-slate-500 w-24">Age / Sex</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.age} / {formData.gender}</span>
                            </div>
                            <div className="py-2.5 flex items-start gap-4">
                              <span className="text-xs font-semibold text-slate-500 w-24">Present Addr.</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.presentAddress || "—"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-2 border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden bg-white/30 dark:bg-slate-900/30">
                          <div className="bg-slate-100/50 dark:bg-slate-800/50 px-5 py-3 border-b-2 border-slate-200 dark:border-slate-700/80">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              Case Details
                            </p>
                          </div>
                          <div className="px-5 py-4 divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="py-2.5 flex items-start gap-4">
                              <span className="text-xs font-semibold text-slate-500 w-24">Offense</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.offense || "—"}</span>
                            </div>
                            <div className="py-2.5 flex items-start gap-4">
                              <span className="text-xs font-semibold text-slate-500 w-24">Date</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.offenseDate || "—"}</span>
                            </div>
                            <div className="py-2.5 flex items-start gap-4">
                              <span className="text-xs font-semibold text-slate-500 w-24">Location</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{formData.offenseLocation || "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Sticky Action Bar */}
              <div className="px-4 py-4 sm:px-10 sm:py-6 border-t border-slate-100/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-wrap gap-3 items-center justify-between">
                <button className="px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Save as Draft
                </button>
                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      Previous
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      key="next"
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl transition-all shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      key="submit"
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSaving}
                      className="px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:-translate-y-0.5"
                    >
                      {isSaving
                        ? "Saving..."
                        : currentCaseId
                          ? "Update Case Profile"
                          : "Submit Case Profile"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
