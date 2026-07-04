"use client"

import { useQuery } from "@tanstack/react-query"
import { IndianRupee, Loader2, Wallet } from "lucide-react"

import { AddBalanceCard } from "@/components/add-balance-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getHospitalMe } from "@/lib/api"

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
}

export default function BillingPage() {
  // Wallet balance and per-day pricing straight from the backend; the query is
  // invalidated after a successful top-up so the balance refreshes in place.
  const hospitalQuery = useQuery({
    queryKey: ["hospital-me"],
    queryFn: getHospitalMe,
  })

  const hospital = hospitalQuery.data?.data

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing &amp; Wallet</h1>
        <p className="text-muted-foreground">
          Add funds to your hospital wallet to keep services running.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-2">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Wallet Overview</CardTitle>
            <CardDescription>
              Enrolling a patient costs the per-day rate for every enrolled
              day; half of that total is deducted from this wallet up front.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hospitalQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading wallet...
              </div>
            ) : hospitalQuery.isError ? (
              <p className="text-sm text-destructive">
                Could not load your wallet. Please refresh the page.
              </p>
            ) : hospital ? (
              <>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Current balance</span>
                  </div>
                  <span className="text-xl font-semibold">{rupees(hospital.balance)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <span className="text-sm text-muted-foreground">
                    Per-day patient cost
                  </span>
                  <span className="text-xl font-semibold">
                    ₹{hospital.perDayPatientCost.toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-muted-foreground"> /day</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Half of the enrollment cost is deducted up front. Example: a
                  10-day enrollment costs ₹
                  {(hospital.perDayPatientCost * 10).toLocaleString("en-IN")}, so ₹
                  {((hospital.perDayPatientCost * 10) / 2).toLocaleString("en-IN")} is
                  deducted from the wallet.
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <AddBalanceCard />
      </div>
    </div>
  )
}
