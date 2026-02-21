'use client'

import { motion } from 'framer-motion'
import { HeartIcon, TrendingUpIcon, ClipboardIcon } from './icons'

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

export function ValuePropSection() {
  const stakeholders = [
    {
      title: 'For Patients',
      heading: 'Safer Recovery & Peace of Mind',
      icon: HeartIcon,
      benefits: [
        'Personalized care plans',
        '24/7 monitoring',
        'Family engagement',
      ],
    },
    {
      title: 'For Hospitals',
      heading: 'Retention, Revenue & Reputation',
      icon: TrendingUpIcon,
      benefits: [
        'New revenue streams',
        'Reduced readmissions',
        'Zero upfront cost',
      ],
    },
    {
      title: 'For Doctors',
      heading: 'Data-Driven Clinical Insight',
      icon: ClipboardIcon,
      benefits: [
        'Real-time patient data',
        'Early intervention alerts',
        'Better outcomes',
      ],
    },
  ]

  return (
    <section id="value" className="py-24 bg-gradient-to-b from-white to-blue-50 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Unlocking Value Across the Care Ecosystem
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Aligning incentives for all stakeholders, turning post-discharge risks into revenue and recovery opportunities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stakeholders.map((stakeholder, i) => {
            const IconComponent = stakeholder.icon
            return (
              <motion.div
                key={i}
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="mb-4">
                  <IconComponent />
                </div>
                <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
                  {stakeholder.title}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{stakeholder.heading}</h3>
                <ul className="space-y-3">
                  {stakeholder.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
