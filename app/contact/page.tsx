"use client"

import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

const contactMethods = [
    {
        title: "Email Us",
        description: "Our friendly team is here to help.",
        details: "Abhishekcv2015@gmail.com",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        )
    },
    {
        title: "Call Us",
        description: "Our Team is here to help.",
        details: "+91 7607652500",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
        )
    },
    {
        title: "Visit Us",
        description: "Come say hello at our HQ.",
        details: "H-53, A Block, Sector 63, Noida, Uttar Pradesh 201309",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
        )
    }
]

export default function Contact() {
    return (
        <main className="relative min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative w-full overflow-hidden">
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
                                Contact Us
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                We&apos;d love to <br className="hidden md:block" />
                                <Highlight className="text-black inline-block mt-2">Hear From You</Highlight>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-700 font-medium tracking-tight max-w-2xl mx-auto leading-relaxed mt-4">
                                Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                            </p>
                        </motion.div>
                    </div>
                </HeroHighlight>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-24 bg-white border-t border-slate-200 relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Left Column: Contact Methods */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-slate-900">Get in touch</h2>
                                <p className="text-lg text-slate-600">
                                    Fill out the form and our team will get back to you within 24 hours.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {contactMethods.map((method, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-300"
                                    >
                                        <div className="p-3 bg-white rounded-xl text-green-600 shadow-sm border border-slate-100 flex-shrink-0">
                                            {method.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{method.title}</h3>
                                            <p className="text-slate-600 mb-2">{method.description}</p>
                                            <p className="font-semibold text-green-700">{method.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Column: Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50"
                        >
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name" className="text-slate-700 font-medium">First name</Label>
                                        <Input id="first-name" placeholder="John" className="bg-slate-50/50 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name" className="text-slate-700 font-medium">Last name</Label>
                                        <Input id="last-name" placeholder="Doe" className="bg-slate-50/50 h-12" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
                                    <Input id="email" type="email" placeholder="john@example.com" className="bg-slate-50/50 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-slate-700 font-medium">Subject</Label>
                                    <Input id="subject" placeholder="How can we help?" className="bg-slate-50/50 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-slate-700 font-medium">Message</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us a little about your project..."
                                        className="min-h-[150px] bg-slate-50/50 resize-y"
                                    />
                                </div>

                                <div className="pt-4">
                                    <HoverBorderGradient
                                        containerClassName="rounded-full w-full"
                                        as="button"

                                        className="bg-green-600 text-white w-full flex justify-center items-center gap-2 font-bold px-8 py-4 text-sm shadow-xl shadow-green-900/20"
                                    >
                                        <span>Send Message</span>
                                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </HoverBorderGradient>
                                </div>
                            </form>
                        </motion.div>

                    </div>
                </div>
            </section>
        </main>
    )
}
