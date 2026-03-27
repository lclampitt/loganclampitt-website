import { motion } from 'framer-motion'

const heroImg = '/LC_012.png'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut', delay },
})

export default function Hero() {
  const handleScroll = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]"
    >
      {/* Full-bleed background photo */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Logan Clampitt"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'right center' }}
        />
        {/* Left-side text-safe gradient — fades the dark bokeh area to pure black */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0.65) 38%, rgba(8,8,8,0.15) 65%, rgba(8,8,8,0) 100%)',
          }}
        />
        {/* Bottom fade into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            background: 'linear-gradient(to top, #080808 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Text content — sits over the dark blurry left of the photo */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-lg">
          {/* Label */}
          <motion.p
            {...fadeUp(0)}
            className="text-[#4F46E5] text-sm font-semibold tracking-widest uppercase mb-4"
          >
            Developer&nbsp;&nbsp;|&nbsp;&nbsp;Sim Racer
          </motion.p>

          {/* Heading */}
          <motion.h1
            {...fadeUp(0.15)}
            className="text-6xl md:text-7xl font-black leading-tight mb-4"
          >
            <span className="text-[#4F46E5]">Logan</span>
            <br />
            <span className="text-white">Clampitt</span>
          </motion.h1>

          {/* CTA Buttons */}
          <motion.div {...fadeUp(0.45)} className="flex flex-wrap gap-4">
            <button
              onClick={() => handleScroll('projects')}
              className="px-7 py-3 bg-[#4F46E5] text-white text-sm font-semibold rounded-lg
                         border border-[#4F46E5] transition-all duration-200
                         hover:bg-transparent hover:text-[#4F46E5]"
            >
              View My Work
            </button>
            <button
              onClick={() => handleScroll('contact')}
              className="px-7 py-3 bg-transparent text-white text-sm font-semibold rounded-lg
                         border border-white/25 transition-all duration-200
                         hover:border-[#4F46E5] hover:text-[#4F46E5]"
            >
              Contact Me
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-0.5 h-6 bg-gradient-to-b from-[#4F46E5] to-transparent rounded"
        />
      </motion.div>
    </section>
  )
}
