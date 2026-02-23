

import { SignupForm } from "@/components/signup-form"

export default function Page() {
  return (
    <div className="flex my-10 min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
