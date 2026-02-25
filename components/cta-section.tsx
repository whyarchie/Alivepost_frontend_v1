'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BackgroundBeams } from './ui/background-beams'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-24 bg-slate-950 relative antialiased px-4 overflow-hidden">
      <BackgroundBeams />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-black mb-6 text-white"
        >
          Ready to Transform Post-Discharge Care at Your Hospital?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-xl mb-8 text-slate-300"
        >
          Partner with us for instant infrastructure and zero upfront investment.
        </motion.p>
        <Link href="/contact">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button className="px-8 py-6 bg-green-500 text-white hover:bg-green-600 font-bold text-lg rounded-lg shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] transition-all">
              Schedule a Consultation
            </Button>
          </motion.div>
        </Link>
      </div>
    </section>
  )
}
