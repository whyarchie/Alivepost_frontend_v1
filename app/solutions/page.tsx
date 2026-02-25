"use client"

import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { useRef, useEffect, useState } from "react"

// ─── Solution modules data ───────────────────────────────────────────
const solutionModules = [
    {
        title: "Digital Discharge Planning",
        description:
            "Comprehensive digital care plans, risk assessments, and personalized instructions delivered instantly to patients.",
    },
    {
        title: "Patient Companion App",
        description:
            "A unified interface for medication reminders, educational content, tele-consults, and real-time family updates.",
    },
    {
        title: "AI Follow-Up Engine",
        description:
            "Automated daily check-ins with NLP-driven risk scoring to identify deteriorating patients before readmission.",
    },
    {
        title: "Smart Pharmacy",
        description:
            "Predictive medication refills and cold-chain doorstep delivery ensuring 100% adherence to prescriptions.",
    },
    {
        title: "Predictive Alert System",
        description:
            "Real-time alerts for non-recovery signs triggering proactive outreach from hospital care teams.",
    },
    {
        title: "Home Hospital Services",
        description:
            "Extension of hospital services including nursing, remote patient monitoring (RPM), and devices at home.",
    },
]

// ─── Features per module ─────────────────────────────────────────────
const moduleFeatures: Record<string, string[]> = {
    "Digital Discharge Planning": [
        "Automated care plan generation",
        "Risk stratification scoring",
        "Personalized recovery timelines",
        "Multi-language support",
    ],
    "Patient Companion App": [
        "Medication tracking & reminders",
        "Educational video library",
        "In-app tele-consultations",
        "Family member access portal",
    ],
    "AI Follow-Up Engine": [
        "Natural language processing",
        "Predictive risk algorithms",
        "Symptom severity tracking",
        "Automated escalation protocols",
    ],
    "Smart Pharmacy": [
        "Smart refill predictions",
        "Cold-chain logistics",
        "Same-day delivery",
        "Medication reconciliation",
    ],
    "Predictive Alert System": [
        "Real-time vital monitoring",
        "Customizable alert thresholds",
        "Care team notifications",
        "Action tracking dashboard",
    ],
    "Home Hospital Services": [
        "In-home nursing visits",
        "RPM device integration",
        "Diagnostic sample collection",
        "IV therapy & wound care",
    ],
}

// ─── Module icons ────────────────────────────────────────────────────
const moduleIcons: Record<string, React.ReactNode> = {
    "Digital Discharge Planning": (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
    ),
    "Patient Companion App": (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
    ),
    "AI Follow-Up Engine": (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
    ),
    "Smart Pharmacy": (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    "Predictive Alert System": (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    "Home Hospital Services": (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    ),
}

// ─── Integration flow steps ──────────────────────────────────────────
const integrationSteps = [
    {
        step: "01",
        title: "Patient Discharge",
        description: "System automatically captures discharge data",
    },
    {
        step: "02",
        title: "Digital Care Plan",
        description: "AI generates personalized recovery protocols",
    },
    {
        step: "03",
        title: "Active Monitoring",
        description: "Daily check-ins and real-time vital tracking",
    },
    {
        step: "04",
        title: "Proactive Care",
        description: "Alerts trigger immediate intervention",
    },
]

// ─── Animated counter hook ───────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (!isInView) return
        let start = 0
        const duration = 2000
        const increment = target / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [isInView, target])

    return (
        <span ref={ref} className="tabular-nums">
            {count}
            {suffix}
        </span>
    )
}

// ─── Animation variants ──────────────────────────────────────────────
const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.8,
            ease: [0.25, 0.4, 0.25, 1] as const,
        },
    }),
}


const metrics = [
    {
        title: "Readmission Reduction",
        description:
            "Significant decrease in 30-day hospital readmissions through proactive monitoring and early intervention protocols.",
        gradient: "from-green-100 to-green-50",
        textColor: "text-green-600",
        target: 30,
        suffix: "%",
    },
    {
        title: "Patient Satisfaction",
        description:
            "Net Promoter Score achieved through personalized care plans, 24/7 support access, and seamless family engagement.",
        gradient: "from-emerald-100 to-emerald-50",
        textColor: "text-emerald-600",
        target: 95,
        suffix: "%",
    },
    {
        title: "Patient Lifetime Value",
        description:
            "Average increase in patient lifetime value through extended care services, pharmacy integration, and RPM programs.",
        gradient: "from-teal-100 to-teal-50",
        textColor: "text-teal-600",
        target: 3,
        suffix: "x",
    },
];

