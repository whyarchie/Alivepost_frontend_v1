"use client"

import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import about1 from "@/public/about1.jpg"
import about2 from "@/public/about2.jpg"
import about3 from "@/public/about3.avif"
import about4 from "@/public/about4.jpg"
const values = [
    {
        title: "Patient-First",
        description: "Every decision we make is rooted in improving patient outcomes and standardizing care.",
    },
    {
        title: "Innovation-Driven",
        description: "We leverage cutting-edge AI and data analytics to anticipate needs before they become emergencies.",
    },
    {
        title: "Clinical Accuracy",
        description: "Built alongside medical professionals to ensure our protocols meet the highest standards of care.",
    },
    {
        title: "Continuous Empathy",
        description: "Technology is our tool, but empathy is our guide. We care deeply about the recovery journey.",
    },
    {
        title: "Security & Trust",
        description: "We adhere strictly to data privacy and security, keeping patient data safe and compliant.",
    },
    {
        title: "Accessibility",
        description: "Making high-quality post-discharge care available to everyone, everywhere.",
    },
]

const team = [
    {
        name: "Abhishek Kumar",
        role: "Founder & CEO",
        image: "/team/abhishek.jpg",
    },
    {
        name: "Anubhav Maurya",
        role: "Co-founder",
        image: "/team/anubhav.jpg",
    },
    {
        name: "Shivam Singh",
        role: "CTO",
        image: "shivam.jpg",
    },
    {
        name: "Kushal Jaiswal",
        role: "Sales Lead",
        image: "kushal.jpg",
    },
]

const impactItems = [
    {
        title: "10,000+ Patients Monitored",
        description: "Continuously tracked after discharge, reducing readmission rates by 30%.",
        header: (
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative">
                <Image src={about1} alt="10,000+ Patients Monitored" fill className="object-cover" />
            </div>
        ),
        className: "md:col-span-2",
    },
    {
        title: "24/7 AI Assistance",
        description: "Our AI systems process health queries round the clock.",
        header: (
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative">
                <Image src={about2} alt="24/7 AI Assistance" fill className="object-cover" />
            </div>
        ),
        className: "md:col-span-1",
    },
    {
        title: "Zero Setup Cost",
        description: "Hospitals embed our solution directly into their workflow.",
        header: (
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative">
                <Image src={about3} alt="Zero Setup Cost" fill className="object-cover" />
            </div>
        ),
        className: "md:col-span-1",
    },
    {
        title: "Real-time Alerts",
        description: "Detecting anomalies instantly and routing alerts to the right medical staff.",
        header: (
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative">
                <Image src={about4} alt="Real-time Alerts" fill className="object-cover" />
            </div>
        ),
        className: "md:col-span-2",
    },
]

export default function About() {
    return (
        <main className="relative min-h-screen bg-background">

            {/* Hero Section */}
            <section className="relative w-full border-b border-slate-200 overflow-hidden">
                <HeroHighlight containerClassName="py-20 lg:py-32">
                    <div className="relative z-10 max-w-4xl mx-auto px-6 w-full text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6 flex flex-col items-center"
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                Revolutionizing <br className="hidden md:block" />
                                <Highlight className="text-black inline-block mt-2">Post-Discharge Care</Highlight>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 tracking-tight max-w-2xl mx-auto leading-relaxed mt-6">
                                At Alivepost, our mission is to ensure that no patient feels abandoned after leaving the hospital. We bridge the gap between hospital and home, delivering continuous, AI-driven care that saves lives and reduces medical burdens.
                            </p>

                            <div className="pt-8 w-full flex justify-center">
                                <Link href="/contact">
                                    <HoverBorderGradient
                                        containerClassName="rounded-full"
                                        as="button"
                                        className="bg-green-600 text-white flex items-center gap-2 font-bold px-8 py-4 text-lg shadow-xl shadow-green-900/20"
                                    >
                                        <span>Join the Revolution</span>
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

            {/* Our Impact Section (Bento Grid) */}
            <section className="py-24 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
                            Our Impact
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Making a Concrete Difference</h2>
                        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                            The numbers speak for themselves. We are transforming the healthcare landscape.
                        </p>
                    </div>
                    <BentoGrid className="max-w-5xl mx-auto">
                        {impactItems.map((item, i) => (
                            <BentoGridItem
                                key={i}
                                title={item.title}
                                description={item.description}
                                header={item.header}
                                className={item.className}
                            />
                        ))}
                    </BentoGrid>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Our Core Values</h2>
                        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                            The principles that drive us to build a better healthcare ecosystem every single day.
                        </p>
                    </div>
                    <HoverEffect items={values} />
                </div>
            </section>

            {/* Team Section */}
            <section className="py-32 bg-slate-900 relative overflow-hidden">
                <BackgroundBeams className="opacity-50" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Meet the Team</h2>
                        <p className="max-w-2xl mx-auto text-lg text-slate-300">
                            The passionate minds working together to reshape healthcare.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pl-4 pr-4">
                        {team.map((member, idx) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: idx * 0.15 }}
                                className="group relative flex flex-col items-center text-center p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden mb-6 border-[6px] border-slate-800 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:border-green-500/50">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover object-center bg-slate-800 text-slate-400"
                                        sizes="(max-width: 768px) 160px, 192px"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}&backgroundColor=166534&textColor=ffffff`;
                                        }}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                                <p className="text-green-400 font-medium mt-2">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}