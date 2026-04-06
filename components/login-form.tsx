"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import loginImage from "@/public/premium_vector-1711979205032-1187a1ac0e88.avif"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { hospitalLogin } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Building2, Lock } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"

  const loginMutation = useMutation({
    mutationFn: () => hospitalLogin(userId, password),
    onSuccess: (data) => {
      // Set cookie on frontend domain so middleware can detect auth
      const token = data?.data?.token || data?.token || "authenticated"
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

      // Store hospital info for sidebar
      const hospitalInfo = {
        name: data?.data?.name || "Hospital",
        userId: data?.data?.userId || userId,
      }
      localStorage.setItem("hospitalInfo", JSON.stringify(hospitalInfo))

      toast.success("Login Successful", {
        description: `Welcome back, ${hospitalInfo.name}!`,
      })
      router.push(redirectTo)
    },
    onError: (error: Error) => {
      toast.error("Login Failed", {
        description: error.message || "Invalid credentials. Please try again.",
      })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId.trim() || !password.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    loginMutation.mutate()
  }

  return (
    <div className={cn("flex flex-col h-screen w-full", className)} {...props}>
      <Card className="overflow-hidden p-0 h-full w-full rounded-none border-none shadow-none">
        <CardContent className="grid p-0 md:grid-cols-2 h-full w-full">
          <div className="flex items-center justify-center h-full w-full bg-background">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 w-full max-w-md mx-auto space-y-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-2">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Alivepost hospital dashboard
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="userId"
                      type="text"
                      placeholder="citygen_01"
                      className="pl-9"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loginMutation.isPending}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div className="relative hidden bg-muted md:block h-full w-full">
            <Image
              src={loginImage}
              alt="Login Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
