"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { HoverBorderGradient } from "./ui/hover-border-gradient"
import { HeroHighlight, Highlight } from "./ui/hero-highlight"
import Link from "next/link"

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

const slideInLeftVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
}

export function HeroSection() {
  const ref = useRef(null)

  return (
    <section id="hero" ref={ref} className="relative w-full border-b border-slate-200 overflow-hidden">
      <HeroHighlight containerClassName="py-20 lg:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Copy & CTA */}
            <motion.div className="space-y-8 flex flex-col items-start text-left max-w-2xl">
              <motion.div
                variants={slideInLeftVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                POST-DISCHARGE CARE SYSTEM
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  variants={slideInLeftVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]"
                >
                  Extending Care <br className="hidden md:block" />
                  <Highlight className="text-black inline-block mt-2">Beyond Discharge</Highlight>
                </motion.h1>
                <motion.p
                  variants={slideInLeftVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="text-lg text-slate-600 tracking-tight max-w-xl leading-relaxed"
                >
                  A 360° digital recovery ecosystem. Reduce readmissions, unlock new revenue streams, and ensure every patient is monitored exactly according to clinical protocols.
                </motion.p>
              </div>
              <motion.div
                variants={slideInLeftVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex flex-wrap gap-4 items-center pt-2"
              >
                <Link href="/contact">
                  <HoverBorderGradient
                    containerClassName="rounded-lg"
                    as="button"
                    className="bg-green-600 text-white flex items-center gap-2 font-bold px-6 py-3 text-sm"
                  >
                    <span>Book a Demo</span>
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </HoverBorderGradient>
                </Link>

                <Link href="/about">
                  <button className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg font-semibold text-sm tracking-wide transition-colors">
                    Explore Platform
                  </button>
                </Link>
              </motion.div>

              <motion.div
                variants={slideInLeftVariants}
                initial="hidden"
                animate="visible"
                custom={4}
                className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-slate-200/60 w-full"
              >
                {["AI Risk Scoring", "Zero Upfront Cost", "Clinical Protocol"].map((benefit, i) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    {benefit}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column: Visual Anchor */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative w-full h-full flex items-center justify-center lg:justify-end"
            >
              {/* Decorative background elements behind image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-green-50 to-white rounded-full blur-3xl -z-10" />

              <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-2xl shadow-green-900/5 bg-white">
                {/* Simulated Safari/Mac Window Header for extra professionalism */}
                <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>

                <Image
                  src="/healthdashboard.png"
                  alt="Post-Discharge Care System Dashboard"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </motion.div>

          </div>
        </div>
      </HeroHighlight>
    </section>
  )
}
