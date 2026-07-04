// Thin wrapper around Razorpay Checkout (checkout.js). The script is loaded
// lazily from Razorpay's CDN the first time a payment is started, so it never
// blocks initial page load.

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

// Payload Razorpay passes to the checkout `handler` on a successful payment.
export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise, must match the created order
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  // Lock prefilled fields so the payer can't edit them.
  readonly?: { name?: boolean; email?: boolean; contact?: boolean };
  // Hide prefilled fields entirely (values must be valid or Checkout re-prompts).
  hidden?: { email?: boolean; contact?: boolean };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

export interface RazorpayFailedResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailedResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

// Loads checkout.js once and resolves when window.Razorpay is ready. Safe to
// call repeatedly — concurrent callers share a single load.
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only be loaded in the browser"));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`
    );
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      scriptPromise = null;
      reject(new Error("Failed to load the Razorpay checkout script"));
    });

    if (!existing) {
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    } else if (window.Razorpay) {
      resolve();
    }
  });

  return scriptPromise;
}
