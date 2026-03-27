import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const PROJECT_DATA = {
  gainlytics: {
    title: 'Gainlytics – AI Fitness Analytics',
    tag: 'Web App',
    description:
      "Gainlytics is a full-stack fitness analytics platform I built to track body metrics, training, and nutrition using clean dashboards and AI-driven insights. It's designed to be simple, fast, and useful for everyday lifters. This was my senior capstone project that I worked solo on.",
    tags: ['Dashboards & Tracking', 'Workouts & PRs', 'AI Insights'],
    whatItDoes: [
      'Log workouts, sets, and PRs with a streamlined UI.',
      'Track bodyweight and body fat over time using charts.',
      'Use AI to analyze trends and suggest goals/targets.',
      'Clean dark theme optimized for desktop + mobile.',
    ],
    tech: ['React', 'Python', 'Chart.js', 'REST API', 'CSS'],
    externalUrl: 'https://www.gainlytics.org/',
    repoUrl: 'https://github.com/lclampitt/gainlytics',
    previewUrl: 'https://www.gainlytics.org/',
  },
  'connect-4-ai': {
    title: 'Connect 4 AI',
    tag: 'AI / Game',
    description:
      'A Connect 4 implementation featuring an AI opponent powered by the Minimax algorithm with alpha-beta pruning. The AI evaluates board states several moves ahead, making it a challenging and near-optimal opponent. Built as a demonstration of classical AI game-tree search.',
    tags: ['Python', 'Minimax AI', 'Alpha-Beta Pruning'],
    whatItDoes: [
      'Play against an AI that thinks several moves ahead.',
      'Minimax algorithm with alpha-beta pruning for optimal performance.',
      'Difficulty scales with search depth.',
      'Clean turn-based game loop with win detection.',
    ],
    tech: ['Python', 'Minimax', 'Alpha-Beta Pruning', 'OOP'],
    repoUrl: 'https://github.com/lclampitt/connect4-ai-pygame',
    demoUrl: 'https://drive.google.com/file/d/1OjClzCEPo4WdMD-YScglCydnQWiWCVHe/view',
    previewImage: '/connect4ai.png',
  },
  socaldiecasts: {
    title: 'SoCalDiecasts.com',
    tag: 'E-Commerce',
    description:
      'An e-commerce website built for a Southern California diecast collectibles business. Focused on product presentation, intuitive browsing, and a smooth purchase flow. Designed from the ground up with a clean aesthetic that reflects the brand.',
    tags: ['E-Commerce', 'Responsive Design', 'Brand Identity'],
    whatItDoes: [
      'Browse and filter a full product catalog of diecast collectibles.',
      'Clean, brand-aligned visual design built from scratch.',
      'Mobile-responsive layout optimized for all screen sizes.',
      'Smooth purchase flow focused on usability and speed.',
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'E-Commerce'],
    externalUrl: 'https://www.socaldiecasts.com/',
    repoUrl: 'https://github.com/lclampitt/socaldiecasts',
    previewUrl: 'https://www.socaldiecasts.com/',
  },
}

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

export default function ProjectDetail() {
  const { slug } = useParams()
  const data = PROJECT_DATA[slug] || {
    title: 'Project',
    tag: '',
    description: 'More details coming soon.',
    tech: [],
    features: [],
  }

  // Gainlytics-style rich layout
  if (data.whatItDoes) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-h-screen bg-[#080808] pt-24 pb-20"
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Link
              to="/#projects"
              className="inline-flex items-center gap-2 text-white/40 hover:text-[#4F46E5] text-sm
                         transition-colors duration-200 mb-8"
            >
              <span>←</span> Back to Projects
            </Link>
          </motion.div>

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
            className="bg-[#0e0e0e] border border-white/8 rounded-2xl p-8 mb-6"
          >
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{data.title}</h1>

            {/* Description */}
            <p className="text-white/60 text-base leading-relaxed mb-6">{data.description}</p>

            {/* Tag pills */}
            {data.tags && (
              <div className="flex flex-wrap gap-2 mb-8">
                {data.tags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full
                               text-white/60 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/8 mb-6" />

            {/* What it does */}
            <p className="text-white font-bold text-sm mb-4">What it does</p>
            <ul className="flex flex-col gap-2.5 mb-8">
              {data.whatItDoes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-white/60 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4F46E5] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              {data.externalUrl && (
                <a
                  href={data.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white
                             text-sm font-semibold rounded-xl border border-[#4F46E5]
                             transition-all duration-200 hover:bg-transparent hover:text-[#4F46E5]"
                >
                  Visit Live Site <span>→</span>
                </a>
              )}
              {data.demoUrl && (
                <a
                  href={data.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white
                             text-sm font-semibold rounded-xl border border-[#4F46E5]
                             transition-all duration-200 hover:bg-transparent hover:text-[#4F46E5]"
                >
                  Watch Demo <span>→</span>
                </a>
              )}
              {data.repoUrl && (
                <a
                  href={data.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-white
                             text-sm font-semibold rounded-xl border border-white/20
                             transition-all duration-200 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                >
                  <GitHubIcon /> View GitHub Repo
                </a>
              )}
            </div>
          </motion.div>

          {/* Static image preview */}
          {data.previewImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              className="w-full rounded-2xl overflow-hidden border border-white/8"
            >
              <img
                src={data.previewImage}
                alt={`${data.title} preview`}
                className="w-full h-auto"
              />
            </motion.div>
          )}

          {/* Site preview iframe */}
          {data.previewUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              className="w-full rounded-2xl overflow-hidden border border-white/8 bg-[#0e0e0e]"
              style={{ height: '600px' }}
            >
              <iframe
                src={data.previewUrl}
                title={data.title}
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  // Default layout for other projects
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-[#080808] pt-24 pb-20"
    >
      <div className="max-w-3xl mx-auto px-6">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-white/40 hover:text-[#4F46E5] text-sm
                       transition-colors duration-200 mb-10"
          >
            <span>←</span> Back to Projects
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
        >
          {data.tag && (
            <span className="inline-block px-3 py-1 bg-[#4F46E5]/15 border border-[#4F46E5]/30
                             rounded-full text-[#4F46E5] text-xs font-semibold mb-4">
              {data.tag}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-10">{data.title}</h1>
        </motion.div>

        {/* Image placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="w-full aspect-video rounded-2xl bg-gradient-to-br from-[#4F46E5]/10 to-[#0a0a0a]
                     border border-white/5 mb-10 flex items-center justify-center"
        >
          <span className="text-[#4F46E5]/20 text-7xl font-black select-none">
            {data.title.slice(0, 2).toUpperCase()}
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          className="text-white/60 text-base leading-relaxed mb-10"
        >
          {data.description}
        </motion.p>

        <div className="grid sm:grid-cols-2 gap-8">
          {data.tech && data.tech.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            >
              <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-4">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {data.tech.map((t) => (
                  <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-white/60 text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {data.features && data.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
            >
              <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-4">
                Key Features
              </p>
              <ul className="flex flex-col gap-2">
                {data.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/60 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
