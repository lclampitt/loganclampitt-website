import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = ['Skills', 'Applied Experience', 'Education']

const SKILLS = [
  { name: 'JavaScript / React', desc: 'Modern front-end development with reusable components' },
  { name: 'HTML / CSS', desc: 'Responsive layouts, animations, and UI polish' },
  { name: 'Python / C++', desc: 'Algorithms, data structures, and problem solving' },
  { name: 'UI / UX Design', desc: 'Clean interfaces with a focus on usability and clarity' },
]

const EXPERIENCE = [
  {
    role: 'Applied Software Development',
    company: '',
    period: '2023 – Present',
    desc: 'Built and shipped multiple front-end and full-stack projects using React, JavaScript, and modern web tooling. Focused on clean UI, maintainable components, and real-world usability.',
  },
  {
    role: 'Academic & Personal Projects (CSUF)',
    company: '',
    period: '2022 – 2025',
    desc: 'Applied classroom concepts from computer science coursework to hands-on projects involving algorithms, AI concepts, and interactive applications.',
  },
  {
    role: 'Professional Sim Racing (iRacing)',
    company: '',
    period: '2015 – Present',
    desc: 'Competed nationally for over 8 years, developing strong decision-making, adaptability, and performance under pressure — skills directly transferable to engineering environments.',
  },
]

const EDUCATION = [
  {
    degree: 'General Education, Transfer Pathway',
    school: 'Saddleback Community College',
    period: '2018 – 2020',
    desc: '',
  },
  {
    degree: 'Computer Science Coursework',
    school: 'Saddleback Community College',
    period: '2022 – 2023',
    desc: '',
  },
  {
    degree: 'Bachelor of Science in Computer Science',
    school: 'California State University Fullerton',
    period: '2023 – 2025',
    desc: '',
  },
]

const tabContent = {
  Skills: (
    <div className="flex flex-col gap-5 mt-4">
      {SKILLS.map((skill, i) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
        >
          <p className="text-[#4F46E5] text-sm font-medium mb-0.5">{skill.name}</p>
          <p className="text-white/70 text-sm">{skill.desc}</p>
        </motion.div>
      ))}
    </div>
  ),
  'Applied Experience': (
    <div className="flex flex-col gap-6 mt-4">
      {EXPERIENCE.map((exp, i) => (
        <motion.div
          key={exp.role}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
          className="border-l-2 border-[#4F46E5] pl-4"
        >
          <p className="text-white font-semibold text-sm">{exp.role}</p>
          <p className="text-[#4F46E5] text-xs font-medium mt-0.5">{exp.period}</p>
          <p className="text-white/50 text-sm mt-1.5 leading-relaxed">{exp.desc}</p>
        </motion.div>
      ))}
    </div>
  ),
  Education: (
    <div className="flex flex-col gap-6 mt-4">
      {EDUCATION.map((edu, i) => (
        <motion.div
          key={edu.degree}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
          className="border-l-2 border-[#4F46E5] pl-4"
        >
          <p className="text-white font-semibold text-sm">{edu.degree}</p>
          <p className="text-[#4F46E5] text-xs font-medium mt-0.5">{edu.school} · {edu.period}</p>
        </motion.div>
      ))}
    </div>
  ),
}

export default function About() {
  const [activeTab, setActiveTab] = useState('Skills')

  return (
    <section id="about" className="py-28 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-[#4F46E5] text-xs font-semibold tracking-widest uppercase mb-3"
        >
          About Me
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
          className="text-3xl md:text-4xl font-black text-white mb-16"
        >
          Who I Am
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Photo only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="relative aspect-[3/4]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'url("/LC_013 (1).png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top',
                }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,    #080808 0%, transparent 25%)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #080808 0%, transparent 20%)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,  #080808 0%, transparent 20%)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to left,   #080808 0%, transparent 20%)' }} />
            </div>
          </motion.div>

          {/* Right: Bio + Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Bio */}
            <p className="text-white/70 text-base leading-relaxed mb-5">
              Hi, my name is Logan Clampitt, a Computer Science graduate from California State University Fullerton. I've been passionate about computers and programming from a young age, and I enjoy building clean, functional software while continuously improving my skills as a developer.
            </p>
            <p className="text-white/70 text-base leading-relaxed mb-10">
              Outside of coding, I have a strong interest in graphic design, video editing, and sim racing, where I've competed professionally for over 8 years. Racing has taught me discipline and focus that I apply to both my career and academics.
            </p>

            {/* Tab buttons */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-[#4F46E5] text-white shadow-lg'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {tabContent[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
