'use client'

import { motion } from 'framer-motion'
import { ShieldIcon, CheckmarkIcon } from './icons'

export function FeaturesSection() {
  const features = [
    {
      icon: ShieldIcon,
      title: 'Secure Infrastructure',
      description: 'HIPAA compliant & encrypted',
    },
    {
      icon: CheckmarkIcon,
      title: 'Clinical Protocol-Driven',
      description: 'Designed with healthcare experts',
    },
  ]

  return (
    <section id="features" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Enterprise-Grade Security
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Trusted by leading healthcare professionals and institutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {features.map((feature, i) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="mb-4">
                  <IconComponent />
                </div>
                <p className="font-semibold text-slate-900 mb-2">{feature.title}</p>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
