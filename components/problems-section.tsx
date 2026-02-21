'use client'

import { motion } from 'framer-motion'

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

export function ProblemsSection() {
  const problems = [
    {
      stat: '60%',
      description: 'of patients fail to follow full prescription instructions',
    },
    {
      stat: '18%',
      description: 'unplanned readmission rate due to missed medicines and ignored symptoms',
    },
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

        <div className="grid md:grid-cols-2 gap-8">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="bg-white rounded-2xl p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl font-black text-blue-600 mb-4">{problem.stat}</div>
              <p className="text-lg text-slate-600">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
