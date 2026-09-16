import { Fragment } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PROJECT_DETAILS } from '../data/content'
import { GitHubIcon } from '../components/icons'

const backLink = 'font-mono text-[13px] text-muted hover:text-ink transition-colors'

export default function ProjectDetail() {
  const { slug } = useParams()
  const data = PROJECT_DETAILS[slug]

  if (!data) {
    return (
      <main className="min-h-screen pt-12 md:pt-16 pb-32">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Link to="/#projects" className={backLink}>← Back home</Link>
          <h1 className="mt-10 font-dot font-black text-[2rem] leading-none tracking-[0.04em] uppercase text-ink">
            Not found
          </h1>
        </div>
      </main>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen pt-12 md:pt-16 pb-32"
    >
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <Link to="/#projects" className={backLink}>
          ← Back home
        </Link>

        <div className="project-card mt-8 p-6 md:p-8">
          {data.tag && (
            <p className="font-dot font-black text-[14px] tracking-[0.14em] uppercase text-muted">{data.tag}</p>
          )}
          <h1 className="mt-3 font-mono text-3xl md:text-4xl font-semibold text-ink">{data.title}</h1>
          <p className="mt-5 max-w-[46rem] font-mono text-[13px] md:text-sm leading-relaxed text-muted">
            {data.description}
          </p>

          {data.tags && (
            <p className="mt-5 font-mono text-[12px] tracking-[0.04em] text-dim">
              {data.tags.map((tag, i) => (
                <Fragment key={tag}>
                  {i > 0 && <span className="timeline-sep">/</span>}
                  {tag}
                </Fragment>
              ))}
            </p>
          )}

          {data.whatItDoes && (
            <>
              <div className="my-7 border-t border-dashed border-line" />
              <p className="mb-4 font-dot font-black text-[14px] tracking-[0.14em] uppercase text-muted">
                What it covers
              </p>
              <ul className="flex flex-col gap-3">
                {data.whatItDoes.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-mono text-[13px] leading-relaxed text-muted">
                    <span className="spec-tick mt-[7px] shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-2.5">
            {data.externalUrl && (
              <a href={data.externalUrl} target="_blank" rel="noopener noreferrer" className="soft-pill">
                Visit live site
              </a>
            )}
            {data.demoUrl && (
              <a href={data.demoUrl} target="_blank" rel="noopener noreferrer" className="soft-pill">
                Watch demo
              </a>
            )}
            {data.repoUrl && (
              <a href={data.repoUrl} target="_blank" rel="noopener noreferrer" className="soft-pill">
                <GitHubIcon />
                View repo
              </a>
            )}
          </div>
        </div>

        {data.previewImage && (
          <div className="mt-4 overflow-hidden border border-line">
            <img src={data.previewImage} alt={`${data.title} preview`} className="w-full h-auto" />
          </div>
        )}

        {data.previewUrl && (
          <div className="mt-4 h-[560px] w-full overflow-hidden border border-line bg-raised">
            <iframe src={data.previewUrl} title={data.title} className="h-full w-full border-0" />
          </div>
        )}
      </div>
    </motion.main>
  )
}
