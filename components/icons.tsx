"use client"

import { motion } from "framer-motion"

export const LockIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="45" width="50" height="40" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="4" />
    <motion.path d="M35 45V35C35 26.7157 41.7157 20 50 20C58.2843 20 65 26.7157 65 35V45" stroke="#10b981" strokeWidth="4" strokeLinecap="round"
      initial={{ pathLength: 0, pathOffset: 1 }} animate={{ pathLength: 1, pathOffset: 0 }} transition={{ duration: 1, ease: "easeInOut" }} />
    <motion.circle cx="50" cy="65" r="5" fill="#10b981" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }} />
    <line x1="50" y1="70" x2="50" y2="78" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
  </motion.svg>
)

export const CheckmarkIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#ecfdf5" />
    <motion.circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="4" strokeDasharray="4 6"
      animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} />
    <motion.path d="M30 50L45 65L70 35" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} />
  </motion.svg>
)

export const HeartIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.circle cx="50" cy="50" r="45" fill="#f0fdf4" initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }} />
    <motion.path d="M50 82C50 82 20 60 20 38C20 24.5 32 20 40 26C45.5 30 50 36 50 36C50 36 54.5 30 60 26C68 20 80 24.5 80 38C80 60 50 82 50 82Z"
      fill="#10b981" stroke="#059669" strokeWidth="2" strokeLinejoin="round"
      animate={{ scale: [1, 1.15, 1, 1.15, 1] }} transition={{ duration: 2, times: [0, 0.1, 0.2, 0.3, 1], repeat: Number.POSITIVE_INFINITY }}
    />
    <motion.path d="M30 40 L45 40 L50 25 L55 55 L60 40 L70 40" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} />
  </motion.svg>
)

export const BarChartIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#f8fafc" />
    <motion.rect x="15" y="60" width="18" height="30" rx="4" fill="#6ee7b7" initial={{ height: 0, y: 90 }} animate={{ height: 30, y: 60 }} transition={{ duration: 0.8, delay: 0.1 }} />
    <motion.rect x="41" y="40" width="18" height="50" rx="4" fill="#34d399" initial={{ height: 0, y: 90 }} animate={{ height: 50, y: 40 }} transition={{ duration: 0.8, delay: 0.3 }} />
    <motion.rect x="67" y="20" width="18" height="70" rx="4" fill="#10b981" initial={{ height: 0, y: 90 }} animate={{ height: 70, y: 20 }} transition={{ duration: 0.8, delay: 0.5 }} />
    <motion.path d="M15 50 L41 30 L67 10 L85 15" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 1, ease: "easeOut" }} />
    <motion.circle cx="15" cy="50" r="4" fill="#059669" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
    <motion.circle cx="41" cy="30" r="4" fill="#059669" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} />
    <motion.circle cx="67" cy="10" r="4" fill="#059669" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.9 }} />
  </motion.svg>
)

export const ShieldIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path d="M50 15 L85 25 V50 C85 70 50 90 50 90 C50 90 15 70 15 50 V25 L50 15Z"
      fill="#ecfdf5" stroke="#10b981" strokeWidth="6" strokeLinejoin="round"
      initial={{ pathLength: 0, fillOpacity: 0 }} animate={{ pathLength: 1, fillOpacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.path d="M40 50 L48 58 L65 38" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.2 }} />
    <motion.line x1="15" y1="50" x2="85" y2="50" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="2 4"
      animate={{ y1: [30, 70, 30], y2: [30, 70, 30] }} transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} />
  </motion.svg>
)

export const ClipboardIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="20" width="50" height="70" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="4" />
    <motion.rect x="35" y="10" width="30" height="15" rx="4" fill="#10b981" initial={{ y: -10, opacity: 0 }} animate={{ y: 10, opacity: 1 }} transition={{ type: "spring", delay: 0.3 }} />
    <path d="M35 45 H65" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
    <path d="M35 60 H65" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
    <path d="M35 75 H50" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
    <motion.circle cx="70" cy="70" r="15" fill="#10b981" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1 }} />
    <motion.path d="M63 70 L68 75 L77 64" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.4 }} />
  </motion.svg>
)