// ═════════════════════════════════════════════════════════════════════
// Solutions Page
// ═════════════════════════════════════════════════════════════════════
export default function Solutions() {
    return (
        <main className="relative min-h-screen bg-background">
            {/* ── 1. Hero Section ─────────────────────────────────── */}
            <section className="relative w-full border-b border-slate-200 overflow-hidden">
                <HeroHighlight containerClassName="py-20 lg:py-32">
                    <div className="relative z-10 max-w-4xl mx-auto px-6 w-full text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6 flex flex-col items-center"
                        >
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                Alivepost
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                The Digital Hospital <br className="hidden md:block" />
                                <Highlight className="text-black inline-block mt-2">Care Ecosystem</Highlight>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-700 font-medium tracking-tight max-w-2xl mx-auto leading-relaxed mt-4">
                                Six integrated modules delivering seamless post-discharge continuity and revenue growth
                            </p>

                            <div className="pt-6 flex flex-wrap gap-4 items-center justify-center">
                                <Link href="/contact">
                                    <HoverBorderGradient
                                        containerClassName="rounded-full"
                                        as="button"
                                        className="bg-green-600 text-white flex items-center gap-2 font-bold px-8 py-4 text-sm shadow-xl shadow-green-900/20"
                                    >
                                        <span className="w-full">Schedule Demo</span>
                                        <svg
                                            className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </HoverBorderGradient>
                                </Link>

                            </div>
                        </motion.div>
                    </div>
                </HeroHighlight>
            </section>

            {/* ── 2. Solution Modules ─────────────────────────────── */}
            <section className="py-24 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-4"
                    >
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
                            Platform Modules
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Everything Your Hospital Needs
                        </h2>
                        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                            Six purpose-built modules that work together to create a complete post-discharge care ecosystem.
                        </p>
                    </motion.div>

                    {/* <HoverEffect items={solutionModules} /> */}

                    {/* ── Expanded Feature Grid ── */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {solutionModules.map((module, idx) => (
                            <motion.div
                                key={module.title}
                                variants={fadeUpVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={idx}
                                className="group relative bg-gradient-to-br from-white to-green-50/30 rounded-2xl p-6 border border-slate-200 hover:border-green-200 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300 h-full flex flex-col"
                            >
                                {/* Icon */}
                                <div className="mb-4 inline-flex p-3 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
                                    {moduleIcons[module.title]}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-3">
                                    {module.title}
                                </h3>

                                <ul className="space-y-2.5">
                                    {moduleFeatures[module.title]?.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0 relative">
                                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                                            </div>
                                            <span className="font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. Integration Flow ─────────────────────────────── */}
            <section className="py-24 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
                            How It Works
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Seamless Integration with Your Hospital
                        </h2>
                        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                            Our platform integrates directly with your existing hospital management systems
                        </p>
                    </motion.div>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Connecting line */}
                        <div className="hidden lg:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                            {integrationSteps.map((step, idx) => (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                                    className="relative flex flex-col items-center text-center group "
                                >
                                    {/* Step number */}
                                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-[3px] border-green-200 flex items-center justify-center mb-6 group-hover:border-green-500 group-hover:shadow-xl group-hover:shadow-green-200/50 transition-all duration-300">
                                        <span className="text-xl font-black text-green-600">{step.step}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 text-base font-medium leading-relaxed max-w-[220px] ">
                                        {step.description}
                                    </p>

                                    {/* Arrow for non-last items (mobile/tablet) */}
                                    {idx < integrationSteps.length - 1 && (
                                        <div className="lg:hidden mt-6 text-green-300">
                                            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. Impact Metrics ───────────────────────────────── */}
            <section className="py-24 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
                            Proven Results
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Measurable Impact on Patient Outcomes
                        </h2>
                    </motion.div>
                    <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[14rem]">
                        {metrics.map((item, index) => (
                            <BentoGridItem
                                key={index}
                                title={item.title}
                                description={item.description}
                                className="md:col-span-1 h-fit"
                                header={
                                    <div
                                        className={`flex flex-1 w-full h-full min-h-24 rounded-xl bg-linear-to-br ${item.gradient} items-center justify-center`}
                                    >
                                        <span className={`text-5xl font-black ${item.textColor}`}>
                                            <AnimatedCounter target={item.target} suffix={item.suffix} />
                                        </span>
                                    </div>
                                }
                            />
                        ))}
                    </BentoGrid>
                </div>
            </section>
        </main>
    )
}
