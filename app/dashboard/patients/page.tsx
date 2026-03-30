"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import {
    Phone, Search, ArrowLeft, User, Heart, Droplets, Calendar as CalendarIcon2,
    Activity, Pill, Plus, Clock, Stethoscope, Building2, FileText, TrendingUp,
    AlertCircle, CheckCircle2, Shield
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

// ─── Hardcoded Data ──────────────────────────────────────────────

const DISEASES = [
    { id: 1, name: "Diabetes Mellitus", type: "CHRONIC", description: "A metabolic disease causing high blood sugar" },
    { id: 2, name: "Hypertension", type: "CHRONIC", description: "High blood pressure condition" },
    { id: 3, name: "Pneumonia", type: "ACUTE", description: "Infection that inflames lung air sacs" },
    { id: 4, name: "Influenza", type: "ACUTE", description: "Common viral infection" },
    { id: 5, name: "Asthma", type: "CHRONIC", description: "Chronic lung disease with airway inflammation" },
]

const MEDICINES = [
    { id: 1, brandName: "Metformin", genericName: "Metformin HCl", dosageForm: "TABLET", dosageStrength: "500mg", manufacturer: "Sun Pharma" },
    { id: 2, brandName: "Amlodipine", genericName: "Amlodipine Besylate", dosageForm: "TABLET", dosageStrength: "5mg", manufacturer: "Cipla" },
    { id: 3, brandName: "Amoxicillin", genericName: "Amoxicillin Trihydrate", dosageForm: "CAPSULE", dosageStrength: "250mg", manufacturer: "Ranbaxy" },
    { id: 4, brandName: "Salbutamol", genericName: "Salbutamol Sulphate", dosageForm: "INHALER", dosageStrength: "100mcg", manufacturer: "GSK" },
    { id: 5, brandName: "Calpol", genericName: "Paracetamol", dosageForm: "SYRUP", dosageStrength: "250mg/5ml", manufacturer: "GSK" },
]

const HOSPITALS = [
    { id: 1, name: "City General Hospital" },
    { id: 2, name: "Apollo Medical Center" },
    { id: 3, name: "Sunrise Health Clinic" },
]

const DOCTORS = [
    { id: 1, name: "Dr. Sharma", hospitalId: 1 },
    { id: 2, name: "Dr. Patel", hospitalId: 2 },
    { id: 3, name: "Dr. Gupta", hospitalId: 1 },
    { id: 4, name: "Dr. Reddy", hospitalId: 3 },
]

const MOCK_PATIENTS: Record<string, PatientData> = {
    "9876543210": {
        id: 1,
        name: "Rajesh Kumar",
        dateOfBirth: "1990-05-15",
        bloodGroup: "B+",
        gender: "MALE",
        mobileNumber: "9876543210",
        medicalHistory: [
            { id: 1, diseaseId: 1, diseaseName: "Diabetes Mellitus", description: "Type 2 diabetes diagnosed during routine checkup", startDate: "2022-03-10", endDate: null },
            { id: 2, diseaseId: 4, diseaseName: "Influenza", description: "Seasonal flu with high fever", startDate: "2024-12-01", endDate: "2024-12-15" },
        ],
        conditions: [
            {
                id: 1, diseaseId: 1, diseaseName: "Diabetes Mellitus", status: "STABLE",
                startDate: "2022-03-10", endDate: null, hospitalName: "City General Hospital",
                doctorName: "Dr. Sharma",
                medicineAlloted: [
                    { id: 1, medicineName: "Metformin 500mg", quantity: 2, tillDate: "2025-06-10", timings: ["08:00", "20:00"] },
                ],
            },
            {
                id: 2, diseaseId: 2, diseaseName: "Hypertension", status: "CRITICAL",
                startDate: "2023-07-20", endDate: null, hospitalName: "Apollo Medical Center",
                doctorName: "Dr. Patel",
                medicineAlloted: [
                    { id: 2, medicineName: "Amlodipine 5mg", quantity: 1, tillDate: "2025-07-20", timings: ["09:00"] },
                ],
            },
        ],
    },
    "9123456789": {
        id: 2,
        name: "Priya Mehta",
        dateOfBirth: "1985-11-22",
        bloodGroup: "O+",
        gender: "FEMALE",
        mobileNumber: "9123456789",
        medicalHistory: [
            { id: 3, diseaseId: 5, diseaseName: "Asthma", description: "Childhood asthma, recurring episodes", startDate: "1995-06-01", endDate: null },
        ],
        conditions: [
            {
                id: 3, diseaseId: 5, diseaseName: "Asthma", status: "STABLE",
                startDate: "1995-06-01", endDate: null, hospitalName: "Sunrise Health Clinic",
                doctorName: "Dr. Reddy",
                medicineAlloted: [
                    { id: 3, medicineName: "Salbutamol 100mcg", quantity: 1, tillDate: "2025-12-01", timings: ["07:00", "19:00"] },
                ],
            },
        ],
    },
}

