"use client"

import { useRouter } from "next/navigation"
import {
  UserRoundPlus, Search, Stethoscope, Pill, Activity, Microscope,
  ArrowRight, Users, HeartPulse, Building2
} from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp } from "@tabler/icons-react"

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

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Total Patients
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  —
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Registered patients in system</div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4" /> Active Conditions
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  —
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Ongoing patient conditions</div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4" /> Doctors
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  —
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Hospital doctors on staff</div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <Pill className="h-4 w-4" /> Medications
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  —
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Medicines in formulary</div>
              </CardFooter>
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
