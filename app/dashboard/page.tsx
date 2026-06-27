"use client"

import { useRouter } from "next/navigation"
import {
  UserRoundPlus, Search, Stethoscope, Pill, Activity, Microscope,
  ArrowRight, Users, HeartPulse, Building2, AlertCircle, AlertTriangle, ChartPie, TrendingUp, CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { getDashboardSummary, getDashboardCharts } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { format } from "date-fns"

const quickActions = [
  {
    title: "Create Patient",
    description: "Register a new patient in the system",
    icon: UserRoundPlus,
    href: "/dashboard/create-patient",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Search Patient",
    description: "Look up a patient by phone number",
    icon: Search,
    href: "/dashboard/patients",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    title: "Manage Doctors",
    description: "View and add hospital doctors",
    icon: Stethoscope,
    href: "/dashboard/doctors",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    title: "Medications",
    description: "Browse and add medicines",
    icon: Pill,
    href: "/dashboard/medications",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    title: "Diseases",
    description: "Manage disease registry",
    icon: Microscope,
    href: "/dashboard/diseases",
    color: "text-rose-600",
    bg: "bg-rose-500/10",
  },
]

export default function DashboardPage() {
  const router = useRouter()

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  })

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: getDashboardCharts,
  })

  const stats = summaryData?.data || {
    totalPatients: 0,
    activePatients: 0,
    criticalAlerts: 0,
    highRiskPatients: 0,
  }

  const statsCharts = chartsData?.data || {
    activeConditions: { stable: 0, critical: 0, recovered: 0 },
    medicationAdherence: { taken: 0, missed: 0, complianceRate: 0 },
    topDiseases: [],
    followUpStatuses: [],
    recoveryTrend: [],
  }

  const displayVal = (val: number) => {
    if (isLoading) return "..."
    return val.toString()
  }

  // Configurations & Chart Mappings
  const activeConditionsConfig = {
    stable: { label: "Stable", color: "#10b981" },
    critical: { label: "Critical", color: "#ef4444" },
    recovered: { label: "Recovered", color: "#3b82f6" },
  } satisfies ChartConfig

  const activeConditionsData = [
    { name: "Stable", value: statsCharts.activeConditions.stable, fill: "#10b981" },
    { name: "Critical", value: statsCharts.activeConditions.critical, fill: "#ef4444" },
    { name: "Recovered", value: statsCharts.activeConditions.recovered, fill: "#3b82f6" },
  ].filter(d => d.value > 0)

  // Fallback if all active conditions are 0
  const hasActiveConditions = activeConditionsData.length > 0
  const activeConditionsDisplayData = hasActiveConditions 
    ? activeConditionsData 
    : [{ name: "No active conditions", value: 1, fill: "hsl(var(--muted-foreground)/0.2)" }]

  // Medication compliance gauge data
  const adherenceData = [
    {
      name: "Compliance",
      value: statsCharts.medicationAdherence.complianceRate,
      fill: "#6366f1",
    }
  ]

  // Top diseases bar chart mapping
  const topDiseasesData = (statsCharts.topDiseases || []).map(d => ({
    disease: d.disease,
    count: d.count,
    fill: "#3b82f6",
  }))

  const topDiseasesConfig = {
    count: { label: "Count", color: "#3b82f6" }
  } satisfies ChartConfig

  // Follow-up statuses donut chart mapping
  const donutColors = ["#6366f1", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b"]
  const followUpData = (statsCharts.followUpStatuses || []).map((f, idx) => ({
    name: f.status,
    value: f.count,
    fill: donutColors[idx % donutColors.length]
  }))

  const hasFollowUpData = followUpData.length > 0
  const followUpDisplayData = hasFollowUpData
    ? followUpData
    : [{ name: "No records", value: 1, fill: "hsl(var(--muted-foreground)/0.2)" }]

  const followUpConfig = {
    count: { label: "Count" }
  } satisfies ChartConfig

  // Recovery Trend Line mapping
  const recoveryTrendData = (statsCharts.recoveryTrend || []).map(r => {
    let dateStr = r.date
    try {
      dateStr = format(new Date(r.date), "dd MMM")
    } catch (e) {}
    return {
      date: dateStr,
      recovery: r.averageRecovery,
    }
  })

  const recoveryTrendConfig = {
    recovery: { label: "Average Recovery (%)", color: "#3b82f6" }
  } satisfies ChartConfig

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            <Card onClick={() => router.push("/dashboard/patients")}
            className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" /> Total Patients
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {displayVal(stats.totalPatients)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Registered patients in system</div>
              </CardFooter>
            </Card>

            <Card onClick={() => router.push("/dashboard/patients")}
            className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-emerald-600" /> Active Patients
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {displayVal(stats.activePatients)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Patients with ongoing conditions</div>
              </CardFooter>
            </Card>

            <Card className={cn("@container/card transition-colors duration-300", stats.criticalAlerts > 0 && "border-red-500/30 bg-red-500/[0.02]")}>
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <AlertCircle className={cn("h-4 w-4", stats.criticalAlerts > 0 ? "text-red-600 animate-pulse" : "text-muted-foreground")} /> Critical Alerts
                </CardDescription>
                <CardTitle className={cn("text-2xl font-semibold tabular-nums @[250px]/card:text-3xl", stats.criticalAlerts > 0 && "text-red-600")}>
                  {displayVal(stats.criticalAlerts)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Patients requiring urgent care</div>
              </CardFooter>
            </Card>

            <Card 
              onClick={() => router.push("/dashboard/high-risk")}
              className={cn("@container/card transition-all duration-300 cursor-pointer hover:border-amber-500/40 hover:shadow-md", stats.highRiskPatients > 0 && "border-amber-500/30 bg-amber-500/[0.02]")}
            >
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <AlertTriangle className={cn("h-4 w-4", stats.highRiskPatients > 0 ? "text-amber-600" : "text-muted-foreground")} /> High Risk Patients
                </CardDescription>
                <CardTitle className={cn("text-2xl font-semibold tabular-nums @[250px]/card:text-3xl", stats.highRiskPatients > 0 && "text-amber-600")}>
                  {displayVal(stats.highRiskPatients)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">High risk patient cases</div>
              </CardFooter>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Chart 3: Active Conditions (Pie) */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-base font-semibold flex items-center gap-1.5"><ChartPie className="h-4 w-4 text-primary" /> Active Conditions</CardTitle>
                <CardDescription>Breakdown of current patient statuses</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
                  <div className="h-[200px] w-[200px]">
                    <ChartContainer config={activeConditionsConfig} className="mx-auto aspect-square max-h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Pie
                            data={activeConditionsDisplayData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            strokeWidth={1}
                          >
                            {activeConditionsDisplayData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-3 justify-center">
                    {hasActiveConditions ? (
                      activeConditionsData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                          <span className="font-medium text-muted-foreground">{d.name}</span>
                          <span className="font-semibold ml-auto">{d.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No active cases</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart 9: Medication Adherence (Radial Progress) */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-base font-semibold flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Medication Adherence</CardTitle>
                <CardDescription>Overall compliance rate of medications</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <div className="relative flex items-center justify-center h-[200px] w-full mt-4">
                  <ChartContainer config={{}} className="mx-auto aspect-square max-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="75%"
                        outerRadius="95%"
                        barSize={12}
                        data={adherenceData}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        <RadialBar
                          background={{ fill: "hsl(var(--muted)/0.3)" }}
                          dataKey="value"
                          cornerRadius={6}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold tracking-tight">
                      {statsCharts.medicationAdherence.complianceRate}%
                    </span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mt-0.5">Compliance</span>
                  </div>
                </div>
                <div className="flex justify-center gap-6 pb-4 text-xs mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Taken:</span>
                    <span className="font-semibold">{statsCharts.medicationAdherence.taken}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Missed:</span>
                    <span className="font-semibold">{statsCharts.medicationAdherence.missed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Chart 5: Top Diseases (Bar) */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-1.5"><Activity className="h-4 w-4 text-primary" /> Top Diseases</CardTitle>
                <CardDescription>Most frequently diagnosed illnesses</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="h-[250px] w-full">
                  {topDiseasesData.length > 0 ? (
                    <ChartContainer config={topDiseasesConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topDiseasesData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.4)" />
                          <XAxis dataKey="disease" tickLine={false} axisLine={false} style={{ fontSize: "11px" }} />
                          <YAxis tickLine={false} axisLine={false} style={{ fontSize: "11px" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No disease records</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chart 8: Follow-Up Statuses (Donut) */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-base font-semibold flex items-center gap-1.5"><Microscope className="h-4 w-4 text-primary" /> Follow-Up Statuses</CardTitle>
                <CardDescription>Patient check-in response statuses</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 mt-2">
                  <div className="h-[180px] w-[180px]">
                    <ChartContainer config={followUpConfig} className="mx-auto aspect-square max-h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Pie
                            data={followUpDisplayData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            strokeWidth={1}
                            paddingAngle={3}
                          >
                            {followUpDisplayData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2.5 justify-center">
                    {hasFollowUpData ? (
                      followUpData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                          <span className="font-medium text-muted-foreground">{d.name}</span>
                          <span className="font-semibold ml-auto">{d.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No follow-ups recorded</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart 7: Patient Recovery Over Time (Line) */}
          <div className="w-full mt-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-primary" /> Patient Recovery Over Time</CardTitle>
                <CardDescription>Average recovery trend (%) in recent dates</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="h-[300px] w-full">
                  {recoveryTrendData.length > 0 ? (
                    <ChartContainer config={recoveryTrendConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={recoveryTrendData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.4)" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: "11px" }} />
                          <YAxis tickLine={false} axisLine={false} domain={[0, 100]} style={{ fontSize: "11px" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="recovery"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            activeDot={{ r: 6 }}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No recovery trend records</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => router.push(action.href)}
                  className="group relative flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${action.bg}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </div>
                  <ArrowRight className="absolute right-4 top-5 h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