// ─── Types ───────────────────────────────────────────────────────

interface MedicalHistoryItem {
    id: number; diseaseId: number; diseaseName: string; description: string; startDate: string; endDate: string | null
}
interface MedicineAlloted {
    id: number; medicineName: string; quantity: number; tillDate: string; timings: string[]
}
interface ConditionItem {
    id: number; diseaseId: number; diseaseName: string; status: string; startDate: string; endDate: string | null
    hospitalName: string; doctorName: string; medicineAlloted: MedicineAlloted[]
}
interface PatientData {
    id: number; name: string; dateOfBirth: string; bloodGroup: string; gender: string; mobileNumber: string
    medicalHistory: MedicalHistoryItem[]; conditions: ConditionItem[]
}

// ─── Zod Schemas ─────────────────────────────────────────────────

const phoneSchema = z.object({
    phone: z.string().min(10, "Enter a valid 10-digit phone number").max(15),
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
    hospitalId: z.string().min(1, "Select a hospital"),
    doctorId: z.string().min(1, "Select a doctor"),
})

const medicineSchema = z.object({
    medicineId: z.string().min(1, "Select a medicine"),
    quantity: z.string().min(1, "Enter quantity"),
    tillDate: z.date({ required_error: "Till date is required" }),
    timings: z.string().min(1, "Enter at least one timing (comma separated, e.g. 08:00, 20:00)"),
})

// ─── Status Badge Helper ─────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        STABLE: { label: "Stable", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400", icon: <Shield className="h-3 w-3" /> },
        CRITICAL: { label: "Critical", className: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400", icon: <AlertCircle className="h-3 w-3" /> },
        RECOVERED: { label: "Recovered", className: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400", icon: <CheckCircle2 className="h-3 w-3" /> },
    }
    const c = config[status] || config.STABLE
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", c.className)}>
            {c.icon} {c.label}
        </span>
    )
}

// ─── Date Picker Field ───────────────────────────────────────────

function DatePickerField({ field, label, placeholder }: { field: any; label: string; placeholder?: string }) {
    return (
        <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>{placeholder || "Pick a date"}</span>}
                            <CalendarIcon2 className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    )
}

// ═════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════

