"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
    Phone, Search, ArrowLeft, Plus, Trash2, Loader2, Save, Send, AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { searchPatientByMobile, createPatientProgress } from "@/lib/api"



interface Option {
    id: string
    text: string
    image?: string
}

type QuestionType = "TEXT" | "MULTIPLE_CHOICE"

interface Question {
    id: string
    question: string
    isText: boolean
    image?: string
    options?: Option[]
}

export default function CreateProgressPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>}>
            <CreateProgressContent />
        </Suspense>
    )
}

function CreateProgressContent() {
    const searchParams = useSearchParams()
    const initialMobile = searchParams.get("mobile") || ""
    const initialConditionId = searchParams.get("conditionId") || ""

    const queryClient = useQueryClient()

    // Steps state
    const [mobileNumber, setMobileNumber] = useState(initialMobile)
    const [activeMobileSearch, setActiveMobileSearch] = useState<string | null>(initialMobile || null)
    const [selectedConditionId, setSelectedConditionId] = useState<string>(initialConditionId)

    // Tracking config state
    const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
    const [frequency, setFrequency] = useState<string>("1")
    const [occurrences, setOccurrences] = useState<string>("5")

    // Questions builder state
    const [questions, setQuestions] = useState<Question[]>([])

    // Queries
    const patientQuery = useQuery({
        queryKey: ["patient-search-mobile", activeMobileSearch],
        queryFn: () => searchPatientByMobile(activeMobileSearch!),
        enabled: activeMobileSearch !== null,
    })

    // Watch for patient changes, and if we have initialConditionId set it
    useEffect(() => {
        if (patientQuery.data?.data) {
            if (initialConditionId && !selectedConditionId) {
                setSelectedConditionId(initialConditionId)
            }
        }
    }, [patientQuery.data, initialConditionId, selectedConditionId])

    const progressMutation = useMutation({
        mutationFn: async () => {
            // Map the questions configuration to match backend schema
            const mappedQuestions = questions.map(q => ({
                question: q.question,
                isText: q.isText,
                image: q.image,
                options: !q.isText ? q.options?.map(o => ({ text: o.text, image: o.image })) : undefined
            }))

            return createPatientProgress({
                patientConditionId: parseInt(selectedConditionId),
                frequency: parseInt(frequency),
                totalOccurrences: parseInt(occurrences),
                questions: mappedQuestions,
                startDate: new Date(startDate).toISOString(),
            })
        },
        onSuccess: () => {
            toast.success("Progress tracking scheduled successfully")
            // Reset form optionally or take user back
            setActiveMobileSearch(null)
            setMobileNumber("")
            setSelectedConditionId("")
            setQuestions([
                {
                    id: crypto.randomUUID(),
                    isText: true,
                    question: "How are you feeling today?",
                }
            ])
        },
        onError: (error: Error) => {
            toast.error("Failed to setup progress tracking", { description: error.message })
        }
    })

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (mobileNumber.length >= 10) {
            setActiveMobileSearch(mobileNumber)
        } else {
            toast.error("Enter a valid mobile number")
        }
    }

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: crypto.randomUUID(),
                isText: true,
                question: "",
            }
        ])
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                // If switching from text to multiple choice, ensure options exist
                if (updates.isText === false && !q.options) {
                    return { ...q, ...updates, options: [{ id: crypto.randomUUID(), text: "Option 1" }, { id: crypto.randomUUID(), text: "Option 2" }] }
                }
                // If switching to text, clear options
                if (updates.isText === true) {
                    return { ...q, ...updates, options: undefined }
                }
                return { ...q, ...updates }
            }
            return q
        }))
    }

    const addOption = (questionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: [...q.options, { id: crypto.randomUUID(), text: `Option ${q.options.length + 1}` }]
                }
            }
            return q
        }))
    }

    const updateOption = (questionId: string, optionId: string, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: q.options.map(o => o.id === optionId ? { ...o, text } : o)
                }
            }
            return q
        }))
    }

    const removeOption = (questionId: string, optionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: q.options.filter(o => o.id !== optionId)
                }
            }
            return q
        }))
    }

    const handleSubmit = () => {
        // Basic validation
        if (!selectedConditionId) {
            toast.error("Please select a patient condition")
            return
        }
        if (!startDate || parseInt(frequency) <= 0 || parseInt(occurrences) <= 0) {
            toast.error("Please fill valid tracking settings")
            return
        }
        if (questions.length === 0) {
            toast.error("Please add at least one question")
            return
        }

        for (let q of questions) {
            if (!q.question.trim()) {
                toast.error("All questions must have a prompt text")
                return
            }
            if (!q.isText && (!q.options || q.options.length < 2)) {
                toast.error("Multiple choice questions must have at least 2 options")
                return
            }
        }

        progressMutation.mutate()
    }

    const patient = patientQuery.data?.data
    const conditions = patient?.conditions || []

    return (
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 w-full max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Progress Tracking Builder</h1>
                <p className="mt-2 text-muted-foreground">
                    Schedule dynamic progress check-ins with patients and attach custom questionnaires.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!activeMobileSearch ? (
                    <motion.div
                        key="search"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-1 items-center justify-center min-h-[400px]"
                    >
                        <Card className="w-full max-w-md shadow-sm border-dashed">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                    <Search className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Find Patient</CardTitle>
                                <CardDescription>Enter patient mobile number to pull up their active conditions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Mobile Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="9876543210"
                                                className="pl-9 h-11 text-base"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-11 text-base font-medium">
                                        <Search className="mr-2 h-4 w-4" /> Start Form Builder
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : patientQuery.isLoading ? (
                    <motion.div key="loading" className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </motion.div>
                ) : patientQuery.isError ? (
                    <motion.div key="error" className="flex flex-col items-center justify-center py-20 gap-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <p className="text-lg font-medium">Patient not found</p>
                        <Button variant="outline" onClick={() => setActiveMobileSearch(null)}>Back to search</Button>
                    </motion.div>
                ) : patient ? (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Button variant="ghost" size="sm" onClick={() => setActiveMobileSearch(null)} className="gap-1.5 text-muted-foreground -ml-4">
                            <ArrowLeft className="h-4 w-4" /> Back to search
                        </Button>

                        {/* Meta config layer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
                                        Patient & Condition Targeting
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase font-semibold">Selected Patient : {patient.id}</Label>
                                        <p className="font-medium text-lg">{patient.name} <span className="text-sm font-normal text-muted-foreground ml-2">({patient.mobileNumber})</span></p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Target Condition</Label>
                                        <Select value={selectedConditionId} onValueChange={setSelectedConditionId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select patient condition..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {conditions.length === 0 && <SelectItem value="none" disabled>No active conditions found</SelectItem>}
                                                {conditions.map((c: any) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.disease?.name} (Started {format(new Date(c.startDate), "MMM d")}) - {c.status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
                                        Tracking Parameters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label>Start Date</Label>
                                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Frequency (Days gap)</Label>
                                            <Input type="number" min="1" value={frequency} onChange={e => setFrequency(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Total Occurrences</Label>
                                            <Input type="number" min="1" value={occurrences} onChange={e => setOccurrences(e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Questions builder layer */}
                        <Card className="shadow-sm border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
                                    Questionnaire Form Builder
                                </CardTitle>
                                <CardDescription>Design the questions the patient will receive at each check-in interval.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {questions.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No questions configured yet. Add some questions below.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {questions.map((q, index) => (
                                            <div key={q.id} className="p-4 rounded-xl border bg-muted/20 relative group">
                                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-muted-foreground mr-2">Q{index + 1}</span>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeQuestion(q.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-4 mb-4">
                                                    <div className="flex-1 space-y-2">
                                                        <Label>Question text</Label>
                                                        <Input
                                                            placeholder="e.g. Rate your pain from 1-10"
                                                            value={q.question}
                                                            onChange={e => updateQuestion(q.id, { question: e.target.value })}
                                                            className="bg-background"
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-48 space-y-2 shrink-0">
                                                        <Label>Question Type</Label>
                                                        <Select
                                                            value={q.isText ? "TEXT" : "MULTIPLE_CHOICE"}
                                                            onValueChange={(val: QuestionType) => updateQuestion(q.id, { isText: val === "TEXT" })}
                                                        >
                                                            <SelectTrigger className="bg-background">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="TEXT">Short/Long Text</SelectItem>
                                                                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Options builder for MULTIPLE_CHOICE */}
                                                {!q.isText && q.options && (
                                                    <div className="mt-4 pt-4 border-t border-muted-foreground/20 space-y-3">
                                                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Answer Options</Label>
                                                        <div className="space-y-2">
                                                            {q.options.map((opt, optIndex) => (
                                                                <div key={opt.id} className="flex items-center gap-2">
                                                                    <div className="flex items-center justify-center w-6 text-xs font-medium text-muted-foreground bg-background rounded border h-9">{optIndex + 1}</div>
                                                                    <Input
                                                                        placeholder="Option text..."
                                                                        value={opt.text}
                                                                        onChange={e => updateOption(q.id, opt.id, e.target.value)}
                                                                        className="h-9 bg-background flex-1"
                                                                    />
                                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeOption(q.id, opt.id)}>
                                                                        <XIcon className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => addOption(q.id)} className="gap-1.5 border-dashed">
                                                            <Plus className="h-4 w-4" /> Add Option
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button variant="secondary" onClick={addQuestion} className="w-full border border-dashed border-primary/30 gap-2">
                                    <Plus className="h-4 w-4" /> Add Another Question
                                </Button>
                            </CardContent>
                            <CardFooter className="bg-primary/5 border-t px-6 py-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground italic">Review your configuration carefully before deploying to patient.</p>
                                <Button onClick={handleSubmit} size="lg" className="min-w-32 gap-2 shadow-sm font-semibold" disabled={progressMutation.isPending}>
                                    {progressMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Scheduling...</> : <><Send className="h-4 w-4" /> Schedule Check-ins</>}
                                </Button>
                            </CardFooter>
                        </Card>

                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
