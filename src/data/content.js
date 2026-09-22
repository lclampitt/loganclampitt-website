export const LINKS = {
  github: 'https://github.com/lclampitt',
  githubHandle: 'lclampitt',
  linkedin: 'https://www.linkedin.com/in/loganclampitt/',
  linkedinHandle: 'loganclampitt',
  resume: '/Logan-Clampitt-Resume.pdf',
  email: 'lclampitt44@outlook.com',
  ctRealty: 'https://www.whiteoakswilton.com/',
}

export const FORMSPREE_ID = 'mdapkror'

export const PROJECTS = [
  {
    slug: 'ct-realty-trust',
    title: 'White Oaks at Wilton',
    previewLabel: 'WHITEOAKSWILTON.COM',
    previewImage: '/previews/whiteoakswilton.jpg',
    status: [],
    statusTone: 'accent',
    previewKind: 'ocean',
    desc: 'Leasing site and operator console for CT Realty Trust, with self-built analytics.',
    stack: ['Next.js', 'TypeScript', 'FastAPI', 'Supabase'],
    layout: 'featured',
    liveUrl: LINKS.ctRealty,
    caseStudy: true,
    repoUrl: null,
  },
]

export const PROJECT_DETAILS = {
  'ct-realty-trust': {
    title: 'White Oaks at Wilton',
    tag: 'Work · CT Realty Trust',
    description:
      'White Oaks is a white-label property management platform I built as the primary developer: a public leasing site and a separate operator console, sharing a FastAPI backend on Supabase. Rather than depend on the client\'s existing analytics warehouse, I built the full collection pipeline myself, a first-party JavaScript collector handling identity, attribution, and channel classification, feeding a Postgres store the console reads live. It integrates Rent Manager for property data and automated lead intake, and Resend for authenticated transactional email, all deployed across Vercel and Render.',
    tags: ['Leasing site', 'Operator console', 'First-party analytics'],
    whatItDoes: [
      'Two Next.js apps backed by a FastAPI + Supabase (Postgres) service, deployed across Vercel and Render.',
      'First-party analytics pipeline built from scratch: cookie-based identity, first/last-touch attribution, channel classification, and bot filtering.',
      'Rent Manager integration for live unit and pricing data and automated prospect creation, with circuit-breaker and single-flight caching.',
      'Transactional email on Resend with full domain authentication (SPF/DKIM/DMARC).',
      'Privacy and Fair Housing-compliant data handling, audited against WCAG 2.1 AA.',
    ],
    tech: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'FastAPI', 'Supabase', 'Vercel', 'Render'],
    externalUrl: LINKS.ctRealty,
    previewUrl: LINKS.ctRealty,
  },
}

export const EXPERIENCE = [
  {
    title: 'CT Realty Trust',
    role: 'Software Developer',
    current: true,
    dates: 'Present',
    desc: 'Software developer at a multifamily and build to rent investment firm. Contributed heavily to the public site (whiteoakswilton.com), including marketing pages and portfolio presentation.',
  },
  {
    title: 'Proprietary Trader',
    role: 'Independent',
    dates: '2024 — Present',
    desc: 'Applied data analysis, probability, and risk management principles to futures trading. Tracked performance metrics, drawdowns, and rule adherence, resulting in successful funded account payouts.',
  },
  {
    title: 'Independent / Freelance',
    role: 'Builder',
    dates: '2023 — Present',
    desc: 'Shipped client and personal products end to end, from portfolio systems to full stack experiments.',
  },
  {
    title: 'BS Computer Science',
    role: 'CSU Fullerton',
    dates: '2022 — 2025',
    desc: 'Bachelor of Science in Computer Science. Graduated fall 2025.',
  },
]


export const SIM_RACING_STATS = [
  { value: '2012', label: 'Racing since' },
  { value: '2', label: 'College titles' },
  { value: '3', label: 'Coca-Cola wins' },
  { value: '$120K+', label: 'Career earnings' },
]

export const SIM_RACING_TEAMS = [
  { name: 'Burton Kligerman eSports', years: '2019 — 2020', logo: '/logos/burton-kligerman-esports.png' },
  { name: 'William Byron Esports', years: '2021 — 2022', logo: '/logos/william-byron-esports.png', treatment: 'silhouette' },
  { name: 'eRacr', years: '2025', logo: '/logos/eracr.png', maxHeight: 40 },
]

export const SIM_RACING_SPONSORS = [
  { name: 'Logitech G', logo: '/logos/logitech-g.png' },
  { name: 'Valvoline', logo: '/logos/valvoline.png' },
  { name: 'SteadyMD', logo: '/logos/steadymd.png' },
  { name: 'NASCAR on NBCSN', logo: '/logos/nascar-nbcsn.png' },
]

