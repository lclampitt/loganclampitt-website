import { motion } from 'framer-motion'

const SERVICES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: 'Web Design',
    desc: 'Clean, responsive websites built using HTML, CSS, and JavaScript. I focus on performance, mobile-friendliness, and visual appeal using modern design principles.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: 'UI/UX Design',
    desc: 'Designing intuitive, user-centered interfaces and wireframes using tools like Figma. Focused on usability, accessibility, and aesthetic alignment with brand identity.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 0h.008v.008H7.5v-.008zm0-3h.008v.008H7.5v-.008z" />
      </svg>
    ),
    title: 'App Design',
    desc: 'Creating engaging layouts and user flows for mobile or web apps. I specialize in design mockups, prototyping, and collaborative workflows between design and dev teams.',
  },
]

export default function Services() {
  return (
    <section id="services" className="py-28 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-[#4F46E5] text-xs font-semibold tracking-widest uppercase mb-3"
        >
          What I Do
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
          className="text-3xl md:text-4xl font-black text-white mb-16"
        >
          My Services
        </motion.h2>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-[#0e0e0e] border border-white/5 rounded-2xl p-8
                         transition-all duration-300
                         hover:border-[#4F46E5]/40 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)]"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center
                              text-[#4F46E5] mb-6 transition-colors duration-300
                              group-hover:bg-[#4F46E5]/20">
                {svc.icon}
              </div>

              <h3 className="text-white font-bold text-lg mb-3">{svc.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{svc.desc}</p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#4F46E5]/5 rotate-45 transition-colors duration-300 group-hover:bg-[#4F46E5]/10" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
