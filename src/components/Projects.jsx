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
      <div className="aspect-[16/9] overflow-hidden bg-raised">
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
      <div className="preview-hatch aspect-[16/9] flex items-center justify-center px-3">
        <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
          No screenshot · text first
        </span>
      </div>
    )
  }

  if (project.previewKind === 'grid') {
    return (
      <div className="aspect-[16/9] bg-navy p-3 md:p-4 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-1.5 w-full max-w-[180px]">
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
    <div className="preview-ocean aspect-[16/9] p-3 md:p-4 flex items-end">
      <div className="w-full border border-white/25 bg-page/90 p-2.5">
        <div className="flex gap-1 mb-2" aria-hidden="true">
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
  const className = 'project-card block h-full p-2.5 md:p-3 transition-colors'
  const inner = (
    <>
      <div className="overflow-hidden">
        <PreviewBlock project={project} />
      </div>
      <div className="px-0.5 pt-2.5 pb-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-[15px] md:text-base font-semibold text-ink">
            {project.title}
          </h3>
          {project.meta ? (
            <span className="inline-flex items-center gap-1.5 shrink-0 font-mono text-[10px] md:text-[11px] text-muted">
              <span
                className={`w-1.5 h-1.5 rounded-full ${project.meta === 'Capstone' ? 'bg-foam' : 'bg-accent'}`}
                aria-hidden="true"
              />
              {project.meta}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 font-mono text-[11px] md:text-xs leading-snug text-muted">
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
        <div className="mx-auto w-full max-w-[52rem]">
          <motion.p {...fadeUp(0)} className="text-muted text-sm md:text-base mb-6">
            Still not sure? Check out my{' '}
            <span className="font-display font-semibold text-ink">Projects</span>
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>
    </section>
  )
}
