import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const PROJECTS = [
  {
    slug: 'socaldiecasts',
    title: 'SoCalDiecasts.com',
    tag: 'E-Commerce',
    desc: 'An e-commerce website for a diecast collectibles business, built with a focus on product presentation and seamless UX.',
    tech: ['HTML/CSS', 'JavaScript', 'E-Commerce'],
    accent: '#EF4444',
    favorite: true,
  },
  {
    slug: 'gainlytics',
    title: 'Gainlytics',
    tag: 'Web App',
    desc: 'A fitness tracking and analytics platform designed to help users log workouts, track progress over time, and visualize performance data.',
    tech: ['React', 'Python', 'Data Viz'],
    accent: '#22D3EE',
  },
  {
    slug: 'connect-4-ai',
    title: 'Connect 4 AI',
    tag: 'AI / Game',
    desc: 'An intelligent Connect 4 game featuring a minimax algorithm with alpha-beta pruning, allowing the AI to play at a near-optimal level.',
    tech: ['Python', 'Minimax', 'AI'],
    accent: '#EAB308',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-28 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-[#4F46E5] text-xs font-semibold tracking-widest uppercase mb-3"
        >
          My Work
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
          className="text-3xl md:text-4xl font-black text-white mb-16"
        >
          Projects
        </motion.h2>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PROJECTS.map((proj, i) => (
            <motion.div
              key={proj.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                to={`/projects/${proj.slug}`}
                className="group block relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0e0e0e]
                           border border-white/5 transition-all duration-300 flex flex-col justify-between p-6"
                style={{ borderColor: `${proj.accent}22` }}
              >
                {/* Accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: proj.accent }} />

                {/* Favorite star */}
                {proj.favorite && (
                  <div className="absolute top-4 right-4 z-20">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}

                {/* Top: dot + tag */}
                <div className="relative z-10">
                  <div className="w-3 h-3 rounded-full mb-4" style={{ background: proj.accent }} />
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest">{proj.tag}</p>
                </div>

                {/* Bottom: title + desc + arrow */}
                <div className="relative z-10">
                  <p className="text-white font-bold text-base leading-snug mb-2">{proj.title}</p>
                  <p className="text-white/40 text-xs leading-relaxed mb-3">{proj.desc}</p>
                  <div
                    className="inline-flex items-center gap-1 text-xs font-semibold opacity-0
                               group-hover:opacity-100 transition-opacity duration-200"
                    style={{ color: proj.accent }}
                  >
                    View Project <span>→</span>
                  </div>
                </div>

                {/* Background glow */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-48 opacity-10 pointer-events-none"
                  style={{ background: `linear-gradient(to top, ${proj.accent}, transparent)` }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
