import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/content'
import { fadeUp } from '../lib/motion'

function cardTarget(project) {
  if (project.liveUrl) {
    return { href: project.liveUrl, external: true }
  }
  if (project.caseStudy) {
    return { to: `/projects/${project.slug}`, external: false }
  }
  if (project.repoUrl) {
    return { href: project.repoUrl, external: true }
  }
  return { to: `/projects/${project.slug}`, external: false }
}

function PreviewBlock({ project }) {
  if (project.previewImage) {
    return (
      <div className="aspect-[16/10] overflow-hidden bg-raised">
        <img
          src={project.previewImage}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  if (project.previewKind === 'text-first') {
    return (
      <div className="preview-hatch aspect-[16/10] flex items-center justify-center px-4">
        <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
          No screenshot · text first
        </span>
      </div>
    )
  }

  if (project.previewKind === 'grid') {
    return (
      <div className="aspect-[16/10] bg-navy p-5 md:p-6 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] border border-foam/25 bg-page/10"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="preview-ocean aspect-[16/10] p-5 md:p-7 flex items-end">
      <div className="w-full border border-white/25 bg-page/90 p-3 shadow-bar">
        <div className="flex gap-1.5 mb-3" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-line" />
          <span className="w-1.5 h-1.5 rounded-full bg-line" />
          <span className="w-1.5 h-1.5 rounded-full bg-line" />
        </div>
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-navy">
          {project.previewLabel}
        </p>
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  const target = cardTarget(project)
  const className = 'box-dotted block h-full transition-colors hover:border-ink/40'
  const inner = (
    <>
      <PreviewBlock project={project} />
      <div className="p-4 md:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg md:text-xl font-semibold text-ink">
            {project.title}
          </h3>
          {project.meta ? (
            <span className="inline-flex items-center gap-1.5 shrink-0 font-mono text-[11px] text-muted">
              <span
                className={`w-1.5 h-1.5 rounded-full ${project.meta === 'Capstone' ? 'bg-foam' : 'bg-accent'}`}
                aria-hidden="true"
              />
              {project.meta}
            </span>
          ) : null}
        </div>
        <p className="mt-2 font-mono text-xs md:text-[13px] leading-relaxed text-muted">
          {project.desc}
        </p>
      </div>
    </>
  )

  if (target.external) {
    return (
      <a
        href={target.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link to={target.to} className={className}>
      {inner}
    </Link>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="pt-6 md:pt-8 pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.p {...fadeUp(0)} className="text-muted text-sm md:text-base mb-8">
          Still not sure? Check out my{' '}
          <span className="font-display font-semibold text-ink">Projects</span>
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {PROJECTS.map((project, index) => (
            <motion.div key={project.slug} {...fadeUp(0.05 + index * 0.06)}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp(0.2)}
          className="mt-10 pt-6 border-t border-dotted border-line flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8"
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