export default function PatientsPage() {
    const [patient, setPatient] = useState<PatientData | null>(null)
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([])
    const [conditions, setConditions] = useState<ConditionItem[]>([])
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [conditionDialogOpen, setConditionDialogOpen] = useState(false)
    const [medicineDialogOpen, setMedicineDialogOpen] = useState(false)
    const [selectedConditionId, setSelectedConditionId] = useState<number | null>(null)

    // ── Phone Search Form ────────────────────────────────────────
    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phone: "" },
    })

    function handlePhoneSearch(values: z.infer<typeof phoneSchema>) {
        const found = MOCK_PATIENTS[values.phone]
        if (found) {
            setPatient(found)
            setMedicalHistory(found.medicalHistory)
            setConditions(found.conditions)
            toast.success("Patient Found", { description: `Loaded profile for ${found.name}` })
        } else {
            toast.error("Patient Not Found", { description: `No patient found with number ${values.phone}` })
        }
    }

    function handleBack() {
        setPatient(null)
        setMedicalHistory([])
        setConditions([])
        phoneForm.reset()
    }

    // ── Medical History Form ─────────────────────────────────────
    const historyForm = useForm<z.infer<typeof medicalHistorySchema>>({
        resolver: zodResolver(medicalHistorySchema),
        defaultValues: { description: "" },
    })

    function handleAddHistory(values: z.infer<typeof medicalHistorySchema>) {
        const disease = DISEASES.find(d => d.id === Number(values.diseaseId))
        const newEntry: MedicalHistoryItem = {
            id: Date.now(),
            diseaseId: Number(values.diseaseId),
            diseaseName: disease?.name || "Unknown",
            description: values.description || "",
            startDate: format(values.startDate, "yyyy-MM-dd"),
            endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
        }
        setMedicalHistory(prev => [...prev, newEntry])
        toast.success("Medical History Added", { description: `Added ${disease?.name} to history` })
        historyForm.reset()
        setHistoryDialogOpen(false)
    }

    // ── Condition Form ───────────────────────────────────────────
    const conditionForm = useForm<z.infer<typeof conditionSchema>>({
        resolver: zodResolver(conditionSchema),
    })

    function handleAddCondition(values: z.infer<typeof conditionSchema>) {
        const disease = DISEASES.find(d => d.id === Number(values.diseaseId))
        const hospital = HOSPITALS.find(h => h.id === Number(values.hospitalId))
        const doctor = DOCTORS.find(d => d.id === Number(values.doctorId))
        const newEntry: ConditionItem = {
            id: Date.now(),
            diseaseId: Number(values.diseaseId),
            diseaseName: disease?.name || "Unknown",
            status: values.status,
            startDate: format(values.startDate, "yyyy-MM-dd"),
            endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
            hospitalName: hospital?.name || "Unknown",
            doctorName: doctor?.name || "Unknown",
            medicineAlloted: [],
        }
        setConditions(prev => [...prev, newEntry])
        toast.success("Condition Added", { description: `Added ${disease?.name} as ${values.status}` })
        conditionForm.reset()
        setConditionDialogOpen(false)
    }

    // ── Medicine Allotment Form ──────────────────────────────────
    const medicineForm = useForm<z.infer<typeof medicineSchema>>({
        resolver: zodResolver(medicineSchema),
    })

    function handleAssignMedicine(values: z.infer<typeof medicineSchema>) {
        const medicine = MEDICINES.find(m => m.id === Number(values.medicineId))
        const timingsArr = values.timings.split(",").map(t => t.trim())
        setConditions(prev =>
            prev.map(c => {
                if (c.id === selectedConditionId) {
                    return {
                        ...c,
                        medicineAlloted: [
                            ...c.medicineAlloted,
                            {
                                id: Date.now(),
                                medicineName: `${medicine?.brandName} ${medicine?.dosageStrength || ""}`.trim(),
                                quantity: Number(values.quantity),
                                tillDate: format(values.tillDate, "yyyy-MM-dd"),
                                timings: timingsArr,
                            },
                        ],
                    }
                }
                return c
            })
        )
        toast.success("Medicine Assigned", { description: `Assigned ${medicine?.brandName} to condition` })
        medicineForm.reset()
        setMedicineDialogOpen(false)
        setSelectedConditionId(null)
    }

    // ═════════════════════════════════════════════════════════════
    // RENDER
    // ═════════════════════════════════════════════════════════════

    return (
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
            <AnimatePresence mode="wait">
                {!patient ? (
                    /* ──────────── STEP 1: PHONE SEARCH ──────────── */
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
                                    Enter the patient&apos;s phone number to access their profile
                                </p>
                            </div>

                            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                                <Form {...phoneForm}>
                                    <form onSubmit={phoneForm.handleSubmit(handlePhoneSearch)} className="space-y-4">
                                        <FormField
                                            control={phoneForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
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
                                        <Button type="submit" className="w-full h-11 text-base font-medium">
                                            <Search className="mr-2 h-4 w-4" /> Search Patient
                                        </Button>
                                    </form>
                                </Form>

                                <div className="mt-4 rounded-lg border border-dashed p-3">
                                    <p className="text-xs text-muted-foreground text-center">
                                        <span className="font-medium">Demo numbers:</span>{" "}
                                        <button type="button" onClick={() => phoneForm.setValue("phone", "9876543210")} className="text-primary hover:underline cursor-pointer">9876543210</button>
                                        {" · "}
                                        <button type="button" onClick={() => phoneForm.setValue("phone", "9123456789")} className="text-primary hover:underline cursor-pointer">9123456789</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ──────────── STEP 2: PATIENT PROFILE ──────────── */
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mx-auto w-full max-w-5xl space-y-6"
                    >
                        {/* Back Button */}
                        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" /> Back to search
                        </Button>

                        {/* ── Patient Info Header ── */}
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
                                    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
                                        <CalendarIcon2 className="h-3.5 w-3.5 text-blue-500" /> {format(new Date(patient.dateOfBirth), "dd MMM yyyy")}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* ── Tabs ── */}
                        <Tabs defaultValue="history" className="w-full">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="history" className="gap-1.5">
                                    <FileText className="h-4 w-4" /> Medical History
                                </TabsTrigger>
                                <TabsTrigger value="conditions" className="gap-1.5">
                                    <Activity className="h-4 w-4" /> Conditions
                                </TabsTrigger>
                            </TabsList>

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
                                                <form onSubmit={historyForm.handleSubmit(handleAddHistory)} className="space-y-4">
                                                    <FormField control={historyForm.control} name="diseaseId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Disease</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select disease" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {DISEASES.map(d => (
                                                                        <SelectItem key={d.id} value={String(d.id)}>
                                                                            {d.name} <span className="text-muted-foreground ml-1">({d.type})</span>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
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
                                                        <Button type="submit" className="w-full">Save History</Button>
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
                                        {medicalHistory.map((h, i) => (
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
                                                            <h4 className="font-semibold">{h.diseaseName}</h4>
                                                            <Badge variant="secondary" className="text-xs">{DISEASES.find(d => d.id === h.diseaseId)?.type || "—"}</Badge>
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
                                                <DialogDescription>Record a new condition with hospital and doctor assignment.</DialogDescription>
                                            </DialogHeader>
                                            <Form {...conditionForm}>
                                                <form onSubmit={conditionForm.handleSubmit(handleAddCondition)} className="space-y-4">
                                                    <FormField control={conditionForm.control} name="diseaseId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Disease</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select disease" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {DISEASES.map(d => (
                                                                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
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
                                                    <FormField control={conditionForm.control} name="hospitalId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Hospital</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select hospital" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {HOSPITALS.map(h => (
                                                                        <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={conditionForm.control} name="doctorId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Doctor</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {DOCTORS.map(d => (
                                                                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <DialogFooter>
                                                        <Button type="submit" className="w-full">Save Condition</Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* ── Medicine Assign Dialog (shared) ── */}
                                <Dialog open={medicineDialogOpen} onOpenChange={(open) => { setMedicineDialogOpen(open); if (!open) setSelectedConditionId(null) }}>
                                    <DialogContent className="sm:max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Assign Medicine</DialogTitle>
                                            <DialogDescription>Prescribe medicine for this condition.</DialogDescription>
                                        </DialogHeader>
                                        <Form {...medicineForm}>
                                            <form onSubmit={medicineForm.handleSubmit(handleAssignMedicine)} className="space-y-4">
                                                <FormField control={medicineForm.control} name="medicineId" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Medicine</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {MEDICINES.map(m => (
                                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                                        {m.brandName} ({m.genericName}) — {m.dosageStrength} {m.dosageForm}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
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
                                                <FormField control={medicineForm.control} name="timings" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Timings</FormLabel>
                                                        <FormControl><Input placeholder="08:00, 14:00, 20:00" {...field} /></FormControl>
                                                        <p className="text-xs text-muted-foreground">Comma separated (e.g. 08:00, 20:00)</p>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <DialogFooter>
                                                    <Button type="submit" className="w-full">Assign Medicine</Button>
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
                                        {conditions.map((c, i) => (
                                            <motion.div
                                                key={c.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="rounded-xl border bg-card shadow-sm overflow-hidden"
                                            >
                                                {/* Condition Header */}
                                                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold">{c.diseaseName}</h4>
                                                            <StatusBadge status={c.status} />
                                                        </div>
                                                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {c.hospitalName}</span>
                                                            <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> {c.doctorName}</span>
                                                            <span className="flex items-center gap-1">
                                                                <CalendarIcon2 className="h-3.5 w-3.5" /> {format(new Date(c.startDate), "dd MMM yyyy")}
                                                                {c.endDate ? ` — ${format(new Date(c.endDate), "dd MMM yyyy")}` : " — Present"}
                                                            </span>
                                                        </div>
                                                    </div>
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

                                                {/* Medicines List */}
                                                {c.medicineAlloted.length > 0 && (
                                                    <div className="border-t bg-muted/30 px-4 py-3">
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Prescribed Medicines</p>
                                                        <div className="grid gap-2">
                                                            {c.medicineAlloted.map(m => (
                                                                <div key={m.id} className="flex items-center justify-between rounded-lg bg-background p-3 text-sm border">
                                                                    <div className="flex items-center gap-2">
                                                                        <Pill className="h-4 w-4 text-primary shrink-0" />
                                                                        <span className="font-medium">{m.medicineName}</span>
                                                                        <Badge variant="secondary" className="text-xs">Qty: {m.quantity}</Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                                                                        <span className="flex items-center gap-1 text-xs">
                                                                            <Clock className="h-3 w-3" /> {m.timings.join(", ")}
                                                                        </span>
                                                                        <span className="text-xs">till {format(new Date(m.tillDate), "dd MMM yyyy")}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
