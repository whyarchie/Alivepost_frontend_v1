"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { useQuery } from "@tanstack/react-query"
import {
    Sparkles, RefreshCw, Loader2, AlertCircle, ShieldAlert, ShieldCheck,
    Shield, HeartPulse, HelpCircle, ChevronDown, AlertTriangle, ArrowUpCircle,
    CircleDot, Lightbulb,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getHospitalAiOverview, type PopulationStatus } from "@/lib/api"

const STATUS_CONFIG: Record<PopulationStatus, {
    label: string; banner: string; chip: string; icon: React.ElementType
}> = {
    CRITICAL: { label: "Critical", banner: "border-red-500/30 bg-red-500/10", chip: "bg-red-500/15 text-red-700 border-red-500/30", icon: ShieldAlert },
    NEEDS_ATTENTION: { label: "Needs Attention", banner: "border-amber-500/30 bg-amber-500/10", chip: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: AlertCircle },
    STABLE: { label: "Stable", banner: "border-emerald-500/30 bg-emerald-500/10", chip: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", icon: Shield },
    HEALTHY: { label: "Healthy", banner: "border-blue-500/30 bg-blue-500/10", chip: "bg-blue-500/15 text-blue-700 border-blue-500/30", icon: ShieldCheck },
    UNKNOWN: { label: "Unknown", banner: "border-muted-foreground/20 bg-muted/40", chip: "bg-muted text-muted-foreground border-muted-foreground/20", icon: HelpCircle },
}

const PRIORITY_CONFIG: Record<string, { className: string; icon: React.ElementType }> = {
    URGENT: { className: "bg-red-500/15 text-red-700 border-red-500/30", icon: AlertTriangle },
    IMPORTANT: { className: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: ArrowUpCircle },
    ROUTINE: { className: "bg-muted text-muted-foreground border-muted-foreground/20", icon: CircleDot },
}

const markdownComponents = {
    h1: ({ node, ...props }: any) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-base font-semibold mt-3 mb-1.5" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
    p: ({ node, ...props }: any) => <p className="text-sm text-muted-foreground mb-2" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
    li: ({ node, ...props }: any) => <li className="text-sm text-muted-foreground" {...props} />,
    table: ({ node, ...props }: any) => <table className="w-full text-sm border-collapse my-3" {...props} />,
    th: ({ node, ...props }: any) => <th className="border border-muted-foreground/20 px-3 py-2 text-left bg-muted" {...props} />,
    td: ({ node, ...props }: any) => <td className="border border-muted-foreground/20 px-3 py-2" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-semibold text-foreground" {...props} />,
}

export function HospitalOverviewCard() {
    const [showFull, setShowFull] = useState(false)

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["hospital-ai-overview"],
        queryFn: getHospitalAiOverview,
        // The LLM call is slow and costs tokens — cache aggressively and don't
        // refetch on tab focus. The user can regenerate on demand.
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    })

    const overview = data?.data
    const status = STATUS_CONFIG[overview?.status ?? "UNKNOWN"] ?? STATUS_CONFIG.UNKNOWN
    const StatusIcon = status.icon

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" /> AI Patient Overview
                    </CardTitle>
                    <CardDescription>Auto-generated summary of your entire patient population</CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
                    <span className="hidden sm:inline">{isLoading ? "Analyzing" : "Regenerate"}</span>
                </Button>
            </CardHeader>

            <CardContent className="flex-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Analyzing your patient population…</p>
                        <p className="text-xs text-muted-foreground/70">This can take a few seconds.</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <p className="text-sm font-medium">Couldn&apos;t generate the overview</p>
                        <p className="text-xs text-muted-foreground max-w-md">{(error as Error)?.message}</p>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
                            <RefreshCw className="h-3.5 w-3.5" /> Try again
                        </Button>
                    </div>
                ) : overview ? (
                    <div className="space-y-5">
                        {/* Headline + status */}
                        <div className={cn("rounded-xl border p-4", status.banner)}>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold", status.chip)}>
                                    <StatusIcon className="h-4 w-4" />
                                    {status.label}
                                </span>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1"><HeartPulse className="h-3.5 w-3.5" /> {overview.stats.activePatients} active</span>
                                    <span className="inline-flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-red-500" /> {overview.stats.highRiskPatients} critical</span>
                                </div>
                            </div>
                            {overview.headline && (
                                <p className="mt-2.5 text-sm font-medium text-foreground/90">{overview.headline}</p>
                            )}
                        </div>

                        {/* Key insights */}
                        {overview.keyInsights.length > 0 && (
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                    <Lightbulb className="h-4 w-4 text-amber-500" /> Key Insights
                                </div>
                                <ul className="space-y-1.5">
                                    {overview.keyInsights.map((item, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-foreground/80">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Concerns */}
                        {overview.concerns.length > 0 && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                                    <AlertCircle className="h-4 w-4" /> Concerns
                                </div>
                                <ul className="space-y-1.5">
                                    {overview.concerns.map((item, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-foreground/80">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommended actions */}
                        {overview.recommendedActions.length > 0 && (
                            <div>
                                <div className="mb-2 text-sm font-semibold">Recommended Actions</div>
                                <ul className="space-y-2">
                                    {overview.recommendedActions.map((a, i) => {
                                        const p = PRIORITY_CONFIG[a.priority] ?? PRIORITY_CONFIG.ROUTINE
                                        const PIcon = p.icon
                                        return (
                                            <li key={i} className="flex items-start gap-2.5">
                                                <span className={cn("mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", p.className)}>
                                                    <PIcon className="h-3 w-3" />
                                                    {a.priority}
                                                </span>
                                                <span className="text-sm text-foreground/80">{a.action}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Full briefing (collapsible) */}
                        {overview.summaryMarkdown && (
                            <div className="rounded-lg border bg-muted/30">
                                <button
                                    type="button"
                                    onClick={() => setShowFull((v) => !v)}
                                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
                                >
                                    Full briefing
                                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showFull && "rotate-180")} />
                                </button>
                                {showFull && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none border-t px-4 py-3">
                                        <ReactMarkdown components={markdownComponents}>
                                            {overview.summaryMarkdown}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    )
}
