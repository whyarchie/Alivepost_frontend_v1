'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-green-600 to-green-800 text-white px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-black mb-6"
        >
          Ready to Transform Post-Discharge Care at Your Hospital?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-xl mb-8 text-green-100"
        >
          Partner with us for instant infrastructure and zero upfront investment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Button className="px-8 py-6 bg-white text-green-600 hover:bg-green-50 font-bold text-lg rounded-lg">
            Schedule a Consultation
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
