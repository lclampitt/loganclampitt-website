import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const DETAIL_DATA = {
  'enascar-college': {
    title: 'ENASCAR College iRacing Series',
    subtitle: 'Collegiate Championship',
    description:
      "In the ENASCAR College iRacing Series, I represented California State University Fullerton against top collegiate drivers across the country. I would wind up winning two championships and earning over $30,000 in scholarship winnings.",
    highlights: [],
    videos: [
      { title: 'ENASCAR College iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/AzTAJeDYieA?start=5366' },
      { title: 'ENASCAR College iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/QZLY9Q3jsjE?start=4629' },
    ],
  },
  'enascar-coca-cola': {
    title: 'ENASCAR Coca-Cola iRacing Series',
    subtitle: 'Premier ENASCAR Series',
    description:
      "The ENASCAR Coca-Cola iRacing Series represents the highest level of NASCAR-sanctioned sim racing. I competed in the series since I was 15 years old for 8 years. Through my time in the series I was able to score 3 wins and two runner-up championship finishes.",
    highlights: [],
    videos: [
      { title: 'ENASCAR Coca-Cola iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/8W9mW6Bb33Q?start=7645' },
      { title: 'ENASCAR Coca-Cola iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/e0XrzIcBf8o?start=2134' },
    ],
  },
  'other-experience': {
    title: 'Other Experience',
    subtitle: 'Real World & Competitions',
    description:
      "Beyond headline series, I've spent years competing in leagues, special events, and even got to experience real-world track days. These highlights feature the great accomplishments that I've gotten to do outside of sim racing.",
    highlights: [],
    videos: [
      { title: 'On-Board Hot Lap', desc: 'Features an on-board hot lap in a Mazda MX-5 Cup car at the Thermal Club.', embedUrl: 'https://www.youtube.com/embed/Mtd2OrcN2wU?start=742' },
      { title: 'Mazda Hot Lap Challenge Finish', desc: 'Features the last lap of the Mazda Hot Lap Challenge.', embedUrl: 'https://www.youtube.com/embed/JYCm3LJToeQ?start=3302' },
    ],
  },
}

export default function SimRacingDetail() {
  const { slug } = useParams()
  const data = DETAIL_DATA[slug] || {
    title: 'Sim Racing',
    subtitle: 'Details coming soon.',
    description: 'More information about this topic will be added soon.',
    highlights: [],
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-[#080808] pt-24 pb-20"
    >
      <div className="max-w-5xl mx-auto px-6">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Link
            to="/#sim-racing"
            className="inline-flex items-center gap-2 text-white/40 hover:text-[#4F46E5] text-sm
                       transition-colors duration-200 mb-10"
          >
            <span>←</span> Back to Sim Racing
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
        >
          <p className="text-[#4F46E5] text-xs font-semibold tracking-widest uppercase mb-2">
            Sim Racing
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{data.title}</h1>
          <p className="text-white/40 text-lg mb-10">{data.subtitle}</p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="text-white/60 text-base leading-relaxed mb-10"
        >
          {data.description}
        </motion.p>

        {/* Videos */}
        {data.videos && data.videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {data.videos.map((video, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-full rounded-xl overflow-hidden border border-white/8 aspect-video">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{video.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{video.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </motion.div>
  )
}
