'use client'

import { motion } from 'framer-motion'
import { BellIcon, DatabaseIcon, BarChartIcon } from './icons'
import { BentoGrid, BentoGridItem } from './ui/bento-grid'

export function SolutionSection() {
  const solutions = [
    {
      title: 'Enhanced Follow-up',
      description: 'AI-powered daily check-ins with risk scoring to identify deteriorating patients before readmission.',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-100 to-green-50 justify-center items-center"><BellIcon /></div>,
      className: "md:col-span-2",
    },
    {
      title: 'Home Care & Pharmacy',
      description: 'Predictive medication refills and doorstep delivery ensuring 100% adherence to prescriptions.',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 justify-center items-center"><DatabaseIcon /></div>,
      className: "md:col-span-1",
    },
    {
      title: 'Real-time Visibility',
      description: 'Clinical alert engine triggering proactive outreach from hospital care teams.',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 justify-center items-center"><BarChartIcon /></div>,
      className: "md:col-span-3",
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

        <BentoGrid className="max-w-4xl mx-auto">
          {solutions.map((item, i) => (
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
  )
}
