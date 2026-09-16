import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PROJECT_DETAILS } from '../data/content'
import { GitHubIcon } from '../components/icons'

export default function ProjectDetail() {
  const { slug } = useParams()
  const data = PROJECT_DETAILS[slug]

  if (!data) {
    return (
      <main className="min-h-screen pt-28 pb-32 px-5">
        <div className="mx-auto max-w-3xl">
          <Link to="/#projects" className="text-sm text-muted hover:text-ink">← Back to projects</Link>
          <h1 className="font-display text-3xl mt-8">Project not found</h1>
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
      className="min-h-screen pt-28 pb-32"
    >
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Link to="/#projects" className="text-sm text-muted hover:text-ink transition-colors">
          ← Back to projects
        </Link>

        <div className="mt-8 rounded-3xl border border-line bg-surface p-6 md:p-8">
          {data.tag && (
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">{data.tag}</p>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">{data.title}</h1>
          <p className="mt-5 text-muted leading-relaxed">{data.description}</p>

          {data.tags && (
            <div className="mt-6 flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {data.whatItDoes && (
            <>
              <div className="border-t border-line my-7" />
              <p className="text-ink font-medium text-sm mb-3">What it covers</p>
              <ul className="flex flex-col gap-2.5">
                {data.whatItDoes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="flex flex-wrap gap-3 mt-8">
            {data.externalUrl && (
              <a
                href={data.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ink text-page px-5 py-2.5 text-sm font-medium hover:bg-white transition-colors"
              >
                Visit live site
              </a>
            )}
            {data.demoUrl && (
              <a
                href={data.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink/20 px-5 py-2.5 text-sm hover:border-ink/50 transition-colors"
              >
                Watch demo
              </a>
            )}
            {data.repoUrl && (
              <a
                href={data.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm hover:border-ink/50 transition-colors"
              >
                <GitHubIcon className="w-4 h-4" />
                View repo
              </a>
            )}
          </div>
        </div>

        {data.previewImage && (
          <div className="mt-6 rounded-3xl overflow-hidden border border-line">
            <img src={data.previewImage} alt={`${data.title} preview`} className="w-full h-auto" />
          </div>
        )}

        {data.previewUrl && (
          <div className="mt-6 w-full h-[560px] rounded-3xl overflow-hidden border border-line bg-raised">
            <iframe src={data.previewUrl} title={data.title} className="w-full h-full border-0" />
          </div>
        )}
      </div>
    </motion.main>
  )
}
