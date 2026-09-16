import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PROJECTS, SIM_RACING } from '../data/content'
import { fadeUp } from '../lib/motion'

const SERIES_BADGES = SIM_RACING
  .filter((series) => series.logo)
  .sort((a, b) => parseInt(a.dates[0], 10) - parseInt(b.dates[0], 10))

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

function UrlBar({ label }) {
  return (
    <div className="w-full border border-white/25 bg-page/90 p-2.5 preview-frame">
      <div className="flex gap-1 mb-2" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-line" />
        <span className="w-1.5 h-1.5 rounded-full bg-line" />
        <span className="w-1.5 h-1.5 rounded-full bg-line" />
      </div>
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-navy">
        {label}
      </p>
    </div>
  )
}

function PreviewBlock({ project }) {
  if (project.previewImage) {
    return (
      <div className="aspect-[16/9] overflow-hidden border border-line bg-raised">
        <img
          src={project.previewImage}
          alt={`${project.title} website preview`}
          loading="lazy"
          decoding="async"
          className="project-thumb h-full w-full object-cover object-top"
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
      <UrlBar label={project.previewLabel} />
    </div>
  )
}

function ProjectCard({ project }) {
  const target = cardTarget(project)
  const className = 'project-card group block h-full p-2.5 md:p-3 transition-colors'
  const inner = (
    <>
      <div className="overflow-hidden">
        <PreviewBlock project={project} />
      </div>
      <div className="px-0.5 pt-2.5 pb-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-mono text-[15px] md:text-base font-semibold text-ink">
            {project.title}
          </h3>
          <span className="flex shrink-0 items-center gap-1.5 self-center text-dim transition-colors group-hover:text-ink">
            {project.previewLabel && (
              <span className="hidden lg:inline font-mono text-[11px] lowercase">
                {project.previewLabel}
              </span>
            )}
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </span>
        </div>
        <p className="mt-1.5 font-mono text-[11px] md:text-xs leading-snug text-muted">
          {project.desc}
        </p>
        {project.stack && (
          <p className="mt-2 font-mono text-[11px] tracking-[0.04em] text-dim">
            {project.stack.map((tech, i) => (
              <Fragment key={tech}>
                {i > 0 && <span className="timeline-sep">/</span>}
                {tech}
              </Fragment>
            ))}
          </p>
        )}
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
          <motion.h2
            {...fadeUp(0)}
            className="font-dot font-black text-[17px] tracking-[0.14em] uppercase text-muted mb-6"
          >
            Projects
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROJECTS.map((project, index) => (
              <motion.div key={project.slug} {...fadeUp(0.05 + index * 0.06)}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.2)} className="mt-10 pt-6 border-t border-dotted border-line">
            <Link
              to="/sim-racing"
              className="group flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
            >
              <div className="min-w-0 flex-1">
                <p className="font-dot font-black text-[14px] tracking-[0.14em] uppercase text-dim">
                  Sim racing
                </p>
                <p className="mt-2 max-w-[30rem] font-mono text-sm leading-relaxed text-muted">
                  Racing since 2012, from the ENASCAR Coca-Cola Series to representing CSU Fullerton in
                  the collegiate championship.
                </p>
                <p className="mt-3 font-mono text-sm text-accent transition-colors group-hover:text-ink">
                  More <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {SERIES_BADGES.map((series) => (
                  <img
                    key={series.slug}
                    src={series.logo}
                    alt={`${series.title} logo`}
                    loading="lazy"
                    decoding="async"
                    className="series-badge series-badge--home"
                  />
                ))}
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
