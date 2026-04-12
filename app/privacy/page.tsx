"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, Database, Share2, Bell, Smartphone, Clock, Mail } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function PrivacyPolicyPage() {
    const lastUpdated = "April 2026"

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 scroll-smooth">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/login" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <ArrowLeft className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Back to Login</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-bold tracking-tight">Alive Post</span>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl px-4 py-12 md:px-6 md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4 text-center mb-16"
                >
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your health data is private, and we keep it that way. Learn how we handle your information at Alive Post.
                    </p>
                    <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        Last updated: {lastUpdated}
                    </div>
                </motion.div>

                <div className="grid gap-12 md:gap-16">
                    {/* Section 1 */}
                    <section id="who-we-are" className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">1. WHO WE ARE</h2>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>
                                Alive Post ("we", "our", "us") operates the Alive Post mobile application. This policy explains what data we collect, why we collect it, and how we protect it.
                            </p>
                            <div className="mt-6 rounded-2xl border bg-muted/30 p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <div className="font-medium text-foreground">Contact</div>
                                        <div className="text-sm">Abhishek@alivepost.com</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <div className="font-medium text-foreground">Address</div>
                                        <div className="text-sm">H-53 Sector 63 Noida, 201301</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section id="data-we-collect" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Eye className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">2. DATA WE COLLECT</h2>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-2xl border p-6 space-y-3 bg-card transition-colors hover:bg-accent/5">
                                <h3 className="font-bold flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Directly Provided
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex gap-2"><span>•</span> Mobile phone number (login only)</li>
                                    <li className="flex gap-2"><span>•</span> Date of birth (verification only)</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border p-6 space-y-3 bg-card transition-colors hover:bg-accent/5">
                                <h3 className="font-bold flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Provider Health Data
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex gap-2"><span>•</span> Prescription details (name, dosage)</li>
                                    <li className="flex gap-2"><span>•</span> Treatment end dates</li>
                                    <li className="flex gap-2"><span>•</span> Health questions & responses</li>
                                    <li className="flex gap-2"><span>•</span> Recovery information</li>
                                </ul>
                            </div>
                        </div>

                        <div className="rounded-2xl border p-6 space-y-3 bg-card transition-colors hover:bg-accent/5">
                            <h3 className="font-bold flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Automatically Collected (Device)
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2"><span>•</span> FCM device token (medicine reminders only)</li>
                                <li className="flex gap-2"><span>•</span> App usage data for crash reporting</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section id="why-we-collect" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Database className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">3. WHY WE COLLECT THIS DATA</h2>
                        </div>

                        <div className="overflow-hidden rounded-2xl border bg-card">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold">Purpose</th>
                                        <th className="px-6 py-4 text-left font-bold border-l">Data used</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { p: "Verify your identity", d: "Mobile number, Date of birth" },
                                        { p: "Show your prescriptions", d: "Health data from your doctor" },
                                        { p: "Send medicine reminders", d: "FCM device token" },
                                        { p: "Send health check-in questions", d: "FCM device token, Health data" },
                                        { p: "Deliver alarms on time", d: "SCHEDULE_EXACT_ALARM permission" },
                                        { p: "Show alarms over lock screen", d: "USE_FULL_SCREEN_INTENT permission" },
                                        { p: "Resume alarms after reboot", d: "RECEIVE_BOOT_COMPLETED permission" },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-muted-foreground font-medium">{row.p}</td>
                                            <td className="px-6 py-4 text-muted-foreground border-l">{row.d}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section id="how-we-store" className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Lock className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">4. HOW WE STORE YOUR DATA</h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                                <p className="text-sm text-foreground leading-relaxed">
                                    Prescription data is cached locally on your device (SharedPreferences) so the app works without internet.
                                </p>
                            </div>
                            <div className="rounded-2xl border p-6 bg-card">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Mobile number and DOB are stored locally only to avoid requiring login on every app open.
                                </p>
                            </div>
                            <div className="rounded-2xl border p-6 bg-card">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    FCM token is sent to our server solely for push notifications. Not used for advertising.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                                <p className="text-sm text-foreground leading-relaxed">
                                    Health check-in answers are submitted to your care provider's server over encrypted HTTPS.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive font-medium text-center text-sm">
                            We do NOT store your data on third-party advertising platforms.
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section id="data-sharing" className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Share2 className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">5. DATA SHARING</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-2xl border p-6 bg-card">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    We share your data with:
                                </h3>
                                <ul className="space-y-4 text-sm text-muted-foreground">
                                    <li>
                                        <span className="text-foreground font-medium underline decoration-primary underline-offset-4">Your healthcare provider / hospital:</span> Your prescription data originates from and is owned by your care provider.
                                    </li>
                                    <li>
                                        <span className="text-foreground font-medium underline decoration-primary underline-offset-4">Firebase (Google LLC):</span> Used for push notifications only. FCM tokens processed per Google's policy.
                                    </li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                                <h3 className="font-bold mb-3 text-destructive flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                    We do NOT share your data with:
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm font-bold text-destructive/80">
                                    <span className="inline-flex items-center gap-1">× Advertisers</span>
                                    <span className="inline-flex items-center gap-1">× Data brokers</span>
                                    <span className="inline-flex items-center gap-1">× Any other third parties</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section id="permissions" className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">6. PERMISSIONS EXPLAINED</h2>
                        </div>

                        <div className="grid gap-3">
                            {[
                                { name: "INTERNET", desc: "Fetch prescriptions from your care provider's server" },
                                { name: "POST_NOTIFICATIONS", desc: "Show medicine reminder alerts" },
                                { name: "SCHEDULE_EXACT_ALARM", desc: "Ensure reminders fire at the exact prescribed time" },
                                { name: "FOREGROUND_SERVICE", desc: "Play alarm sound when your phone is idle or locked" },
                                { name: "USE_FULL_SCREEN_INTENT", desc: "Show alarm screen over lock screen for critical reminders" },
                                { name: "WAKE_LOCK", desc: "Keep the alarm running until you acknowledge it" },
                                { name: "RECEIVE_BOOT_COMPLETED", desc: "Re-schedule reminders automatically after reboot" },
                            ].map((p, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card gap-2 transition-all hover:translate-x-1">
                                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-primary border">{p.name}</code>
                                    <span className="text-sm text-muted-foreground">{p.desc}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 7 - 12 */}
                    <div className="grid gap-12 sm:grid-cols-2 mt-8">
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold">7. CHILDREN'S PRIVACY</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                App intended for ages 18+. We don't knowingly collect data from children under 13. Contact us immediately if you suspect a breach.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold">8. DATA RETENTION</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Local data deleted on uninstall. Server health data retained per hospital policy. FCM tokens replaced automatically.
                            </p>
                        </section>
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold">9. YOUR RIGHTS</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Access your data</li>
                                <li>• Request account deletion</li>
                                <li>• Opt out of push notifications</li>
                                <li>• Clear local data via app settings</li>
                            </ul>
                        </section>
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold">10. SECURITY</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                All communications use HTTPS (TLS). No passwords transmitted. Health data never sent to ad networks.
                            </p>
                        </section>
                    </div>

                    <section className="rounded-3xl bg-primary/10 p-8 md:p-12 text-center space-y-6 mt-12">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                            <Clock className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">11. CHANGES & 12. CONTACT</h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            We may update this policy. Continued use constitutes acceptance. For inquiries or to exercise your rights, contact us at:
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            <Button asChild size="lg" className="rounded-full px-8">
                                <a href="mailto:support@alivepost.com">
                                    <Mail className="mr-2 h-4 w-4" />
                                    support@alivepost.com
                                </a>
                            </Button>
                            <div className="text-sm text-muted-foreground font-medium">
                                Hospital District, Suite 500, CityGen
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-20 pt-12 border-t text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-bold tracking-tight">Alive Post</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © 2026 Alivepost AI Healthcare. All rights reserved.
                    </p>
                </footer>
            </main>
        </div>
    )
}
