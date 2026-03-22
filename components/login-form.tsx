import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import Image from "next/image"
import loginImage from "@/public/premium_vector-1711979205032-1187a1ac0e88.avif"
import Link from "next/link"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col h-screen w-full", className)} {...props}>
      <Card className="overflow-hidden p-0 h-full w-full rounded-none border-none shadow-none">
        <CardContent className="grid p-0 md:grid-cols-2 h-full w-full">
          <div className="flex items-center justify-center h-full w-full bg-background">
            <form className="p-6 md:p-8 w-full max-w-md mx-auto">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your Alivepost account
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input id="password" type="password" required />
                </Field>
                <Field className="mt-2">
                  <Button type="submit" variant="default" className="w-full">Login</Button>
                </Field>
              </FieldGroup>
            </form>
          </div>
          <div className="relative hidden bg-muted md:block h-full w-full">
            <Image src={loginImage} alt="Login Image" className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