export const SIM_RACING_PRESS = {
  featured: {
    outlet: 'Titan Magazine',
    note: 'Cal State Fullerton · Fall/Winter 2024',
    title: 'A Champion on the iRacing Circuit',
    image: '/press/titan-trophy.jpg',
    url: 'https://titanmag.fullerton.edu/fall-winter-2024/a-champion-on-the-iracing-circuit/',
  },
  articles: [
    {
      outlet: 'iRacing',
      date: '2026.04',
      title: 'Sunset Splash win to close out college',
      url: 'https://www.iracing.com/enascar-college-iracing-series-calgarys-yeroschak-clinches-25-26-title-cal-state-fullertons-clampitt-closes-book-with-sunset-splash-win/',
    },
    {
      outlet: 'iRacing',
      date: '2025.04',
      title: 'Claims the 2024–25 eNASCAR College title',
      url: 'https://www.iracing.com/california-state-university-fullertons-logan-clampitt-claims-2024-25-enascar-college-iracing-series-title/',
    },
    {
      outlet: 'iRacing',
      date: '2024.10',
      title: 'Wins in an overtime finish at Kansas',
      url: 'https://www.iracing.com/cal-state-fullertons-logan-clampitt-claims-enascar-college-iracing-series-victory-in-ot-finish-at-kansas/',
    },
    {
      outlet: 'RACER',
      date: '2022.05',
      title: 'Preparing to wind down his iRacing career',
      url: 'https://racer.com/2022/05/26/clampitt-preparing-to-wind-down-iracing-career/',
    },
    {
      outlet: 'RACER',
      date: '2019.07',
      title: 'Goes from iRacing to a real MX-5 Cup car',
      url: 'https://racer.com/2019/07/06/get-real-logan-clampitt-goes-from-iracing-to-an-mx-5-cup-car/',
    },
  ],
  more: [
    { outlet: 'iRacing', url: 'https://www.iracing.com/tag/logan-clampitt/' },
    { outlet: 'RACER', url: 'https://racer.com/tag/logan%20clampitt' },
  ],
}

export const SIM_RACING = [
  {
    slug: 'enascar-college',
    title: 'ENASCAR College iRacing Series',
    logo: '/logos/enascar-college.png',
    dates: ['2022 — 2026'],
    highlight: [
      { text: 'Represented CSU Fullerton. ' },
      { text: '2 championships', strong: true },
      { text: ' and ' },
      { text: '$50K+', strong: true },
      { text: ' in earnings.' },
    ],
    videos: [
      { track: 'Kansas', season: '2024–25', result: 'Win', embedUrl: 'https://www.youtube.com/embed/AzTAJeDYieA?start=5366' },
      { track: 'Homestead', season: '2024–25', result: 'Championship', embedUrl: 'https://www.youtube.com/embed/QZLY9Q3jsjE?start=4629' },
    ],
  },
  {
    slug: 'enascar-coca-cola',
    title: 'ENASCAR Coca-Cola iRacing Series',
    logo: '/logos/enascar-coca-cola.png',
    dates: ['2016 — 2022', '2025'],
    highlight: [
      { text: 'The top level of NASCAR-sanctioned sim racing. ' },
      { text: '3 wins', strong: true },
      { text: ', ' },
      { text: '2 runner-up', strong: true },
      { text: ' championship finishes, and ' },
      { text: '$70K+', strong: true },
      { text: ' in earnings.' },
    ],
    videos: [
      { track: 'Atlanta', season: '2021', result: 'Win', embedUrl: 'https://www.youtube.com/embed/8W9mW6Bb33Q?start=7645' },
      { track: 'Texas', season: '2021', result: 'Championship 4', embedUrl: 'https://www.youtube.com/embed/e0XrzIcBf8o?start=2134' },
    ],
  },
]

export const ABOUT_SPEC = [
  { label: 'Focus', items: ['Web', 'Full stack', 'iOS'] },
  { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Swift'] },
  { label: 'Frontend', items: ['React', 'Next.js', 'Tailwind', 'CSS', 'Motion'] },
  { label: 'Backend', items: ['FastAPI', 'Supabase', 'Stripe'] },
  { label: 'Mobile', items: ['SwiftUI', 'watchOS'] },
  { label: 'AI', items: ['Claude Code', 'Cursor', 'Claude API', 'MCP'] },
  { label: 'Tools', items: ['Git', 'Vercel', 'Figma'] },
]
