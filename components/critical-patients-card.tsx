"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
    ShieldAlert, Loader2, AlertCircle, ChevronRight, CheckCircle2, Stethoscope, ArrowRight,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getHighRiskPatients } from "@/lib/api"

// Show up to this many on the dashboard; the rest live on the High-Risk page.
const MAX_SHOWN = 50

export function CriticalPatientsCard() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["critical-patients", MAX_SHOWN],
        queryFn: () => getHighRiskPatients(1, MAX_SHOWN),
        staleTime: 60 * 1000,
    })

    const patients = data?.data?.patients ?? []
    const total = data?.data?.pagination?.total ?? 0

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-red-500" /> Critical Patients
                        {total > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-red-500/15 text-red-700 border-red-500/30">
                                {total}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>Patients with an active critical condition — click to open their profile</CardDescription>
                </div>
                {total > MAX_SHOWN && (
                    <Link
                        href="/dashboard/high-risk"
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                        View all <ArrowRight className="h-3 w-3" />
                    </Link>
                )}
            </CardHeader>

            <CardContent className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading critical patients…</span>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <p className="text-sm font-medium">Failed to load critical patients</p>
                        <p className="text-xs text-muted-foreground">{(error as Error)?.message}</p>
                    </div>
                ) : patients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500/70" />
                        <p className="text-sm font-medium">No critical patients</p>
                        <p className="text-xs text-muted-foreground">None of your patients currently have a critical condition.</p>
                    </div>
                ) : (
                    <div className="grid gap-2 max-h-[420px] overflow-y-auto pr-1 -mr-1">
                        {patients.map((pat: any) => {
                            const criticalConditions = (pat.conditions || []).filter((c: any) => c.status === "CRITICAL")
                            const doctor = criticalConditions.find((c: any) => c.doctor)?.doctor
                            return (
                                <Link
                                    key={pat.id}
                                    href={`/dashboard/patients?mobile=${pat.mobileNumber}`}
                                    className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:border-red-500/40 hover:shadow-sm"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 font-semibold text-xs">
                                        {pat.name?.slice(0, 2).toUpperCase() || "??"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-semibold text-sm leading-none">{pat.name}</p>
                                            <span className="font-mono text-xs text-muted-foreground">{pat.mobileNumber}</span>
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                            {criticalConditions.slice(0, 3).map((c: any) => (
                                                <Badge key={c.id} variant="outline" className="text-[10px] py-0 px-1.5 font-medium text-red-600 bg-red-500/5 border-red-500/20">
                                                    {c.disease?.name || `Disease #${c.diseaseId}`}
                                                </Badge>
                                            ))}
                                            {criticalConditions.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground">+{criticalConditions.length - 3} more</span>
                                            )}
                                            {doctor && (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Stethoscope className="h-3 w-3" /> {doctor.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-red-500" />
                                </Link>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
