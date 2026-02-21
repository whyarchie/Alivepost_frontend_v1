'use client'

import { motion } from 'framer-motion'

export function StatsSection() {
  return (
    <section className="py-12 bg-blue-600 text-white px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-lg font-semibold"
        >
          Partner with us: Instant infrastructure, zero upfront investment
        </motion.p>
      </div>
    </section>
  )
}
