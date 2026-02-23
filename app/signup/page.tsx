// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// export default function SignupPage() {
//   const [password, setPassword] = useState("")
//   const [confirm, setConfirm] = useState("")

//   const passwordsMatch = confirm === "" || password === confirm
//   const showError = confirm !== "" && password !== confirm

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background">
//       <Card className="w-full max-w-sm">
//         <CardHeader>
//           <CardTitle>Create an account</CardTitle>
//           <CardDescription>
//             Enter your details below to create your account
//           </CardDescription>
//           <CardAction>
//             <Button variant="link">Login</Button>
//           </CardAction>
//         </CardHeader>

//         <CardContent>
//           <form>
//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="name">Full Name</Label>
//                 <Input id="name" type="text" placeholder="John Doe" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input id="email" type="email" placeholder="m@example.com" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="confirm">Confirm Password</Label>
//                 <Input
//                   id="confirm"
//                   type="password"
//                   required
//                   value={confirm}
//                   onChange={(e) => setConfirm(e.target.value)}
//                   className={showError ? "border-red-500 focus-visible:ring-red-500" : ""}
//                 />
//                 {showError && (
//                   <p className="text-sm text-red-500">Passwords do not match</p>
//                 )}
//                 {confirm !== "" && passwordsMatch && (
//                   <p className="text-sm text-green-500">Passwords match ✓</p>
//                 )}
//               </div>
//             </div>
//           </form>
//         </CardContent>

//         <CardFooter className="flex-col gap-2">
//           <Button
//             type="submit"
//             className="w-full"
//             disabled={showError || password === "" || confirm === ""}
//           >
//             Create Account
//           </Button>
//           <Button variant="outline" className="w-full">
//             Sign up with Google
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }

import { SignupForm } from "@/components/signup-form"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
