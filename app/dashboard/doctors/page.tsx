"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Search, Stethoscope, Loader2, User } from "lucide-react"

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
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { createDoctor, searchDoctors, getAllDoctors } from "@/lib/api"

const doctorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
})

export default function DoctorsPage() {
    const [searchValue, setSearchValue] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)

    const searchQuery = useQuery({
        queryKey: ["doctors-search", searchValue],
        queryFn: () => searchDoctors(searchValue),
        enabled: searchValue.length > 0,
    })

    const form = useForm<z.infer<typeof doctorSchema>>({
        resolver: zodResolver(doctorSchema),
        defaultValues: { name: "", username: "" },
    })

    const createMutation = useMutation({
        mutationFn: (values: z.infer<typeof doctorSchema>) =>
            createDoctor({ name: values.name, username: values.username }),
        onSuccess: (data) => {
            toast.success("Doctor Created", {
                description: `${data?.data?.name || "Doctor"} has been added.`,
            })
            form.reset()
            setDialogOpen(false)
            searchQuery.refetch()
        },
        onError: (error: Error) => {
            toast.error("Failed to Create Doctor", { description: error.message })
        },
    })

    const doctors = searchQuery.data?.data || []

    return (
        <div className="flex flex-col gap-6 p-6 md:p-10 mx-auto max-w-4xl w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
                    <p className="text-muted-foreground">Manage doctors in your hospital</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-1.5">
                            <Plus className="h-4 w-4" /> Add Doctor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Doctor</DialogTitle>
                            <DialogDescription>Enter the doctor&apos;s details. They will be linked to your hospital.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dr. Gregory House" {...field} disabled={createMutation.isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="username" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="drhouse_01" {...field} disabled={createMutation.isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <DialogFooter>
                                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                                        ) : "Add Doctor"}
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
                    placeholder="Search doctors by name..."
                    className="pl-9"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            {/* Results */}
            {searchValue.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
                    <Stethoscope className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Type a name to search for doctors</p>
                </div>
            ) : searchQuery.isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : doctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
                    <User className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No doctors found</p>
                </div>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {doctors.map((doc: any) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                                                <Stethoscope className="h-4 w-4 text-violet-600" />
                                            </div>
                                            {doc.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{doc.username}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">#{doc.id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
