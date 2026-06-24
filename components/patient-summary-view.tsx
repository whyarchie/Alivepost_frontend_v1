"use client"

import ReactMarkdown from "react-markdown"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ShieldAlert, AlertCircle, Shield, CheckCircle2, HelpCircle,
    TrendingDown, TrendingUp, Minus, Activity, ArrowUpCircle, AlertTriangle, CircleDot,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
    ChartContainer, ChartTooltip, ChartTooltipContent,
    ChartLegend, ChartLegendContent, type ChartConfig,
} from "@/components/ui/chart"
import type { PatientSummary, PatientStatus, PatientTrend } from "@/lib/api"

// ── Status / trend visual config ─────────────────────────────────
const STATUS_CONFIG: Record<PatientStatus, {
    label: string; banner: string; chip: string; icon: React.ElementType
}> = {
    CRITICAL: { label: "Critical", banner: "border-red-500/30 bg-red-500/10", chip: "bg-red-500/15 text-red-700 border-red-500/30", icon: ShieldAlert },
    WATCH: { label: "Watch", banner: "border-amber-500/30 bg-amber-500/10", chip: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: AlertCircle },
    STABLE: { label: "Stable", banner: "border-emerald-500/30 bg-emerald-500/10", chip: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", icon: Shield },
    RECOVERED: { label: "Recovered", banner: "border-blue-500/30 bg-blue-500/10", chip: "bg-blue-500/15 text-blue-700 border-blue-500/30", icon: CheckCircle2 },
    UNKNOWN: { label: "Unknown", banner: "border-muted-foreground/20 bg-muted/40", chip: "bg-muted text-muted-foreground border-muted-foreground/20", icon: HelpCircle },
}

const TREND_CONFIG: Record<PatientTrend, { label: string; className: string; icon: React.ElementType }> = {
    DECLINING: { label: "Declining", className: "text-red-600", icon: TrendingDown },
    FLAT: { label: "Flat", className: "text-amber-600", icon: Minus },
    IMPROVING: { label: "Improving", className: "text-emerald-600", icon: TrendingUp },
    INSUFFICIENT_DATA: { label: "Insufficient data", className: "text-muted-foreground", icon: HelpCircle },
}

const PRIORITY_CONFIG: Record<string, { className: string; icon: React.ElementType }> = {
    URGENT: { className: "bg-red-500/15 text-red-700 border-red-500/30", icon: AlertTriangle },
    IMPORTANT: { className: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: ArrowUpCircle },
    ROUTINE: { className: "bg-muted text-muted-foreground border-muted-foreground/20", icon: CircleDot },
}

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const markdownComponents = {
    h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-6 mb-3" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-lg font-semibold mt-3 mb-1" {...props} />,
    p: ({ node, ...props }: any) => <p className="text-sm text-muted-foreground mb-2" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
    li: ({ node, ...props }: any) => <li className="text-sm text-muted-foreground" {...props} />,
    table: ({ node, ...props }: any) => <table className="w-full text-sm border-collapse my-3" {...props} />,
    th: ({ node, ...props }: any) => <th className="border border-muted-foreground/20 px-3 py-2 text-left bg-muted" {...props} />,
    td: ({ node, ...props }: any) => <td className="border border-muted-foreground/20 px-3 py-2" {...props} />,
    blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3" {...props} />,
    code: ({ node, ...props }: any) => <code className="bg-muted px-2 py-1 rounded text-xs font-mono" {...props} />,
}

export function PatientSummaryView({ summary }: { summary: PatientSummary }) {
    const status = STATUS_CONFIG[summary.status] ?? STATUS_CONFIG.UNKNOWN
    const trend = TREND_CONFIG[summary.trend] ?? TREND_CONFIG.INSUFFICIENT_DATA
    const StatusIcon = status.icon
    const TrendIcon = trend.icon

    // ── Build one chart series per condition, pivoted by date ─────
    const valid = summary.recoveryTrajectory.filter((p) => typeof p.recovery === "number")
    const seriesNames = Array.from(new Set(valid.map((p) => p.condition || "Recovery")))
    const series = seriesNames.map((name, i) => ({ name, key: `s${i}`, color: PALETTE[i % PALETTE.length] }))
    const keyByName = new Map(series.map((s) => [s.name, s.key]))

    const rowsByDate = new Map<string, Record<string, number | string>>()
    for (const p of valid) {
        const key = keyByName.get(p.condition || "Recovery")!
        const row = rowsByDate.get(p.date) ?? { date: p.date }
        row[key] = p.recovery as number
        rowsByDate.set(p.date, row)
    }
    const chartData = Array.from(rowsByDate.values()).sort(
        (a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
    )
    const canChart = valid.length >= 2

    const chartConfig = Object.fromEntries(
        series.map((s) => [s.key, { label: s.name, color: s.color }])
    ) satisfies ChartConfig

    return (
        <div className="space-y-5">
            {/* ── Status banner ───────────────────────────────── */}
            <div className={cn("rounded-xl border p-4", status.banner)}>
                <div className="flex flex-wrap items-center gap-3">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold", status.chip)}>
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                    </span>
                    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", trend.className)}>
                        <TrendIcon className="h-4 w-4" />
                        {trend.label}
                    </span>
                </div>
                {summary.statusReason && (
                    <p className="mt-2 text-sm text-foreground/80">{summary.statusReason}</p>
                )}
            </div>

            {/* ── Critical info ───────────────────────────────── */}
            {summary.criticalInfo.length > 0 && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        Critical Information
                    </div>
                    <ul className="space-y-1.5">
                        {summary.criticalInfo.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm text-foreground/80">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Recovery chart ──────────────────────────────── */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Recovery Trajectory
                </div>
                {canChart ? (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
                        <AreaChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
                            <defs>
                                {series.map((s) => (
                                    <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={`var(--color-${s.key})`} stopOpacity={0.7} />
                                        <stop offset="95%" stopColor={`var(--color-${s.key})`} stopOpacity={0.08} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={24}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                }
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={32}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                        }
                                        indicator="dot"
                                    />
                                }
                            />
                            {series.map((s) => (
                                <Area
                                    key={s.key}
                                    dataKey={s.key}
                                    type="monotone"
                                    fill={`url(#fill-${s.key})`}
                                    stroke={`var(--color-${s.key})`}
                                    strokeWidth={2}
                                    connectNulls
                                />
                            ))}
                            {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        {valid.length === 1
                            ? "Only one recovery data point recorded — not enough to plot a trend."
                            : "No recovery percentages recorded yet."}
                    </p>
                )}
            </div>

            {/* ── Recommended actions ─────────────────────────── */}
            {summary.recommendedActions.length > 0 && (
                <div className="rounded-lg border bg-card p-4">
                    <div className="mb-2 text-sm font-semibold">Recommended Actions</div>
                    <ul className="space-y-2">
                        {summary.recommendedActions.map((a, i) => {
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

            {/* ── Full markdown report ────────────────────────── */}
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-6">
                <ReactMarkdown components={markdownComponents}>
                    {summary.summaryMarkdown}
                </ReactMarkdown>
            </div>
        </div>
    )
}
