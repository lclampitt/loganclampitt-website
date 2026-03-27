import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const SIM_CARDS = [
  {
    slug: 'enascar-college',
    title: 'ENASCAR College iRacing Series',
    subtitle: 'Collegiate Championship',
    accent: '#F97316',
  },
  {
    slug: 'enascar-coca-cola',
    title: 'ENASCAR Coca-Cola iRacing Series',
    subtitle: 'Premier ENASCAR Series',
    accent: '#EF4444',
  },
  {
    slug: 'other-experience',
    title: 'Other Experience',
    subtitle: 'Real World & Competitions',
    accent: '#22C55E',
  },
]

export default function SimRacing() {
  return (
    <section id="sim-racing" className="py-28 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-[#4F46E5] text-xs font-semibold tracking-widest uppercase mb-3"
        >
          On the Track
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
          className="text-3xl md:text-4xl font-black text-white mb-16"
        >
          Sim Racing
        </motion.h2>

        {/* Grid */}
        <div className="grid sm:grid-cols-3 gap-5">
          {SIM_CARDS.map((card, i) => (
            <motion.div
              key={card.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
            >
              <Link to={`/sim-racing/${card.slug}`} className="block group">
                <div
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0e0e0e]
                              border border-white/5 transition-all duration-300 flex flex-col justify-between p-6"
                  style={{ borderColor: `${card.accent}22` }}
                >
                  {/* Accent glow top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{ background: card.accent }}
                  />

                  {/* Top: accent dot + subtitle */}
                  <div className="relative z-10">
                    <div
                      className="w-3 h-3 rounded-full mb-4"
                      style={{ background: card.accent }}
                    />
                    <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Bottom: title + arrow */}
                  <div className="relative z-10">
                    <p className="text-white font-bold text-base leading-snug mb-3">{card.title}</p>
                    <div
                      className="inline-flex items-center gap-1 text-xs font-semibold opacity-0
                                 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: card.accent }}
                    >
                      View <span>→</span>
                    </div>
                  </div>

                  {/* Background glow */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-48 opacity-10 pointer-events-none"
                    style={{ background: `linear-gradient(to top, ${card.accent}, transparent)` }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
