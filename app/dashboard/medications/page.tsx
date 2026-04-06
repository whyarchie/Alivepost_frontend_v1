"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Search, Pill, Loader2, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { searchMedicine, createMedicine } from "@/lib/api"

const DOSAGE_FORMS = [
    "TABLET", "CAPSULE", "SYRUP", "INJECTION", "OINTMENT",
    "DROPS", "CREAM", "GEL", "INHALER", "POWDER",
]

const medicineSchema = z.object({
    brandName: z.string().min(1, "Brand name is required"),
    genericName: z.string().min(1, "Generic name is required"),
    dosageForm: z.string().min(1, "Select a dosage form"),
    dosageStrength: z.string().optional(),
    manufacturer: z.string().min(1, "Manufacturer is required"),
})

export default function MedicationsPage() {
    const [searchValue, setSearchValue] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)

    const searchQuery = useQuery({
        queryKey: ["medicine-search", searchValue],
        queryFn: () => searchMedicine(searchValue),
        enabled: searchValue.length > 0,
    })

    const form = useForm<z.infer<typeof medicineSchema>>({
        resolver: zodResolver(medicineSchema),
        defaultValues: { brandName: "", genericName: "", dosageStrength: "", manufacturer: "" },
    })

    const createMutation = useMutation({
        mutationFn: (values: z.infer<typeof medicineSchema>) => createMedicine(values),
        onSuccess: (data) => {
            toast.success("Medicine Created", {
                description: `${data?.data?.brandName || "Medicine"} has been added.`,
            })
            form.reset()
            setDialogOpen(false)
            searchQuery.refetch()
        },
        onError: (error: Error) => {
            toast.error("Failed to Create Medicine", { description: error.message })
        },
    })

    const medicines = searchQuery.data?.data || []

    return (
        <div className="flex flex-col gap-6 p-6 md:p-10 mx-auto max-w-5xl w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
                    <p className="text-muted-foreground">Search and manage medicines in the formulary</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-1.5">
                            <Plus className="h-4 w-4" /> Add Medicine
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Medicine</DialogTitle>
                            <DialogDescription>Enter the medicine details to add it to the formulary.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="brandName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand Name</FormLabel>
                                            <FormControl><Input placeholder="Paracetamol" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="genericName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Generic Name</FormLabel>
                                            <FormControl><Input placeholder="Acetaminophen" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="dosageForm" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dosage Form</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select form" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {DOSAGE_FORMS.map(f => (
                                                        <SelectItem key={f} value={f}>{f}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="dosageStrength" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dosage Strength</FormLabel>
                                            <FormControl><Input placeholder="500mg" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="manufacturer" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manufacturer</FormLabel>
                                        <FormControl><Input placeholder="PharmaCorp" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <DialogFooter>
                                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                                        ) : "Add Medicine"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search medicines by name..."
                    className="pl-9"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            {/* Results */}
            {searchValue.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
                    <Pill className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Type a name to search for medicines</p>
                </div>
            ) : searchQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : medicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
                    <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No medicines found</p>
                </div>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Brand Name</TableHead>
                                <TableHead>Generic Name</TableHead>
                                <TableHead>Form</TableHead>
                                <TableHead>Strength</TableHead>
                                <TableHead>Manufacturer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicines.map((med: any) => (
                                <TableRow key={med.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                                                <Pill className="h-4 w-4 text-amber-600" />
                                            </div>
                                            {med.brandName}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{med.genericName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{med.dosageForm}</Badge>
                                    </TableCell>
                                    <TableCell>{med.dosageStrength || "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{med.manufacturer}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
