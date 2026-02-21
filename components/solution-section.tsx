'use client'

import { motion } from 'framer-motion'
import { BellIcon, DatabaseIcon, BarChartIcon } from './icons'

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: "easeOut" as const,
    },
  }),
}

export function SolutionSection() {
  const solutions = [
    {
      title: 'Enhanced Follow-up',
      description: 'AI-powered daily check-ins with risk scoring to identify deteriorating patients before readmission',
      icon: BellIcon,
    },
    {
      title: 'Home Care & Pharmacy',
      description: 'Predictive medication refills and doorstep delivery ensuring 100% adherence to prescriptions',
      icon: DatabaseIcon,
    },
    {
      title: 'Real-time Visibility',
      description: 'Clinical alert engine triggering proactive outreach from hospital care teams',
      icon: BarChartIcon,
    },
  ]

  return (
    <section id="solution" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            A Connected Digital Recovery Ecosystem
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A unified platform bridging the gap between hospital discharge and full recovery through AI-driven intelligence and human intervention.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, i) => {
            const IconComponent = solution.icon
            return (
              <motion.div
                key={i}
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-200 hover:border-green-400 transition-all hover:shadow-xl"
              >
                <div className="mb-4">
                  <IconComponent />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{solution.title}</h3>
                <p className="text-slate-600 leading-relaxed">{solution.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