export const TrendingUpIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="80" height="80" rx="16" fill="#ecfdf5" />
    <motion.path d="M20 75 L40 55 L55 65 L80 30" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
    <motion.path d="M60 30 H80 V50" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} />
    <motion.circle cx="40" cy="55" r="4" fill="#059669" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
    <motion.circle cx="55" cy="65" r="4" fill="#059669" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }} />
  </motion.svg>
)

export const UsersIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.circle cx="50" cy="35" r="16" fill="#34d399" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }} />
    <motion.path d="M20 85 C20 65 30 55 50 55 C70 55 80 65 80 85" fill="#10b981"
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />

    <motion.circle cx="25" cy="45" r="10" fill="#a7f3d0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }} />
    <motion.path d="M5 85 C5 70 12 65 25 65" stroke="#a7f3d0" strokeWidth="4" strokeLinecap="round" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.7 }} />

    <motion.circle cx="75" cy="45" r="10" fill="#a7f3d0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.9 }} />
    <motion.path d="M95 85 C95 70 88 65 75 65" stroke="#a7f3d0" strokeWidth="4" strokeLinecap="round" fill="none"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.1 }} />
  </motion.svg>
)

export const BellIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path d="M50 20 C65 20 70 35 70 50 V65 L80 75 H20 L30 65 V50 C30 35 35 20 50 20 Z"
      fill="#ecfdf5" stroke="#10b981" strokeWidth="6" strokeLinejoin="round"
      initial={{ rotate: 0, originX: 0.5, originY: 0.2 }}
      animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
      transition={{ duration: 1, delay: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
    />
    <path d="M42 80 A8 8 0 0 0 58 80" fill="#10b981" />
    <motion.circle cx="75" cy="25" r="10" fill="#ef4444"
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.5, bounce: 0.6 }} />
    <motion.circle cx="75" cy="25" r="10" fill="#ef4444"
      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }} />
  </motion.svg>
)

export const DatabaseIcon = () => (
  <motion.svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.ellipse cx="50" cy="25" rx="35" ry="12" fill="#ecfdf5" stroke="#10b981" strokeWidth="4" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} />
    <motion.path d="M15 25 V50 C15 60 85 60 85 50 V25" fill="#f0fdf4" stroke="#10b981" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
    <motion.path d="M15 50 V75 C15 85 85 85 85 75 V50" fill="#f8fafc" stroke="#10b981" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.8 }} />

    <motion.circle cx="35" cy="25" r="3" fill="#059669" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }} />
    <motion.circle cx="45" cy="25" r="3" fill="#059669" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, delay: 0.3, repeat: Number.POSITIVE_INFINITY }} />
    <motion.circle cx="55" cy="25" r="3" fill="#059669" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, delay: 0.6, repeat: Number.POSITIVE_INFINITY }} />

    <motion.circle cx="35" cy="50" r="3" fill="#059669" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }} />
    <motion.circle cx="45" cy="50" r="3" fill="#059669" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, delay: 0.4, repeat: Number.POSITIVE_INFINITY }} />

    <motion.circle cx="35" cy="75" r="3" fill="#059669" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }} />
  </motion.svg>
)

export const PlusIcon = () => (
  <motion.svg className="w-8 h-8 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#ecfdf5" />
    <motion.rect x="42" y="20" width="16" height="60" rx="4" fill="#10b981" initial={{ height: 0, y: 50 }} animate={{ height: 60, y: 20 }} transition={{ duration: 0.4, ease: "easeOut" }} />
    <motion.rect x="20" y="42" width="60" height="16" rx="4" fill="#10b981" initial={{ width: 0, x: 50 }} animate={{ width: 60, x: 20 }} transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }} />
  </motion.svg>
)
