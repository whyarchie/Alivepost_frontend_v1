'use client'

import { motion } from 'framer-motion'
import { HoverEffect } from './ui/card-hover-effect'

export function ProblemsSection() {
  const problems = [
    {
      stat: '60%',
      description: 'of patients fail to follow full prescription instructions post-discharge',
    },
    {
      stat: '18%',
      description: 'unplanned readmission rate due to missed medicines and ignored symptoms',
    },
    {
      stat: '$52B',
      description: 'annual cost to the healthcare system due to preventable readmissions',
    }
  ]

  return (
    <section id="problems" className="py-24 bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            The "Black Hole" of Care
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Without structured follow-up, the gap between hospital discharge and home recovery silently drives complications and readmissions.
          </p>
        </motion.div>

        <HoverEffect items={problems} />
      </div>
    </section>
  )
}
