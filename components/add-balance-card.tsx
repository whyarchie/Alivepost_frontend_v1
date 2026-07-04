"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Wallet, CreditCard, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createHospitalOrder,
  verifyHospitalPayment,
  type VerifyHospitalPaymentResponse,
} from "@/lib/api"
import { loadRazorpayScript } from "@/lib/razorpay"

const PRESET_AMOUNTS = [500, 1000, 2500, 5000]

// Signals the user closed the Razorpay modal without paying — handled quietly
// (no error toast) since it isn't a failure.
const CANCELLED = "PAYMENT_CANCELLED"

export function AddBalanceCard() {
  const [amount, setAmount] = useState("")
  const queryClient = useQueryClient()

  const payMutation = useMutation<VerifyHospitalPaymentResponse["data"], Error, number>({
    mutationFn: async (rupees) => {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!keyId) {
        throw new Error("Razorpay is not configured (missing NEXT_PUBLIC_RAZORPAY_KEY_ID)")
      }

      // Load the checkout script and create the order in parallel.
      const [, orderRes] = await Promise.all([
        loadRazorpayScript(),
        createHospitalOrder(rupees),
      ])

      // The backend returns the order plus prefill details pulled straight from
      // the hospital record in the DB.
      const { order, prefill } = orderRes.data
      const Razorpay = window.Razorpay
      if (!Razorpay) {
        throw new Error("Razorpay checkout is unavailable")
      }

      // Only hide the contact/email fields when we actually have valid values
      // from the DB; otherwise leave them visible so Checkout can collect them.
      const hasContact = !!prefill.contact
      const hasEmail = !!prefill.email

      // Open checkout and resolve once the payment is verified server-side.
      return new Promise<VerifyHospitalPaymentResponse["data"]>((resolve, reject) => {
        const rzp = new Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Alivepost",
          description: "Hospital wallet top-up",
          order_id: order.id,
          prefill: {
            name: prefill.name || "Hospital",
            email: prefill.email || undefined,
            contact: prefill.contact || undefined,
          },
          // Contact/email come from the DB, so lock and hide them — the payer
          // never sees the "enter contact details" form.
          readonly: { name: true, email: hasEmail, contact: hasContact },
          hidden: { email: hasEmail, contact: hasContact },
          notes: { receipt: order.receipt },
          theme: { color: "#AFFF00" },
          modal: {
            ondismiss: () => reject(new Error(CANCELLED)),
          },
          handler: async (response) => {
            try {
              const verifyRes = await verifyHospitalPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              resolve(verifyRes.data)
            } catch (err) {
              reject(err instanceof Error ? err : new Error("Payment verification failed"))
            }
          },
        })

        rzp.on("payment.failed", (resp) => {
          reject(new Error(resp?.error?.description || "The payment could not be completed"))
        })

        rzp.open()
      })
    },
    onSuccess: (data) => {
      setAmount("")
      // Refresh the wallet overview on the billing page.
      queryClient.invalidateQueries({ queryKey: ["hospital-me"] })
      if (data.alreadyProcessed) {
        toast.info("Payment already processed", {
          description: "This payment was previously credited to your wallet.",
        })
        return
      }
      const balanceLine =
        typeof data.balance === "number"
          ? `New balance: ₹${(data.balance / 100).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}`
          : "Your wallet has been credited."
      toast.success("Balance added successfully", { description: balanceLine })
    },
    onError: (error) => {
      if (error.message === CANCELLED) {
        toast("Payment cancelled")
        return
      }
      toast.error("Payment failed", {
        description: error.message || "Something went wrong. Please try again.",
      })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const rupees = Number(amount)
    if (!Number.isFinite(rupees) || rupees <= 0) {
      toast.error("Enter a valid amount greater than ₹0")
      return
    }
    payMutation.mutate(rupees)
  }

  const isPending = payMutation.isPending

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-2">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <CardTitle>Add Balance</CardTitle>
        <CardDescription>
          Top up your hospital wallet securely via Razorpay.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="1000"
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setAmount(String(preset))}
              >
                ₹{preset.toLocaleString("en-IN")}
              </Button>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 items-stretch">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with Razorpay
              </>
            )}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Payments are processed securely by Razorpay.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
