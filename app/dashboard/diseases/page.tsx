"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Search, Microscope, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import { searchDisease, createDisease } from "@/lib/api"

const diseaseSchema = z.object({
    name: z.string().min(1, "Disease name is required"),
    type: z.enum(["CHRONIC", "ACUTE"], { required_error: "Select a type" }),
    description: z.string().optional(),
})

export default function DiseasesPage() {
    const [searchValue, setSearchValue] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)

    const searchQuery = useQuery({
        queryKey: ["disease-search", searchValue],
        queryFn: () => searchDisease(searchValue),
        enabled: searchValue.length > 0,
    })

    const form = useForm<z.infer<typeof diseaseSchema>>({
        resolver: zodResolver(diseaseSchema),
        defaultValues: { name: "", description: "" },
    })

    const createMutation = useMutation({
        mutationFn: (values: z.infer<typeof diseaseSchema>) =>
            createDisease({ name: values.name, type: values.type, description: values.description }),
        onSuccess: (data) => {
            toast.success("Disease Created", {
                description: `${data?.data?.name || "Disease"} has been added.`,
            })
            form.reset()
            setDialogOpen(false)
            searchQuery.refetch()
        },
        onError: (error: Error) => {
            toast.error("Failed to Create Disease", { description: error.message })
        },
    })

    const diseases = searchQuery.data?.data || []

    return (
        <div className="flex flex-col gap-6 p-6 md:p-10 mx-auto max-w-4xl w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Diseases</h1>
                    <p className="text-muted-foreground">Manage the disease registry</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-1.5">
                            <Plus className="h-4 w-4" /> Add Disease
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Disease</DialogTitle>
                            <DialogDescription>Add a new disease to the system registry.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Disease Name</FormLabel>
                                        <FormControl><Input placeholder="Hypertension" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="CHRONIC">Chronic</SelectItem>
                                                <SelectItem value="ACUTE">Acute</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (optional)</FormLabel>
                                        <FormControl><Textarea placeholder="Brief description..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <DialogFooter>
                                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                                        ) : "Add Disease"}
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
                    placeholder="Search diseases by name..."
                    className="pl-9"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            {/* Results */}
            {searchValue.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
                    <Microscope className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Type a name to search for diseases</p>
                </div>
            ) : searchQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : diseases.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No diseases found</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {diseases.map((disease: any) => (
                        <div
                            key={disease.id}
                            className="flex items-start justify-between rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 shrink-0">
                                    <Microscope className="h-5 w-5 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{disease.name}</h3>
                                    {disease.description && (
                                        <p className="text-sm text-muted-foreground mt-0.5">{disease.description}</p>
                                    )}
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={
                                    disease.type === "CHRONIC"
                                        ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                                        : "border-blue-500/30 bg-blue-500/10 text-blue-700"
                                }
                            >
                                {disease.type}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
