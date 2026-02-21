"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
// Removing next/image as we're replacing the image with an SVG component

const AIPatientRecoverySVG = () => {
  return (
    <motion.svg width="350" height="400" viewBox="0 0 350 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
      {/* Background Glow */}
      <motion.circle
        cx="175" cy="200" r="140"
        fill="url(#glowGradient)"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <defs>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(22, 163, 74, 0.15)" />
          <stop offset="100%" stopColor="rgba(22, 163, 74, 0)" />
        </radialGradient>
      </defs>

      {/* Main Dashboard Panel */}
      <motion.rect
        x="40" y="80" width="270" height="240" rx="16"
        fill="white" stroke="#e2e8f0" strokeWidth="2"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Dashboard Header Bar */}
      <motion.rect x="42" y="82" width="266" height="50" rx="14" fill="#f8fafc" />
      <circle cx="70" cy="107" r="14" fill="#dcfce7" />
      <path d="M65 107 H75 M70 102 V112" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
      <rect x="95" y="100" width="80" height="6" rx="3" fill="#cbd5e1" />
      <rect x="95" y="112" width="50" height="4" rx="2" fill="#e2e8f0" />
      <motion.circle cx="280" cy="107" r="4" fill="#ef4444" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }} />

      {/* Hero Heartbeat Monitor Sub-panel */}
      <motion.rect x="60" y="145" width="230" height="90" rx="12" fill="#0f172a"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ originX: 0.5 }} />
      <motion.path
        d="M60 190 H100 L115 160 L140 220 L160 150 L180 210 L195 190 H290"
        stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      />
      {/* Monitor Grid Lines */}
      <path d="M60 160 H290 M60 175 H290 M60 205 H290 M60 220 H290" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <path d="M100 145 V235 M140 145 V235 M180 145 V235 M220 145 V235 M260 145 V235" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* AI Risk Score Badges */}
      <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
        <rect x="60" y="250" width="110" height="45" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
        <rect x="75" y="262" width="20" height="20" rx="4" fill="#22c55e" />
        <path d="M80 272 L83 275 L90 268" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="105" y="271" fontSize="10" fill="#64748b" fontWeight="600" fontFamily="sans-serif">Risk Score</text>
        <text x="105" y="283" fontSize="12" fill="#0ea5e9" fontWeight="bold" fontFamily="sans-serif">LOW</text>
      </motion.g>

      <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 1.0 }}>
        <rect x="180" y="250" width="110" height="45" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="195" cy="272" r="10" fill="#e0f2fe" />
        <path d="M195 266 V274 M191 270 H199" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
        <text x="215" y="271" fontSize="10" fill="#64748b" fontWeight="600" fontFamily="sans-serif">Adherence</text>
        <text x="215" y="283" fontSize="12" fill="#10b981" fontWeight="bold" fontFamily="sans-serif">98%</text>
      </motion.g>

      {/* Floating AI Notification Card 1 */}
      <motion.g
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1, y: [0, -10, 0] }}
        transition={{ duration: 0.8, delay: 1.2, y: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } }}>
        <rect x="10" y="50" width="150" height="55" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1" style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }} />
        <circle cx="35" cy="77" r="12" fill="#3b82f6" />
        <path d="M30 77 L35 82 L42 72" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="55" y="68" width="80" height="6" rx="3" fill="#cbd5e1" />
        <rect x="55" y="80" width="50" height="4" rx="2" fill="#e2e8f0" />
      </motion.g>

      {/* Floating AI Notification Card 2 */}
      <motion.g
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 0.8, delay: 1.4, y: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } }}>
        <rect x="220" y="280" width="120" height="55" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1" style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }} />
        <circle cx="245" cy="307" r="12" fill="#f59e0b" />
        <path d="M245 301 V309 M245 313 A0.5 0.5 0 1 1 245 313.1" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <rect x="265" y="298" width="55" height="6" rx="3" fill="#cbd5e1" />
        <rect x="265" y="310" width="35" height="4" rx="2" fill="#e2e8f0" />
      </motion.g>

      {/* Animating Data Particles/Sparks connecting UI */}
      <motion.circle cx="175" cy="320" r="4" fill="#10b981"
        initial={{ y: 320, opacity: 0 }} animate={{ y: 295, opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 1 }} />
      <motion.circle cx="160" cy="320" r="3" fill="#10b981"
        initial={{ y: 320, opacity: 0 }} animate={{ y: 295, opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, delay: 1.5 }} />
      <motion.circle cx="190" cy="320" r="2.5" fill="#10b981"
        initial={{ y: 320, opacity: 0 }} animate={{ y: 295, opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, delay: 0.8 }} />
    </motion.svg>
  );
}



const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      delay: 0.3,
    },
  },
}

export function HeroSection() {
  const ref = useRef(null)

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white noise-overlay"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#AFFF00]/5 to-white" />

      <motion.div
        className="absolute top-20 left-10 w-24 h-24 rounded-full bg-[#AFFF00]/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-[#AFFF00]/10 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <motion.div className="space-y-5">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 bg-[#121212] text-white px-3 py-1.5 rounded-full text-xs font-mono tracking-wider"
            >
              <motion.span
                className="w-2 h-2 bg-[#AFFF00] rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              POST-DISCHARGE CARE SYSTEM
            </motion.div>

            <div className="space-y-1 overflow-hidden">
              <motion.h1
                className="text-5xl md:text-7xl font-black tracking-tighter text-[#121212] leading-[0.9]"
              >
                <motion.span
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  className="inline-block"
                >
                  EXTENDING CARE
                </motion.span>
              </motion.h1>
              <motion.h1
                className="text-5xl md:text-7xl font-black tracking-tighter text-[#121212] leading-[0.9]"
              >
                <motion.span
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="inline-block text-green-600"
                >
                  BEYOND DISCHARGE
                </motion.span>
              </motion.h1>
              <motion.p
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="text-lg md:text-xl font-mono text-[#121212]/60 tracking-tight pt-2 max-w-md"
              >
                360° post-discharge care, retention & revenue system with clinical AI workflows.
              </motion.p>
            </div>

            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={4}
              className="flex flex-wrap gap-3 pt-2"
            >
              <motion.button
                className="bg-green-600 text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 group relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Book a Demo</span>
                <motion.svg
                  className="w-4 h-4 relative z-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </motion.button>
              <motion.button
                className="border-2 border-[#121212] text-[#121212] px-6 py-3 rounded-full font-bold text-sm tracking-wide relative overflow-hidden"
                whileHover={{ scale: 1.02, backgroundColor: "#121212", color: "#fff" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Learn More
              </motion.button>
            </motion.div>

            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={5}
              className="flex flex-wrap gap-4 pt-2"
            >
              {["AI-Powered Monitoring", "Zero Upfront Cost", "Proven Outcomes", "Clinical Protocol"].map((benefit, i) => (
                <motion.div
                  key={benefit}
                  className="flex items-center gap-2 text-xs font-mono text-[#121212]/60"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  {benefit}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="relative flex justify-center">
            <motion.div variants={scaleInVariants} initial="hidden" animate="visible" className="relative">
              <motion.div
                className="absolute inset-0 bg-[#84cc16]/30 blur-[80px] rounded-full scale-75"
                animate={{
                  scale: [0.75, 0.85, 0.75],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />

              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <AIPatientRecoverySVG />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="w-5 h-8 border-2 border-[#121212]/30 rounded-full flex justify-center pt-1.5">
              <motion.div
                className="w-1 h-2 bg-[#121212]/30 rounded-full"
                animate={{ y: [0, 6, 0], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
