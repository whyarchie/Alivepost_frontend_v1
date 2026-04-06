import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={<div className="min-h-screen w-full" />}>
        <LoginForm className="h-screen w-full" />
      </Suspense>
    </div>
  )
}