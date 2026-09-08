import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SIM_RACING } from '../data/content'

export default function SimRacingDetail() {
  const { slug } = useParams()
  const data = SIM_RACING.find((item) => item.slug === slug)

  if (!data) {
    return (
      <main className="min-h-screen pt-28 pb-32 px-5">
        <div className="mx-auto max-w-3xl">
          <Link to="/sim-racing" className="text-sm text-muted hover:text-ink">← Back to sim racing</Link>
          <h1 className="font-display text-3xl mt-8">Not found</h1>
        </div>
      </main>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-32"
    >
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Link to="/sim-racing" className="text-sm text-muted hover:text-ink transition-colors">
          ← Back to sim racing
        </Link>
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-dim mt-8">{data.subtitle}</p>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink mt-2">{data.title}</h1>
        <p className="mt-6 max-w-3xl text-muted leading-relaxed">{data.description}</p>

        {data.videos?.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            {data.videos.map((video, index) => (
              <div key={`${video.embedUrl}-${index}`}>
                <div className="overflow-hidden box-dotted aspect-video bg-raised">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm text-ink mt-3">{video.title}</p>
                {video.desc && <p className="text-xs text-dim mt-1">{video.desc}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.main>
  )
}
