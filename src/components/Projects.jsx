import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/content'
import { fadeUp } from '../lib/motion'
import MagicHover from './MagicHover'

function PillButton({ href, to, children }) {
  const className =
    'inline-flex items-center justify-center rounded-full border border-ink/18 px-4 py-1.5 text-sm text-ink/90 hover:border-ink/50 hover:text-ink transition-colors'
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function PreviewBlock({ project, className = '' }) {
  return (
    <div className={`bg-raised flex items-center justify-center ${className}`}>
      <span className="font-mono text-[11px] md:text-xs tracking-[0.22em] text-dim">
        {project.previewLabel}
      </span>
    </div>
  )
}

function FeaturedCard({ project }) {
  return (
    <MagicHover className="h-full rounded-3xl border border-line bg-surface">
      <article className="h-full flex flex-col">
        <PreviewBlock project={project} className="min-h-[240px] flex-[1.4] aspect-[16/10] md:aspect-auto" />
        <div className="p-6 md:p-7 flex flex-col gap-3">
          <h3 className="font-display text-2xl font-semibold text-ink">{project.title}</h3>
          <p className="text-muted text-sm leading-relaxed">{project.desc}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {project.liveUrl && <PillButton href={project.liveUrl}>Live</PillButton>}
            {project.caseStudy && <PillButton to={`/projects/${project.slug}`}>Case study</PillButton>}
          </div>
        </div>
      </article>
    </MagicHover>
  )
}

function StackCard({ project }) {
  return (
    <MagicHover className="h-full rounded-3xl border border-line bg-surface">
      <article className="flex flex-col h-full">
        <PreviewBlock project={project} className="aspect-[16/9] min-h-[120px]" />
        <div className="p-5 flex flex-col gap-2 flex-1">
          <h3 className="font-display text-lg font-semibold text-ink">{project.title}</h3>
          <p className="text-muted text-sm leading-relaxed flex-1">{project.desc}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {project.liveUrl && <PillButton href={project.liveUrl}>Live</PillButton>}
            {project.repoUrl && <PillButton href={project.repoUrl}>Code</PillButton>}
          </div>
        </div>
      </article>
    </MagicHover>
  )
}

export default function Projects() {
  const featured = PROJECTS.find((p) => p.layout === 'featured')
  const stacked = PROJECTS.filter((p) => p.layout === 'stack')

  return (
    <section id="projects" className="pt-6 md:pt-8 pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.div {...fadeUp(0)} className="flex items-end justify-between mb-8">
          <h2 className="font-display text-sm tracking-[0.22em] uppercase text-muted">Projects</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          <motion.div {...fadeUp(0.05)} className="lg:col-span-2 lg:row-span-2 min-h-[420px] lg:min-h-[560px]">
            <FeaturedCard project={featured} />
          </motion.div>
          {stacked.map((project, index) => (
            <motion.div key={project.slug} {...fadeUp(0.1 + index * 0.06)} className="lg:col-span-1">
              <StackCard project={project} />
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp(0.12)}
          className="mt-10 pt-6 border-t border-dashed border-line flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8"
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-dim shrink-0">
            Also · Sim racing
          </p>
          <p className="text-sm text-muted flex-1">
            8+ years competing in ENASCAR series. Personality, not a second portfolio.
          </p>
          <Link
            to="/sim-racing"
            className="text-sm text-accent hover:text-ink transition-colors shrink-0"
          >
            More →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
