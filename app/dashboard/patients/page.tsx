"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import {
    Phone, Search, ArrowLeft, User, Heart, Droplets, Calendar as CalendarIcon2,
    Activity, Pill, Plus, Clock, Stethoscope, Building2, FileText,
    AlertCircle, CheckCircle2, Shield, Loader2, Check, X, ListChecks
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import {
    searchPatientByMobile,
    createMedicalHistory,
    createPatientCondition,
    assignMedicine,
    searchDisease,
    searchMedicine,
    searchDoctors,
} from "@/lib/api"

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
    diseaseId: z.string().min(1, "Select a disease"),
    status: z.enum(["STABLE", "CRITICAL", "RECOVERED"]),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date().optional(),
    doctorId: z.string().optional(),
})

const medicineAssignSchema = z.object({
    medicineId: z.string().min(1, "Select a medicine"),
    quantity: z.string().min(1, "Enter quantity"),
    tillDate: z.date({ required_error: "Till date is required" }),
    timings: z.array(z.string().regex(/^(\d|[01]\d|2[0-3]):([0-5]\d)$/, "Invalid time (HH:mm)")).min(1, "Select at least one timing"),
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

function StatusBadge({ status }: { status: string }) {
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

// ═══════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export default function PatientsPage() {
    const queryClient = useQueryClient()
    const [mobileNumber, setMobileNumber] = useState<string | null>(null)
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [conditionDialogOpen, setConditionDialogOpen] = useState(false)
    const [medicineDialogOpen, setMedicineDialogOpen] = useState(false)
    const [selectedConditionId, setSelectedConditionId] = useState<number | null>(null)

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
    })

    const conditionMutation = useMutation({
        mutationFn: (values: z.infer<typeof conditionSchema>) =>
            createPatientCondition({
                patientId: patient?.id,
                diseaseId: parseInt(values.diseaseId),
                hospitalId: 1, // Must be positive for Zod schema; backend overrides with user.id
                doctorId: values.doctorId ? parseInt(values.doctorId) : undefined,
                status: values.status,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate?.toISOString(),
            }),
        onSuccess: () => {
            toast.success("Condition Added")
            conditionForm.reset()
            setConditionDialogOpen(false)
            queryClient.invalidateQueries({ queryKey: ["patient-search-mobile", mobileNumber] })
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

    const conditions = patient?.conditions || []
    const medicalHistory = patient?.medicalHistory || []

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════

    return (
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
                {!mobileNumber ? (
                    /* ──── STEP 1: SEARCH BY MOBILE ──── */
                    <motion.div
                        key="search"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-1 items-center justify-center"
                    >
                        <div className="w-full max-w-md">
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                    <Search className="h-8 w-8 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight">Find Patient</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Enter the patient&apos;s mobile number to access their profile
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                                <Form {...phoneForm}>
                                    <form onSubmit={phoneForm.handleSubmit(handleSearch)} className="space-y-4">
                                        <FormField
                                            control={phoneForm.control}
                                            name="mobileNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mobile Number</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                placeholder="9876543210"
                                                                className="pl-9 h-11 text-base"
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
                                            className="w-full h-11 text-base font-medium"
                                            disabled={patientQuery.isLoading}
                                        >
                                            {patientQuery.isLoading ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>
                                            ) : (
                                                <><Search className="mr-2 h-4 w-4" /> Search Patient</>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </div>
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
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="conditions" className="w-full">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="conditions" className="gap-1.5">
                                    <Activity className="h-4 w-4" /> Conditions ({conditions.length})
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
                                    <Dialog open={conditionDialogOpen} onOpenChange={setConditionDialogOpen}>
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
                                                    <FormField control={conditionForm.control} name="doctorId" render={({ field }) => (
                                                        <FormItem className="relative">
                                                            <FormLabel>Doctor (optional)</FormLabel>
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
                                                                <ListChecks className="h-4 w-4" /> Track Progress
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
                                                    </div>
                                                </div>

                                                {/* Medicines List */}
                                                {c.medicineAlloted && c.medicineAlloted.length > 0 && (
                                                    <div className="border-t bg-muted/30 px-4 py-3">
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Prescribed Medicines</p>
                                                        <div className="grid gap-2">
                                                            {c.medicineAlloted.map((m: any) => (
                                                                <div key={m.id} className="flex items-center justify-between rounded-lg bg-background p-3 text-sm border">
                                                                    <div className="flex items-center gap-2">
                                                                        <Pill className="h-4 w-4 text-primary shrink-0" />
                                                                        <span className="font-medium">{m.medicine?.brandName || `Med #${m.medicineId}`}</span>
                                                                        <Badge variant="secondary" className="text-xs">Qty: {m.quantity}</Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                                                                        {m.timings && m.timings.length > 0 && (
                                                                            <span className="flex items-center gap-1 text-xs">
                                                                                <Clock className="h-3 w-3" />
                                                                                {m.timings.map((t: any) =>
                                                                                    typeof t === "string" ? t : t.timing ? format(new Date(t.timing), "HH:mm") : ""
                                                                                ).join(", ")}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-xs">till {format(new Date(m.tillDate), "dd MMM yyyy")}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Progress Schedule List */}
                                                {c.patientProgress && c.patientProgress.length > 0 && (
                                                    <div className="border-t bg-muted/30 px-4 py-3">
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tracked Progress</p>
                                                        <div className="grid gap-2">
                                                            {c.patientProgress.map((p: any) => {
                                                                let questionsCount = 0;
                                                                try {
                                                                    questionsCount = JSON.parse(p.questions).length;
                                                                } catch (e) { }
                                                                return (
                                                                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-background p-3 text-sm border">
                                                                        <div className="flex items-center gap-2">
                                                                            <ListChecks className="h-4 w-4 text-primary shrink-0" />
                                                                            <span className="font-medium">{format(new Date(p.scheduledDate), "MMM dd, yyyy")}</span>
                                                                            <Badge variant="secondary" className="text-xs">{p.followUpStatus}</Badge>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                                                                            <span className="flex items-center gap-1 text-xs">
                                                                                {questionsCount} Questions
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
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
