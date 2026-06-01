"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  Phone, ArrowLeft, User, Heart, Droplets, Calendar as CalendarIcon,
  Activity, Pill, Loader2, AlertCircle, AlertTriangle, ExternalLink, ShieldAlert
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { getHighRiskPatients } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function HighRiskPatientsPage() {
  const [page, setPage] = useState(1)
  const limit = 10

  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination.totalPages || 1
    
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

  const { data: highRiskData, isLoading, isError, error } = useQuery({
    queryKey: ["high-risk-patients", page],
    queryFn: () => getHighRiskPatients(page, limit),
  })

  const patients = highRiskData?.data?.patients || []
  const pagination = highRiskData?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-500 flex items-center gap-2">
              High Risk Patients
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-10">
            Patients identified with critical medical indicators or high risk factor conditions.
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
            <p className="text-sm text-muted-foreground animate-pulse">Fetching high-risk cases...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-lg font-medium">Failed to load high-risk patients</p>
            <p className="text-sm text-muted-foreground">{(error as Error)?.message || "An error occurred."}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
              <Heart className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg">No high risk patients found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Great! There are currently no patients flagged as high risk in the system.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Gender & Age</TableHead>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Condition(s)</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((pat: any, index: number) => {
                  const age = pat.dateOfBirth
                    ? Math.floor((new Date().getTime() - new Date(pat.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : "—"

                  return (
                    <TableRow key={pat.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-500 font-semibold text-xs border border-amber-500/20">
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
                      <TableCell className="font-mono text-sm">
                        {pat.mobileNumber || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 items-start">
                          {pat.conditions && pat.conditions.length > 0 ? (
                            pat.conditions.map((cond: any, cIdx: number) => (
                              <div key={cond.id || cIdx} className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
                                  {cond.disease?.name || `Disease #${cond.diseaseId}`}
                                </Badge>
                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                                  <AlertCircle className="h-2.5 w-2.5" /> {cond.status || "High Risk"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No active conditions</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-8 text-xs font-semibold hover:bg-primary hover:text-primary-foreground gap-1"
                        >
                          <Link href={`/dashboard/patients?mobile=${pat.mobileNumber}`}>
                            View Profile <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 py-4 bg-muted/20">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  Showing page <span className="font-semibold">{page}</span> of <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} cases)
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
                            if (page < pagination.totalPages) setPage(page + 1)
                          }}
                          className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
