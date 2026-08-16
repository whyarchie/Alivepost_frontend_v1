"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { PatientSummaryView } from "@/components/patient-summary-view"
import {
  Phone, Search, ArrowLeft, User, Heart, Droplets, Calendar as CalendarIcon2,
  Activity, Pill, Plus, Clock, Stethoscope, Building2, FileText,
  AlertCircle, CheckCircle2, Shield, Loader2, Check, X, ListChecks, Smartphone, Sparkles, Trash2,
  Download, NotebookPen
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "sonner"
import {
  searchPatientByMobile,
  createMedicalHistory,
  createPatientCondition,
  assignMedicine,
  searchDisease,
  searchMedicine,
  searchDoctors,
  getPatientList,
  getPatientSummary,
  hospitalDeletePatient,
  getHospitalMe,
  updateConditionRecommendation,
  type PatientSummary,
} from "@/lib/api"
import { downloadPatientInvoice } from "@/lib/invoice"

// ─── Zod Schemas ─────────────────────────────────────────────────

const phoneSchema = z.object({
  mobileNumber: z.string().min(10, "Enter a valid mobile number"),
})

const medicalHistorySchema = z.object({
  diseaseId: z.string().min(1, "Select a disease"),
  description: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
})

const conditionSchema = z.object({
  hospitalPatientId: z.string().trim().min(1, "Hospital patient ID is required"),
  diseaseId: z.string().min(1, "Select a disease"),
  status: z.enum(["STABLE", "CRITICAL", "RECOVERED"]),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  doctorId: z.string().min(1, "Select a doctor"),
})

const medicineAssignSchema = z.object({
  medicineId: z.string().min(1, "Select a medicine"),
  quantity: z.string().min(1, "Enter quantity"),
  tillDate: z.date({ required_error: "Till date is required" }),
  timings: z.array(z.string().regex(/^(\d|[01]\d|2[0-3]):([0-5]\d)$/, "Invalid time (HH:mm)")).min(1, "Select at least one timing"),
})

const recommendationSchema = z.object({
  doctorRecommendation: z.string().max(2000, "Too long (max 2000 characters)").optional(),
  invoiceRecommendation: z.string().max(2000, "Too long (max 2000 characters)").optional(),
})

// ─── Helpers ─────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// Condition status (Stable/Critical/Recovered) is hidden for now in the patient
// list and profile. Flip this to true to restore the badge everywhere it's used.
const SHOW_CONDITION_STATUS = false

function StatusBadge({ status }: { status: string }) {
  if (!SHOW_CONDITION_STATUS) return null

  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    STABLE: { label: "Stable", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", icon: <Shield className="h-3 w-3" /> },
    CRITICAL: { label: "Critical", className: "bg-red-500/15 text-red-700 border-red-500/30", icon: <AlertCircle className="h-3 w-3" /> },
    RECOVERED: { label: "Recovered", className: "bg-blue-500/15 text-blue-700 border-blue-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  }
  const c = config[status] || config.STABLE
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", c.className)}>
      {c.icon} {c.label}
    </span>
  )
}

function DatePickerField({ field, label, placeholder }: { field: any; label: string; placeholder?: string }) {
  // Format the Date object into a YYYY-MM-DD string for the native input
  const dateValue = field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
          className={cn("w-full", !field.value && "text-muted-foreground")}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

// ─── Tracked Progress Calendar ───────────────────────────────────
// A single check-in flattened out of its parent condition, so the calendar
// (date) becomes the primary axis rather than the condition.
interface ProgressQuestion {
  question: string
  isText?: boolean
}

interface ProgressAnswer {
  question: string
  answer?: unknown
}

interface ProgressEntry {
  id: number | string
  scheduledDate: string
  followUpStatus?: string | null
  percentageRecovery?: number | null
  description?: string | null
  questions?: ProgressQuestion[] | null
  answer?: ProgressAnswer[] | null
  jsonField?: unknown
}

interface ProgressCondition {
  diseaseId?: number | string
  disease?: { name?: string | null } | null
  status?: string | null
  patientProgress?: ProgressEntry[] | null
}

interface FlatProgress {
  id: number | string
  scheduledDate: string
  followUpStatus?: string | null
  percentageRecovery?: number | null
  description?: string | null
  questions?: ProgressQuestion[] | null
  answer?: ProgressAnswer[] | null
  jsonField?: unknown
  conditionName: string
  conditionStatus: string
}

interface CallData {
  summary: string | null
  fields: Array<{ key: string; value: unknown }>
}

function formatCallDataValue(value: unknown): string {
  if (value === undefined || value === "") return "—"
  if (value === null) return "null"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)

  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

function getCallData(value: unknown): CallData {
  if (value === null || value === undefined) {
    return { summary: null, fields: [] }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
    const callSummary = entries.find(([key]) => key === "callSummary")?.[1]
    const summaryText = callSummary === undefined || callSummary === null
      ? ""
      : formatCallDataValue(callSummary).trim()

    return {
      summary: summaryText || null,
      fields: entries
        .filter(([key]) => key !== "callSummary")
        .map(([key, fieldValue]) => ({ key, value: fieldValue })),
    }
  }

  if (Array.isArray(value) && value.length === 0) {
    return { summary: null, fields: [] }
  }

  // Older records may contain a top-level array or primitive even though the
  // current admin editor writes an object. Keep those records readable.
  return { summary: null, fields: [{ key: "Data", value }] }
}

// Renders the patient's tracked progress as a month calendar: days that have
// check-ins are dotted, and clicking a day lists that day's check-ins.
function ProgressCalendar({ conditions }: { conditions: ProgressCondition[] }) {
  // Flatten every check-in across all conditions, tagging each with the
  // condition it belongs to (we no longer group the UI by condition).
  const entries = useMemo<FlatProgress[]>(() => {
    const list: FlatProgress[] = []
    for (const c of conditions) {
      for (const p of c.patientProgress || []) {
        list.push({
          ...p,
          conditionName: c.disease?.name || `Disease #${c.diseaseId}`,
          conditionStatus: c.status || "STABLE",
        })
      }
    }
    return list
  }, [conditions])

  // Bucket the check-ins by calendar day (local yyyy-MM-dd).
  const byDay = useMemo(() => {
    const map = new Map<string, FlatProgress[]>()
    for (const e of entries) {
      if (!e.scheduledDate) continue
      const key = format(new Date(e.scheduledDate), "yyyy-MM-dd")
      const arr = map.get(key)
      if (arr) arr.push(e)
      else map.set(key, [e])
    }
    return map
  }, [entries])

  // Dates that should show a dot on the calendar.
  const progressDates = useMemo(
    () => Array.from(byDay.keys()).map((k) => new Date(`${k}T00:00:00`)),
    [byDay]
  )

  // Open on — and pre-select — the most recent check-in.
  const latestDate = useMemo(() => {
    if (progressDates.length === 0) return undefined
    return progressDates.reduce((a, b) => (a.getTime() > b.getTime() ? a : b))
  }, [progressDates])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(latestDate)
  const [month, setMonth] = useState<Date>(latestDate ?? new Date())

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
  const selectedEntries = byDay.get(selectedKey) || []
  const selectedCallEntries = selectedEntries.map((entry) => ({
    entry,
    callData: getCallData(entry.jsonField),
  }))
  const hasCallData = selectedCallEntries.some(
    ({ callData }) => Boolean(callData.summary) || callData.fields.length > 0
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr] items-start">
      {/* Month calendar */}
      <div className="rounded-xl border bg-card p-4 shadow-sm w-fit mx-auto lg:mx-0">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          // Ignore deselect clicks so a day always stays selected.
          onSelect={(d) => { if (d) setSelectedDate(d) }}
          modifiers={{ hasProgress: progressDates }}
          modifiersClassNames={{
            hasProgress:
              "font-bold text-primary after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary after:content-['']",
          }}
          className="p-0"
        />
        <div className="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          Days with check-ins
        </div>
      </div>

      {/* The calendar is shared by both selected-day data views. */}
      <Tabs defaultValue="patient-answer" className="min-w-0 w-full">
        <TabsList className="h-auto w-full justify-start gap-1 bg-muted/60 p-1 sm:w-fit">
          <TabsTrigger value="patient-answer">Patient Answer</TabsTrigger>
          <TabsTrigger value="call-summary">Call Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="patient-answer" className="mt-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarIcon2 className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">
              {selectedDate ? format(selectedDate, "EEEE, dd MMM yyyy") : "Select a date"}
            </h4>
            {selectedEntries.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedEntries.length} check-in{selectedEntries.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {selectedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
              <ListChecks className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No check-ins on this date</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Pick a dotted day to view its check-ins.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {selectedEntries.map((p) => (
                <div key={p.id} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-snug">{p.conditionName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Condition</p>
                      </div>
                      <StatusBadge status={p.conditionStatus} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-muted">
                        Follow-up: {p.followUpStatus || "N/A"}
                      </Badge>
                      {p.percentageRecovery !== null && p.percentageRecovery !== undefined && (
                        <Badge className="text-xs font-bold bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/15">
                          Recovery: {p.percentageRecovery}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <div className="bg-muted/30 p-3 rounded-lg border text-sm text-muted-foreground italic">
                      &ldquo;{p.description}&rdquo;
                    </div>
                  )}

                  {p.questions && p.questions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-in Responses</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {p.questions.map((q, qIdx) => {
                          const answerObj = Array.isArray(p.answer)
                            ? p.answer.find((a) => a.question === q.question)
                            : null
                          const answerVal = answerObj ? answerObj.answer : undefined
                          return (
                            <div key={qIdx} className="text-xs flex flex-col gap-1 bg-muted/20 p-3 rounded-xl border border-dashed">
                              <span className="font-medium text-muted-foreground">Question: {q.question}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold">Response:</span>
                                {q.isText ? (
                                  <span className="text-foreground">{formatCallDataValue(answerVal)}</span>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px] py-0 px-1 bg-primary/10 text-primary border-primary/20">
                                    {formatCallDataValue(answerVal)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic pl-1">No checklist questions answered for this check-in.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="call-summary" className="mt-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarIcon2 className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">
              {selectedDate ? format(selectedDate, "EEEE, dd MMM yyyy") : "Select a date"}
            </h4>
            {selectedEntries.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedEntries.length} check-in{selectedEntries.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {selectedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
              <Phone className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No call summaries on this date</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Pick a dotted day to view its call details.</p>
            </div>
          ) : !hasCallData ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
              <Phone className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No call details recorded for this date</p>
              <p className="text-xs text-muted-foreground/70 mt-1">An admin can add them to the corresponding progress entry.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {selectedCallEntries.map(({ entry, callData }) => (
                <div key={entry.id} className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-snug">{entry.conditionName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Follow-up call</p>
                      </div>
                      <StatusBadge status={entry.conditionStatus} />
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-muted">
                      Follow-up: {entry.followUpStatus || "N/A"}
                    </Badge>
                  </div>

                  {callData.summary ? (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Call summary</p>
                      <p className="whitespace-pre-wrap break-words rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">
                        {callData.summary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No narrative call summary recorded for this check-in.</p>
                  )}

                  {callData.fields.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional data</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {callData.fields.map(({ key, value }) => (
                          <div key={key} className="min-w-0 rounded-lg border border-dashed bg-muted/20 p-3">
                            <p className="text-xs font-medium text-muted-foreground break-words">{key}</p>
                            <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-sm text-foreground">
                              {formatCallDataValue(value)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default function PatientsPage() {
  const queryClient = useQueryClient()
  const [mobileNumber, setMobileNumber] = useState<string | null>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false)
  const [medicineDialogOpen, setMedicineDialogOpen] = useState(false)
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
  const [summaryData, setSummaryData] = useState<PatientSummary | null>(null)
  const [selectedConditionId, setSelectedConditionId] = useState<number | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [recommendationDialogOpen, setRecommendationDialogOpen] = useState(false)
  const [recommendationConditionId, setRecommendationConditionId] = useState<number | null>(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const getPageNumbers = () => {
    const pages = []
    const totalPages = patientListQuery.data?.data?.pagination?.totalPages || 1

    // Always include page 1
    pages.push(1)

    if (page > 3) {
      pages.push("ellipsis-start")
    }

    // Pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis-end")
    }

    // Always include last page if it's more than 1
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  // Paginated patient list query
  const patientListQuery = useQuery({
    queryKey: ["patient-list", page, limit],
    queryFn: () => getPatientList(page, limit),
  })

  // Own hospital profile — wallet balance (paise) and per-day patient cost
  // (rupees), used to show the enrollment cost before adding a condition.
  const hospitalMeQuery = useQuery({
    queryKey: ["hospital-me"],
    queryFn: getHospitalMe,
  })

  // Search inputs for selects
  const [diseaseSearch, setDiseaseSearch] = useState("")
  const [medicineSearch, setMedicineSearch] = useState("")
  const [doctorSearch, setDoctorSearch] = useState("")

  // Autocomplete dropdown open states
  const [diseaseOpen, setDiseaseOpen] = useState(false)
  const [medicineOpen, setMedicineOpen] = useState(false)
  const [doctorOpen, setDoctorOpen] = useState(false)

  const debouncedDiseaseSearch = useDebounce(diseaseSearch, 300)
  const debouncedMedicineSearch = useDebounce(medicineSearch, 300)
  const debouncedDoctorSearch = useDebounce(doctorSearch, 300)

  // API queries for search dropdowns
  const diseaseQuery = useQuery({
    queryKey: ["disease-search", debouncedDiseaseSearch],
    queryFn: () => searchDisease(debouncedDiseaseSearch),
    enabled: debouncedDiseaseSearch.length > 0,
  })
  const medicineQuery = useQuery({
    queryKey: ["medicine-search", debouncedMedicineSearch],
    queryFn: () => searchMedicine(debouncedMedicineSearch),
    enabled: debouncedMedicineSearch.length > 0,
  })
  const doctorQuery = useQuery({
    queryKey: ["doctor-search", debouncedDoctorSearch],
    queryFn: () => searchDoctors(debouncedDoctorSearch),
    enabled: debouncedDoctorSearch.length > 0,
  })

  // Patient data query — searches by mobile number
  const patientQuery = useQuery({
    queryKey: ["patient-search-mobile", mobileNumber],
    queryFn: () => searchPatientByMobile(mobileNumber!),
    enabled: mobileNumber !== null,
  })

  // ── Phone Search Form ────────────────────────────────────
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { mobileNumber: "" },
  })

  const watchMobile = phoneForm.watch("mobileNumber")
  const debouncedMobile = useDebounce(watchMobile, 500)

  useEffect(() => {
    if (debouncedMobile && debouncedMobile.length >= 10) {
      setMobileNumber(debouncedMobile)
    }
  }, [debouncedMobile])

  function handleSearch(values: z.infer<typeof phoneSchema>) {
    setMobileNumber(values.mobileNumber)
  }

  // Auto-open a patient's profile when arriving with a ?mobile= query param
  // (e.g. redirect right after creating a patient).
  useEffect(() => {
    const mobile = new URLSearchParams(window.location.search).get("mobile")
    if (mobile) {
      setMobileNumber(mobile)
      phoneForm.setValue("mobileNumber", mobile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleBack() {
    setMobileNumber(null)
    phoneForm.reset()
  }

  // ── Medical History Form ─────────────────────────────────
  const historyForm = useForm<z.infer<typeof medicalHistorySchema>>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: { description: "" },
  })

  const patient = patientQuery.data?.data

  const historyMutation = useMutation({
    mutationFn: (values: z.infer<typeof medicalHistorySchema>) =>
      createMedicalHistory({
        diseaseId: parseInt(values.diseaseId),
        patientId: patient?.id,
        description: values.description,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString(),
      }),
    onSuccess: () => {
      toast.success("Medical History Added")
      historyForm.reset()
      setHistoryDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["patient-search-mobile", mobileNumber] })
    },
    onError: (error: Error) => {
      toast.error("Failed to add medical history", { description: error.message })
    },
  })

  // ── Condition Form ───────────────────────────────────────
  const conditionForm = useForm<z.infer<typeof conditionSchema>>({
    resolver: zodResolver(conditionSchema),
    defaultValues: { hospitalPatientId: "" },
  })

  function handleConditionDialogOpenChange(open: boolean) {
    setConditionDialogOpen(open)
    if (!open) {
      conditionForm.reset()
      setDiseaseSearch("")
      setDoctorSearch("")
      setDiseaseOpen(false)
      setDoctorOpen(false)
    }
  }

  const conditionMutation = useMutation({
    mutationFn: (values: z.infer<typeof conditionSchema>) =>
      createPatientCondition({
        patientId: patient?.id,
        diseaseId: parseInt(values.diseaseId),
        hospitalId: 1, // Must be positive for Zod schema; backend overrides with user.id
        hospitalPatientId: values.hospitalPatientId,
        doctorId: parseInt(values.doctorId),
        status: values.status,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString(),
      }),
    onSuccess: (res) => {
      const billing = res?.data?.billing
      toast.success("Condition Added", {
        description: billing
          ? `Charged ₹${(billing.charged / 100).toLocaleString("en-IN")} now (50% of ₹${(billing.totalCost / 100).toLocaleString("en-IN")} for ${billing.days} day(s)). Wallet balance: ₹${(billing.balance / 100).toLocaleString("en-IN")}`
          : undefined,
      })
      handleConditionDialogOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ["patient-search-mobile", mobileNumber] })
      // Enrollment deducted from the wallet — refresh the cached balance.
      queryClient.invalidateQueries({ queryKey: ["hospital-me"] })
    },
    onError: (error: Error) => {
      toast.error("Failed to add condition", { description: error.message })
    },
  })

  // ── Medicine Assign Form ─────────────────────────────────
  const medicineForm = useForm<z.infer<typeof medicineAssignSchema>>({
    resolver: zodResolver(medicineAssignSchema),
    defaultValues: { quantity: "1", timings: [] },
  })

  useEffect(() => {
    if (medicineDialogOpen) {
      medicineForm.reset({ quantity: "1", timings: [] })
    }
  }, [medicineDialogOpen, medicineForm])

  const assignMutation = useMutation({
    mutationFn: (values: z.infer<typeof medicineAssignSchema>) =>
      assignMedicine({
        patientConditionId: selectedConditionId!,
        medicines: [{
          medicineId: parseInt(values.medicineId),
          quantity: parseInt(values.quantity),
          tillDate: values.tillDate.toISOString(),
          timings: values.timings.map(t => /^\d:[0-5]\d$/.test(t) ? `0${t}` : t),
        }],
      }),
    onSuccess: () => {
      toast.success("Medicine Assigned")
      medicineForm.reset({ quantity: "1", timings: [] })
      setMedicineDialogOpen(false)
      setSelectedConditionId(null)
      queryClient.invalidateQueries({ queryKey: ["patient-search-mobile", mobileNumber] })
    },
    onError: (error: Error) => {
      toast.error("Failed to assign medicine", { description: error.message })
    },
  })

  // ── Recommendation / Invoice-notes Form ──────────────────
  const recommendationForm = useForm<z.infer<typeof recommendationSchema>>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: { doctorRecommendation: "", invoiceRecommendation: "" },
  })

  // Open the notes dialog for a condition, pre-filled with its saved notes.
  function openRecommendationDialog(condition: any) {
    setRecommendationConditionId(condition.id)
    recommendationForm.reset({
      doctorRecommendation: condition.DoctorReccommendation ?? "",
      invoiceRecommendation: condition.invoiceRecommendation ?? "",
    })
    setRecommendationDialogOpen(true)
  }

  const recommendationMutation = useMutation({
    mutationFn: (values: z.infer<typeof recommendationSchema>) =>
      updateConditionRecommendation({
        conditionId: recommendationConditionId!,
        doctorRecommendation: values.doctorRecommendation ?? "",
        invoiceRecommendation: values.invoiceRecommendation ?? "",
      }),
    onSuccess: () => {
      toast.success("Invoice notes saved")
      setRecommendationDialogOpen(false)
      setRecommendationConditionId(null)
      queryClient.invalidateQueries({ queryKey: ["patient-search-mobile", mobileNumber] })
    },
    onError: (error: Error) => {
      toast.error("Failed to save notes", { description: error.message })
    },
  })

  // ── Download Invoice ─────────────────────────────────────
  // Builds a print-ready invoice from the already-loaded patient data and the
  // hospital's own profile (letterhead), then opens the print/Save-as-PDF flow.
  function handleDownloadInvoice() {
    if (!patient) return
    const opened = downloadPatientInvoice(patient, hospitalMeQuery.data?.data)
    if (!opened) {
      toast.error("Couldn't open the invoice", {
        description: "Allow pop-ups for this site, then try again.",
      })
    }
  }

  // ── Summary Mutation ─────────────────────────────────────
  const summaryMutation = useMutation({
    mutationFn: (patientId: number) => getPatientSummary(patientId),
    onSuccess: (data) => {
      setSummaryData(data.data)
      setSummaryDialogOpen(true)
      toast.success("Profile summary generated")
    },
    onError: (error: Error) => {
      toast.error("Failed to generate summary", { description: error.message })
    },
  })

  // ── Remove-from-care Mutation ────────────────────────────
  // The backend decides whether this removes only our hospital's conditions
  // (patient stays, enrolled elsewhere) or the whole patient record.
  const removePatientMutation = useMutation({
    mutationFn: (patientId: number) => hospitalDeletePatient(patientId),
    onSuccess: (res) => {
      setRemoveDialogOpen(false)
      if (res.data.deleted === "patient") {
        toast.success("Patient removed", {
          description: `Your hospital was ${patient?.name ?? "the patient"}'s only enrollment, so the full record was deleted.`,
        })
      } else {
        toast.success("Removed from your care", {
          description: `${res.data.conditionsDeleted} condition(s) under your hospital were removed. The patient remains enrolled with other hospitals.`,
        })
      }
      queryClient.invalidateQueries({ queryKey: ["patient-list"] })
      queryClient.invalidateQueries({ queryKey: ["patient-search-mobile", mobileNumber] })
      handleBack()
    },
    onError: (error: Error) => {
      toast.error("Failed to remove patient", { description: error.message })
    },
  })

  const conditions = patient?.conditions || []
  const medicalHistory = patient?.medicalHistory || []
  const medicinesCount = conditions.reduce((acc: number, c: any) => acc + (c.medicineAlloted?.length || 0), 0)
  const progressCount = conditions.reduce((acc: number, c: any) => acc + (c.patientProgress?.length || 0), 0)

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {!mobileNumber ? (
          /* ──── STEP 1: SEARCH & DIRECTORY ──── */
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Patients Directory</h1>
                <p className="text-muted-foreground mt-1">
                  Search for a patient by phone number or select one from the directory list below.
                </p>
              </div>
              <div className="w-full md:max-w-md bg-card p-4 rounded-xl border shadow-sm">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(handleSearch)} className="flex items-end gap-2">
                    <FormField
                      control={phoneForm.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-1">
                          <FormLabel className="text-xs">Mobile Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                placeholder="9876543210"
                                className="pl-8 h-9 text-sm"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 font-medium"
                      disabled={patientQuery.isLoading}
                    >
                      {patientQuery.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span className="ml-1.5 hidden sm:inline">Search</span>
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* PATIENT LIST TABLE */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {patientListQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading patients list...</p>
                </div>
              ) : patientListQuery.isError ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2 text-red-500">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm font-medium">Failed to load patients list</p>
                  <p className="text-xs text-muted-foreground">{(patientListQuery.error as Error)?.message}</p>
                </div>
              ) : !patientListQuery.data?.data?.patients || patientListQuery.data.data.patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <User className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="font-medium">No patients found</p>
                  <p className="text-sm text-muted-foreground">Add a new patient to get started.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Details</TableHead>
                        <TableHead>Gender & Age</TableHead>
                        <TableHead>ID Type & Number</TableHead>
                        <TableHead>Mobile Number</TableHead>
                        <TableHead>Condition(s)</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientListQuery.data.data.patients.map((pat: any) => {
                        const age = pat.dateOfBirth
                          ? Math.floor((new Date().getTime() - new Date(pat.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                          : "—"

                        // Primary condition or first condition if any
                        const primaryCondition = pat.conditions?.[0]

                        return (
                          <TableRow key={pat.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                  {pat.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm leading-none">{pat.name}</p>
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <Badge variant="outline" className="text-[10px] py-0 px-1 font-semibold text-red-500 bg-red-500/5 border-red-500/10 gap-0.5">
                                      <Droplets className="h-2.5 w-2.5" /> {pat.bloodGroup || "—"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{pat.gender ? pat.gender.charAt(0) + pat.gender.slice(1).toLowerCase() : "—"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{age} years old</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{pat.idType || "—"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{pat.idNumber || "—"}</p>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {pat.mobileNumber || "—"}
                            </TableCell>
                            <TableCell>
                              {primaryCondition ? (
                                <div className="flex flex-col gap-1.5 items-start">
                                  <Badge variant="secondary" className="text-xs font-medium">
                                    {primaryCondition.disease?.name || `Disease #${primaryCondition.diseaseId}`}
                                  </Badge>
                                  <StatusBadge status={primaryCondition.status} />
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">No active conditions</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMobileNumber(pat.mobileNumber)}
                                className="h-8 text-xs font-semibold"
                              >
                                View Profile
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* PAGINATION */}
                  {patientListQuery.data?.data?.pagination && patientListQuery.data.data.pagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 py-4 bg-muted/20">
                      <div className="flex items-center gap-4 order-2 sm:order-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Rows per page</span>
                          <Select
                            value={String(limit)}
                            onValueChange={(value) => {
                              setLimit(Number(value))
                              setPage(1)
                            }}
                          >
                            <SelectTrigger className="h-8 w-[72px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 5, 10, 20, 50].map((size) => (
                                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Showing page <span className="font-semibold">{page}</span> of <span className="font-semibold">{patientListQuery.data.data.pagination.totalPages}</span> ({patientListQuery.data.data.pagination.total} patients)
                        </div>
                      </div>
                      <div className="order-1 sm:order-2">
                        <Pagination className="justify-end w-auto">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (page > 1) setPage(page - 1)
                                }}
                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {getPageNumbers().map((pageNum, idx) => {
                              if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                                return (
                                  <PaginationItem key={`ellipsis-${idx}`}>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )
                              }
                              const isPageActive = page === pageNum
                              return (
                                <PaginationItem key={`page-${pageNum}`}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setPage(pageNum as number)
                                    }}
                                    isActive={isPageActive}
                                    className="cursor-pointer"
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  const totalPages = patientListQuery.data?.data?.pagination?.totalPages || 1
                                  if (page < totalPages) setPage(page + 1)
                                }}
                                className={page >= (patientListQuery.data?.data?.pagination?.totalPages || 1) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ) : patientQuery.isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 items-center justify-center"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </motion.div>
        ) : patientQuery.isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col items-center justify-center gap-4"
          >
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-lg font-medium">Patient not found</p>
            <p className="text-sm text-muted-foreground">{(patientQuery.error as Error)?.message}</p>
            <Button variant="outline" onClick={handleBack}>Back to search</Button>
          </motion.div>
        ) : patient ? (
          /* ──── STEP 2: PATIENT PROFILE ──── */
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-full max-w-5xl space-y-6"
          >
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to search
            </Button>

            {/* Patient Info Header */}
            <div className="rounded-2xl border bg-linear-to-br from-card to-card/80 p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                      <User className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{patient.name}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3.5 w-3.5" /> {patient.mobileNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        className="gap-2 w-fit bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow"
                        onClick={() => summaryMutation.mutate(patient.id)}
                        disabled={summaryMutation.isPending}
                      >
                        {summaryMutation.isPending ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                        )}
                        Generate Summary
                      </Button>
                    </motion.div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 w-fit"
                      onClick={handleDownloadInvoice}
                    >
                      <Download className="h-4 w-4" /> Download Invoice
                    </Button>

                    <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 w-fit text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => setRemoveDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" /> Remove from care
                      </Button>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {patient.name} from your care?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the patient&apos;s enrollment with your hospital. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground space-y-2">
                          <p className="flex gap-2">
                            <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
                            If they are also enrolled with other hospitals, only your hospital&apos;s conditions are removed.
                          </p>
                          <p className="flex gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                            If yours is their only enrollment, the entire patient record — conditions, progress and history — is permanently deleted.
                          </p>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={removePatientMutation.isPending}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); removePatientMutation.mutate(patient.id) }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={removePatientMutation.isPending}
                          >
                            {removePatientMutation.isPending ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing...</>
                            ) : "Remove patient"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
                    <Droplets className="h-3.5 w-3.5 text-red-500" /> {patient.bloodGroup}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
                    <Heart className="h-3.5 w-3.5 text-pink-500" /> {patient.gender}
                  </Badge>
                  {patient.dateOfBirth && (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
                      <CalendarIcon2 className="h-3.5 w-3.5 text-blue-500" /> {format(new Date(patient.dateOfBirth), "dd MMM yyyy")}
                    </Badge>
                  )}
                  {patient.idType && patient.idNumber && (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm bg-muted/30">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {patient.idType}: {patient.idNumber}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Dialog */}
            <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Patient Profile Summary - {patient.name}</DialogTitle>
                  <DialogDescription>Auto-generated comprehensive patient profile</DialogDescription>
                </DialogHeader>
                {summaryData && <PatientSummaryView summary={summaryData} />}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(summaryData?.summaryMarkdown || "")
                      toast.success("Summary copied to clipboard")
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button type="button" variant="default" onClick={() => setSummaryDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Tabs */}
            <Tabs defaultValue="conditions" className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted p-1">
                <TabsTrigger value="conditions" className="gap-1.5">
                  <Activity className="h-4 w-4" /> Conditions ({conditions.length})
                </TabsTrigger>
                <TabsTrigger value="medicines" className="gap-1.5">
                  <Pill className="h-4 w-4" /> Prescribed Medicines ({medicinesCount})
                </TabsTrigger>
                <TabsTrigger value="progress" className="gap-1.5">
                  <ListChecks className="h-4 w-4" /> Tracked Progress ({progressCount})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5">
                  <FileText className="h-4 w-4" /> Medical History ({medicalHistory.length})
                </TabsTrigger>
              </TabsList>

              {/* ────── CONDITIONS TAB ────── */}
              <TabsContent value="conditions" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Patient Conditions</h3>
                    <p className="text-sm text-muted-foreground">Active diseases and treatment details</p>
                  </div>
                  <Dialog open={conditionDialogOpen} onOpenChange={handleConditionDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add Condition
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Condition</DialogTitle>
                        <DialogDescription>Record a new condition for this patient.</DialogDescription>
                      </DialogHeader>
                      <Form {...conditionForm}>
                        <form onSubmit={conditionForm.handleSubmit((v) => conditionMutation.mutate(v))} className="space-y-4">
                          <FormField
                            control={conditionForm.control}
                            name="hospitalPatientId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hospital Patient ID <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. HOSP-12345" autoComplete="off" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField control={conditionForm.control} name="diseaseId" render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel>Disease</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Search disease..."
                                  value={diseaseSearch}
                                  onChange={(e) => {
                                    setDiseaseSearch(e.target.value)
                                    setDiseaseOpen(true)
                                  }}
                                  onFocus={() => setDiseaseOpen(true)}
                                />
                              </FormControl>
                              {diseaseOpen && diseaseSearch.length > 0 && (
                                <div className="absolute top-[calc(100%+4px)] z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                                  {diseaseQuery.isLoading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                                  ) : diseaseQuery.data?.data?.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No diseases found.</div>
                                  ) : (
                                    <ul className="max-h-60 overflow-auto p-1 text-sm">
                                      {(diseaseQuery.data?.data || []).map((d: any) => (
                                        <li
                                          key={d.id}
                                          className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 outline-none hover:bg-accent hover:text-accent-foreground"
                                          onClick={() => {
                                            field.onChange(String(d.id))
                                            setDiseaseSearch(d.name)
                                            setDiseaseOpen(false)
                                          }}
                                        >
                                          {d.name} ({d.type})
                                          {field.value === String(d.id) && <Check className="absolute right-2 h-4 w-4" />}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={conditionForm.control} name="status" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="STABLE">Stable</SelectItem>
                                  <SelectItem value="CRITICAL">Critical</SelectItem>
                                  <SelectItem value="RECOVERED">Recovered</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={conditionForm.control} name="startDate" render={({ field }) => (
                              <DatePickerField field={field} label="Start Date" />
                            )} />
                            <FormField control={conditionForm.control} name="endDate" render={({ field }) => (
                              <DatePickerField field={field} label="End Date" placeholder="Ongoing" />
                            )} />
                          </div>
                          {(() => {
                            // Enrollment is billed per day (inclusive of start and end
                            // date; no end date = 1 day) at the hospital's per-day cost;
                            // half of the total is deducted from the wallet up front.
                            const hosp = hospitalMeQuery.data?.data
                            const start = conditionForm.watch("startDate")
                            if (!hosp || !start) return null
                            const end = conditionForm.watch("endDate")
                            const MS_PER_DAY = 24 * 60 * 60 * 1000
                            const days = end
                              ? Math.max(1, Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1)
                              : 1
                            const cost = days * hosp.perDayPatientCost
                            const upfront = cost / 2
                            const insufficient = upfront * 100 > hosp.balance
                            return (
                              <div className={cn(
                                "rounded-md border p-3 text-sm",
                                insufficient
                                  ? "border-destructive/50 bg-destructive/5 text-destructive"
                                  : "bg-muted/50 text-muted-foreground"
                              )}>
                                <p>
                                  Enrollment cost: {days} day(s) × ₹{hosp.perDayPatientCost.toLocaleString("en-IN")} ={" "}
                                  <span className="font-semibold">₹{cost.toLocaleString("en-IN")}</span>
                                  {" "}· 50% now:{" "}
                                  <span className="font-semibold">₹{upfront.toLocaleString("en-IN")}</span>
                                </p>
                                <p className="mt-1 text-xs">
                                  {insufficient
                                    ? `Insufficient wallet balance (₹${(hosp.balance / 100).toLocaleString("en-IN")}). Top up in Billing & Wallet before enrolling.`
                                    : `Half of the total is deducted from your wallet now (balance ₹${(hosp.balance / 100).toLocaleString("en-IN")}).`}
                                </p>
                              </div>
                            )
                          })()}
                          <FormField control={conditionForm.control} name="doctorId" render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel>Doctor <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Search doctor..."
                                  value={doctorSearch}
                                  onChange={(e) => {
                                    setDoctorSearch(e.target.value)
                                    setDoctorOpen(true)
                                  }}
                                  onFocus={() => setDoctorOpen(true)}
                                />
                              </FormControl>
                              {doctorOpen && doctorSearch.length > 0 && (
                                <div className="absolute top-[calc(100%+4px)] z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                                  {doctorQuery.isLoading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                                  ) : doctorQuery.data?.data?.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No doctors found.</div>
                                  ) : (
                                    <ul className="max-h-60 overflow-auto p-1 text-sm">
                                      {(doctorQuery.data?.data || []).map((d: any) => (
                                        <li
                                          key={d.id}
                                          className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 outline-none hover:bg-accent hover:text-accent-foreground"
                                          onClick={() => {
                                            field.onChange(String(d.id))
                                            setDoctorSearch(d.name)
                                            setDoctorOpen(false)
                                          }}
                                        >
                                          {d.name}
                                          {field.value === String(d.id) && <Check className="absolute right-2 h-4 w-4" />}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )} />
                          <DialogFooter>
                            <Button type="submit" className="w-full" disabled={conditionMutation.isPending}>
                              {conditionMutation.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                              ) : "Save Condition"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Medicine Assign Dialog */}
                <Dialog open={medicineDialogOpen} onOpenChange={(open) => { setMedicineDialogOpen(open); if (!open) setSelectedConditionId(null) }}>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Assign Medicine</DialogTitle>
                      <DialogDescription>Prescribe medicine for this condition.</DialogDescription>
                    </DialogHeader>
                    <Form {...medicineForm}>
                      <form onSubmit={medicineForm.handleSubmit((v) => assignMutation.mutate(v))} className="space-y-4">
                        <FormField control={medicineForm.control} name="medicineId" render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Medicine</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Search medicine..."
                                value={medicineSearch}
                                onChange={(e) => {
                                  setMedicineSearch(e.target.value)
                                  setMedicineOpen(true)
                                }}
                                onFocus={() => setMedicineOpen(true)}
                              />
                            </FormControl>
                            {medicineOpen && medicineSearch.length > 0 && (
                              <div className="absolute top-[calc(100%+4px)] z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                                {medicineQuery.isLoading ? (
                                  <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                                ) : medicineQuery.data?.data?.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-muted-foreground">No medicines found.</div>
                                ) : (
                                  <ul className="max-h-60 overflow-auto p-1 text-sm">
                                    {(medicineQuery.data?.data || []).map((m: any) => (
                                      <li
                                        key={m.id}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 outline-none hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                          field.onChange(String(m.id))
                                          setMedicineSearch(m.brandName)
                                          setMedicineOpen(false)
                                        }}
                                      >
                                        {m.brandName} ({m.genericName}) — {m.dosageStrength} {m.dosageForm}
                                        {field.value === String(m.id) && <Check className="absolute right-2 h-4 w-4" />}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={medicineForm.control} name="quantity" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl><Input type="number" min="1" placeholder="1" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={medicineForm.control} name="tillDate" render={({ field }) => (
                            <DatePickerField field={field} label="Till Date" />
                          )} />
                        </div>
                        <FormField control={medicineForm.control} name="timings" render={({ field }) => {
                          const presets = [
                            { label: "Morning (08:00)", value: "08:00" },
                            { label: "Afternoon (14:00)", value: "14:00" },
                            { label: "Evening (20:00)", value: "20:00" },
                          ];
                          const presetValues = presets.map(p => p.value);
                          const currentTimings = field.value || [];

                          return (
                            <FormItem>
                              <FormLabel>Timings</FormLabel>
                              <div className="flex flex-wrap gap-2 mb-3 mt-1">
                                {presets.map(preset => {
                                  const isSelected = currentTimings.includes(preset.value)
                                  return (
                                    <Button
                                      key={preset.value}
                                      type="button"
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => {
                                        if (isSelected) {
                                          field.onChange(currentTimings.filter((t: string) => t !== preset.value))
                                        } else {
                                          field.onChange([...currentTimings, preset.value])
                                        }
                                      }}
                                    >
                                      {preset.label}
                                    </Button>
                                  )
                                })}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.onChange([...currentTimings, ""])
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Custom
                                </Button>
                              </div>
                              {currentTimings.length > 0 && (
                                <div className="space-y-2">
                                  {currentTimings.map((timing: string, index: number) => {
                                    const isPreset = presetValues.includes(timing)
                                    if (isPreset) return null;
                                    return (
                                      <div key={index} className="flex items-center gap-2">
                                        <Input
                                          value={timing}
                                          onChange={(e) => {
                                            const newTimings = [...currentTimings]
                                            newTimings[index] = e.target.value
                                            field.onChange(newTimings)
                                          }}
                                          placeholder="Enter custom timing (e.g. 10:00)"
                                          autoFocus
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            const newTimings = [...currentTimings]
                                            newTimings.splice(index, 1)
                                            field.onChange(newTimings)
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )
                        }} />
                        <DialogFooter>
                          <Button type="submit" className="w-full" disabled={assignMutation.isPending}>
                            {assignMutation.isPending ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assigning...</>
                            ) : "Assign Medicine"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Instructions / Invoice-notes Dialog */}
                <Dialog
                  open={recommendationDialogOpen}
                  onOpenChange={(open) => {
                    setRecommendationDialogOpen(open)
                    if (!open) setRecommendationConditionId(null)
                  }}
                >
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Patient Instructions</DialogTitle>
                      <DialogDescription>
                        These notes appear on the patient&apos;s downloadable invoice.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...recommendationForm}>
                      <form onSubmit={recommendationForm.handleSubmit((v) => recommendationMutation.mutate(v))} className="space-y-4">
                        <FormField control={recommendationForm.control} name="doctorRecommendation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Do&apos;s</FormLabel>
                            <FormControl>
                              <Textarea rows={4} placeholder="e.g. Complete the full antibiotic course. Rest for 5 days." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={recommendationForm.control} name="invoiceRecommendation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Don&apos;ts</FormLabel>
                            <FormControl>
                              <Textarea rows={4} placeholder="e.g. Follow up after 1 week. Avoid strenuous activity." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <DialogFooter>
                          <Button type="submit" className="w-full" disabled={recommendationMutation.isPending}>
                            {recommendationMutation.isPending ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : "Save Notes"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {conditions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12">
                    <Activity className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No conditions recorded yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {conditions.map((c: any, i: number) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border bg-card shadow-sm overflow-hidden"
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{c.disease?.name || `Disease #${c.diseaseId}`}</h4>
                              <StatusBadge status={c.status} />
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              {c.HospitalPatientId && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3.5 w-3.5" />
                                  Hospital Patient ID: {c.HospitalPatientId}
                                </span>
                              )}
                              {c.hospital && (
                                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {c.hospital.name}</span>
                              )}
                              {c.doctor && (
                                <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> {c.doctor.name}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <CalendarIcon2 className="h-3.5 w-3.5" /> {format(new Date(c.startDate), "dd MMM yyyy")}
                                {c.endDate ? ` — ${format(new Date(c.endDate), "dd MMM yyyy")}` : " — Present"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 shrink-0"
                              asChild
                            >
                              <Link href={`/dashboard/create-progress?mobile=${patient.mobileNumber}&conditionId=${c.id}`}>
                                <ListChecks className="h-4 w-4" /> Add Question
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 shrink-0"
                              onClick={() => {
                                setSelectedConditionId(c.id)
                                medicineForm.reset()
                                setMedicineDialogOpen(true)
                              }}
                            >
                              <Pill className="h-4 w-4" /> Assign Medicine
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 shrink-0"
                              onClick={() => openRecommendationDialog(c)}
                            >
                              <NotebookPen className="h-4 w-4" />
                              {c.DoctorReccommendation || c.invoiceRecommendation ? "Edit Instructions" : "Add Instructions"}
                            </Button>
                          </div>
                        </div>
                        {(c.DoctorReccommendation || c.invoiceRecommendation) && (
                          <div className="border-t bg-muted/20 px-4 py-3 space-y-2">
                            {c.DoctorReccommendation && (
                              <div className="text-sm">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Do&apos;s</span>
                                <p className="text-muted-foreground mt-0.5">{c.DoctorReccommendation}</p>
                              </div>
                            )}
                            {c.invoiceRecommendation && (
                              <div className="text-sm">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Don&apos;ts</span>
                                <p className="text-muted-foreground mt-0.5">{c.invoiceRecommendation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ────── PRESCRIBED MEDICINES TAB ────── */}
              <TabsContent value="medicines" className="mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Prescribed Medicines</h3>
                  <p className="text-sm text-muted-foreground">Medications prescribed across all active conditions, along with compliance logs</p>
                </div>
                {medicinesCount === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12">
                    <Pill className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No medicines prescribed yet</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {conditions.map((c: any) => {
                      const meds = c.medicineAlloted || []
                      if (meds.length === 0) return null
                      return (
                        <div key={c.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Condition: {c.disease?.name || `Disease #${c.diseaseId}`}
                            </span>
                            <StatusBadge status={c.status} />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {meds.map((m: any) => (
                              <div key={m.id} className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                      <Pill className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm leading-snug">{m.medicine?.brandName || `Med #${m.medicineId}`}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{m.medicine?.genericName || "Generic Medicine"}</p>
                                      <div className="flex items-center gap-1.5 mt-2">
                                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">Qty: {m.quantity}</Badge>
                                        {m.medicine?.dosageStrength && (
                                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">{m.medicine.dosageStrength} {m.medicine.dosageForm}</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right text-[11px] text-muted-foreground shrink-0 font-medium">
                                    <span className="block">till {format(new Date(m.tillDate), "dd MMM yyyy")}</span>
                                  </div>
                                </div>

                                {m.timings && m.timings.length > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 py-1.5 px-2.5 rounded-lg border border-dashed">
                                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="font-medium">Timings: </span>
                                    <span>
                                      {m.timings.map((t: any) =>
                                        typeof t === "string" ? t : t.timing ? format(new Date(t.timing), "HH:mm") : ""
                                      ).join(", ")}
                                    </span>
                                  </div>
                                )}

                                {/* Compliance log */}
                                {m.MedicineStatus && m.MedicineStatus.length > 0 ? (
                                  <div className="border-t pt-3 space-y-2 mt-auto">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Compliance History</p>
                                    <div className="grid gap-1.5 max-h-36 overflow-y-auto pr-1">
                                      {m.MedicineStatus.map((status: any) => (
                                        <div key={status.id} className="flex flex-col gap-0.5 text-xs py-1.5 px-2.5 rounded-lg border bg-muted/20">
                                          <div className="flex items-center justify-between">
                                            <span className={cn(
                                              "inline-flex items-center gap-1 font-semibold text-xs",
                                              status.medicineTaken ? "text-emerald-600" : "text-red-500"
                                            )}>
                                              {status.medicineTaken ? (
                                                <><Check className="h-3.5 w-3.5" /> Taken</>
                                              ) : (
                                                <><X className="h-3.5 w-3.5" /> Missed</>
                                              )}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                              {format(new Date(status.createdAt), "dd MMM, HH:mm")}
                                            </span>
                                          </div>
                                          {status.remark && (
                                            <p className="text-[11px] text-muted-foreground italic mt-0.5 pl-4">
                                              &ldquo;{status.remark}&rdquo;
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-t pt-3 text-center text-xs text-muted-foreground italic mt-auto">
                                    No logs recorded yet
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* ────── TRACKED PROGRESS TAB ────── */}
              <TabsContent value="progress" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Tracked Progress</h3>
                    <p className="text-sm text-muted-foreground">Scheduled follow-up check-ins and recovery tracking</p>
                  </div>
                </div>
                <ProgressCalendar conditions={conditions} />
              </TabsContent>

              {/* ────── MEDICAL HISTORY TAB ────── */}
              <TabsContent value="history" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Medical History</h3>
                    <p className="text-sm text-muted-foreground">Past and ongoing medical records</p>
                  </div>
                  <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Medical History</DialogTitle>
                        <DialogDescription>Record a new entry in the patient&apos;s medical history.</DialogDescription>
                      </DialogHeader>
                      <Form {...historyForm}>
                        <form onSubmit={historyForm.handleSubmit((v) => historyMutation.mutate(v))} className="space-y-4">
                          <FormField control={historyForm.control} name="diseaseId" render={({ field }) => (
                            <FormItem className="relative">
                              <FormLabel>Disease</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Search disease..."
                                  value={diseaseSearch}
                                  onChange={(e) => {
                                    setDiseaseSearch(e.target.value)
                                    setDiseaseOpen(true)
                                  }}
                                  onFocus={() => setDiseaseOpen(true)}
                                />
                              </FormControl>
                              {diseaseOpen && diseaseSearch.length > 0 && (
                                <div className="absolute top-[calc(100%+4px)] z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                                  {diseaseQuery.isLoading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                                  ) : diseaseQuery.data?.data?.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No diseases found.</div>
                                  ) : (
                                    <ul className="max-h-60 overflow-auto p-1 text-sm">
                                      {(diseaseQuery.data?.data || []).map((d: any) => (
                                        <li
                                          key={d.id}
                                          className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 outline-none hover:bg-accent hover:text-accent-foreground"
                                          onClick={() => {
                                            field.onChange(String(d.id))
                                            setDiseaseSearch(d.name)
                                            setDiseaseOpen(false)
                                          }}
                                        >
                                          {d.name} ({d.type})
                                          {field.value === String(d.id) && <Check className="absolute right-2 h-4 w-4" />}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={historyForm.control} name="description" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl><Textarea placeholder="Brief description..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={historyForm.control} name="startDate" render={({ field }) => (
                              <DatePickerField field={field} label="Start Date" />
                            )} />
                            <FormField control={historyForm.control} name="endDate" render={({ field }) => (
                              <DatePickerField field={field} label="End Date" placeholder="Ongoing" />
                            )} />
                          </div>
                          <DialogFooter>
                            <Button type="submit" className="w-full" disabled={historyMutation.isPending}>
                              {historyMutation.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                              ) : "Save History"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {medicalHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12">
                    <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No medical history records yet</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {medicalHistory.map((h: any, i: number) => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{h.disease?.name || `Disease #${h.diseaseId}`}</h4>
                              {h.disease?.type && <Badge variant="secondary" className="text-xs">{h.disease.type}</Badge>}
                            </div>
                            {h.description && <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>}
                          </div>
                          <div className="text-right shrink-0 text-sm text-muted-foreground">
                            <p>{format(new Date(h.startDate), "dd MMM yyyy")}</p>
                            <p className="text-xs">{h.endDate ? `to ${format(new Date(h.endDate), "dd MMM yyyy")}` : "Ongoing"}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-center justify-center gap-4"
          >
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No patient data available</p>
            <Button variant="outline" onClick={handleBack}>Back to search</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
