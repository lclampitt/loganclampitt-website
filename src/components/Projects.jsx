import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/content'
import { fadeUp } from '../lib/motion'

function StatusPills({ status, tone }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-wide lowercase">
      {status.map((item) => (
        <span
          key={item}
          className={`inline-flex items-center gap-1.5 ${tone === 'amber' ? 'text-amber' : 'text-dim'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tone === 'amber' ? 'bg-amber' : 'bg-dim'}`} />
          {item}
        </span>
      ))}
    </span>
  )
}

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
  if (project.previewImage) {
    return (
      <div className={`relative overflow-hidden bg-raised ${className}`}>
        <img
          src={project.previewImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </div>
    )
  }

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
    <article className="h-full flex flex-col rounded-3xl border border-line bg-surface overflow-hidden">
      <PreviewBlock project={project} className="min-h-[220px] md:min-h-0 md:flex-1 aspect-[16/10] md:aspect-auto" />
      <div className="p-6 md:p-7 flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-2xl font-semibold text-ink">{project.title}</h3>
          <StatusPills status={project.status} tone={project.statusTone} />
        </div>
        <p className="text-muted text-sm leading-relaxed">{project.desc}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {project.liveUrl && <PillButton href={project.liveUrl}>Live</PillButton>}
          {project.caseStudy && <PillButton to={`/projects/${project.slug}`}>Case study</PillButton>}
        </div>
      </div>
    </article>
  )
}

function StackCard({ project }) {
  return (
    <article className="flex flex-col rounded-3xl border border-line bg-surface overflow-hidden h-full">
      <PreviewBlock project={project} className="aspect-[16/9] min-h-[120px]" />
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-ink">{project.title}</h3>
          <StatusPills status={project.status} tone={project.statusTone} />
        </div>
        <p className="text-muted text-sm leading-relaxed flex-1">{project.desc}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {project.liveUrl && <PillButton href={project.liveUrl}>Live</PillButton>}
          {project.repoUrl && <PillButton href={project.repoUrl}>Code</PillButton>}
        </div>
      </div>
    </article>
  )
}

function CompactCard({ project }) {
  return (
    <article className="rounded-3xl border border-line bg-surface overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
        <PreviewBlock
          project={project}
          className="w-full sm:w-28 h-28 rounded-2xl shrink-0 overflow-hidden relative"
        />
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="font-display text-lg font-semibold text-ink">{project.title}</h3>
              <StatusPills status={project.status} tone={project.statusTone} />
            </div>
            <p className="text-muted text-sm leading-relaxed mt-1.5">{project.desc}</p>
          </div>
          {project.repoUrl && <PillButton href={project.repoUrl}>Code</PillButton>}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const featured = PROJECTS.find((p) => p.layout === 'featured')
  const stacked = PROJECTS.filter((p) => p.layout === 'stack')
  const compact = PROJECTS.filter((p) => p.layout === 'compact')

  return (
    <section id="projects" className="pb-20 md:pb-28">
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
          {compact.map((project) => (
            <motion.div key={project.slug} {...fadeUp(0.22)} className="lg:col-span-3">
              <CompactCard project={project} />
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
            className="text-sm text-amber hover:text-ink transition-colors shrink-0"
          >
            More →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
