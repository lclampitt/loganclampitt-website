import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SIM_RACING, SIM_RACING_PRESS, SIM_RACING_SPONSORS, SIM_RACING_STATS, SIM_RACING_TEAMS } from '../data/content'
import { fadeUp } from '../lib/motion'

const SERIES = SIM_RACING
  .filter((series) => series.logo)
  .sort((a, b) => parseInt(a.dates[0], 10) - parseInt(b.dates[0], 10))

const HIGHLIGHTS = SERIES.flatMap((series) => series.videos.map((video) => ({
  ...video,
  series: series.title.replace('ENASCAR ', '').replace(' iRacing Series', ''),
  youtubeId: video.embedUrl.match(/embed\/([^?]+)/)[1],
})))

function MutedLogo({ item, className }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <img
      src={item.logo}
      alt={`${item.name} logo`}
      decoding="async"
      onError={() => setFailed(true)}
      style={item.maxHeight ? { maxHeight: `calc(var(--logo-h) * ${item.maxHeight / 44})` } : undefined}
      className={`muted-logo${item.treatment === 'silhouette' ? ' muted-logo--silhouette' : ''} ${className}`}
    />
  )
}

function Highlight({ video, index }) {
  const [playing, setPlaying] = useState(false)
  const number = String(index + 1).padStart(2, '0')

  return (
    <li>
      <div className="sim-hl-frame">
        {playing ? (
          <iframe
            src={`${video.embedUrl}&autoplay=1`}
            title={`${video.track} ${video.season}, ${video.result}`}
            className="sim-hl-media"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="sim-hl-button"
            aria-label={`Play ${video.track} ${video.season}, ${video.result}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className="sim-hl-media sim-hl-thumb"
            />
            <span className="sim-hl-play" aria-hidden="true">
              <svg viewBox="0 0 16 16"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor" /></svg>
            </span>
          </button>
        )}
      </div>
      <p className="sim-hl-caption">
        <span>{video.track} · {video.season}</span>
        <span className="sim-hl-num">{number}</span>
      </p>
      <p className="sim-hl-result">
        {video.result}
        <span className="sim-hl-series"> · {video.series}</span>
      </p>
    </li>
  )
}

function ExternalArrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="sim-press-arrow">
      <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function Press() {
  const { featured, articles, more } = SIM_RACING_PRESS

  return (
    <motion.section {...fadeUp(0.1)} aria-labelledby="press-title">
      <h2 id="press-title" className="sim-label">Press</h2>
      <div className="sim-press">
        <a href={featured.url} target="_blank" rel="noopener noreferrer" className="sim-press-featured group">
          <img src={featured.image} alt="" loading="lazy" decoding="async" className="sim-press-image" />
          <div className="min-w-0">
            <p className="sim-press-outlet">{featured.outlet}</p>
            <p className="sim-press-headline">
              <span className="underline-offset-4 group-hover:underline group-hover:decoration-dashed">{featured.title}</span>
              <ExternalArrow />
            </p>
            <p className="sim-press-note">{featured.note}</p>
          </div>
        </a>

        <div className="min-w-0">
          <ul className="sim-press-list">
            {articles.map((article) => (
              <li key={article.url}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="sim-press-row group">
                  <span className="sim-press-date">{article.date}</span>
                  <span className="sim-press-title">
                    <span className="underline-offset-4 group-hover:underline group-hover:decoration-dashed">{article.title}</span>
                  </span>
                  <span className="sim-press-source">
                    {article.outlet}
                    <ExternalArrow />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="sim-press-more">
            More from{' '}
            {more.map((source, i) => (
              <span key={source.url}>
                {i > 0 && ' · '}
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">
                  {source.outlet}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </motion.section>
  )
}

function LogoRow({ id, title, items, delay, className }) {
  return (
    <motion.section {...fadeUp(delay)} className={className} aria-labelledby={id}>
      <h2 id={id} className="sim-label">{title}</h2>
      <ul className="sim-logos">
        {items.map((item) => (
          <li key={item.name} className="sim-logo muted-hover">
            <div className="sim-logo-frame">
              <MutedLogo item={item} className="sim-logo-img" />
            </div>
            <p className="sim-logo-name">{item.name}</p>
            {item.years && <p className="sim-logo-years">{item.years}</p>}
          </li>
        ))}
      </ul>
    </motion.section>
  )
}

export default function SimRacingIndex() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-12 md:pt-16 pb-28 lg:pb-0"
    >
      <div className="px-5 md:px-8">
        <div className="sim-page">
          <Link to="/" className="self-start font-mono text-[13px] text-muted hover:text-ink transition-colors">
            ← Back home
          </Link>

          <div className="sim-rows">
            <motion.div {...fadeUp(0)} className="sim-head">
              <h1 className="sim-title">Sim racing</h1>
              <dl className="sim-stats">
                {SIM_RACING_STATS.map((stat) => (
                  <div key={stat.label} className="sim-stat">
                    <dt className="sim-stat-label">{stat.label}</dt>
                    <dd className="sim-stat-value">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <motion.section {...fadeUp(0.06)} aria-labelledby="series-title">
              <h2 id="series-title" className="sim-label">Series</h2>
              <div className="sim-series-grid">
                {SERIES.map((series) => (
                  <div key={series.slug} className="sim-series-card muted-hover">
                    <MutedLogo item={{ name: series.title, logo: series.logo }} className="sim-series-badge" />
                    <div className="min-w-0">
                      <p className="sim-name">{series.title}</p>
                      <p className="sim-years">{series.dates.join(' · ')}</p>
                      <p className="sim-desc">
                        {series.highlight.map((part) => (part.strong
                          ? <strong key={part.text} className="font-semibold text-ink">{part.text}</strong>
                          : <span key={part.text}>{part.text}</span>))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section {...fadeUp(0.08)} aria-labelledby="highlights-title">
              <h2 id="highlights-title" className="sim-label">Highlights</h2>
              <ul className="sim-highlights">
                {HIGHLIGHTS.map((video, index) => (
                  <Highlight key={video.youtubeId} video={video} index={index} />
                ))}
              </ul>
            </motion.section>

            <Press />

            <div className="sim-band">
              <LogoRow id="teams-title" title="Teams" items={SIM_RACING_TEAMS} delay={0.12} />
              <LogoRow id="sponsors-title" title="Sponsors" items={SIM_RACING_SPONSORS} delay={0.18} />
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  )
}
