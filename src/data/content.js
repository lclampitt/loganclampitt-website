export const LINKS = {
  github: 'https://github.com/lclampitt',
  githubHandle: 'lclampitt',
  linkedin: 'https://www.linkedin.com/in/loganclampitt/',
  linkedinHandle: 'loganclampitt',
  resume: '/Resume - Logan Clampitt 2026.pdf',
  ctRealty: 'https://www.whiteoakswilton.com/',
  macrovault: 'https://www.macro-vault.com/',
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
  {
    slug: 'gainlytics',
    title: 'MacroVault',
    previewLabel: 'MACRO-VAULT.COM',
    previewImage: '/previews/macrovault.jpg',
    status: [],
    statusTone: 'accent',
    previewKind: 'text-first',
    desc: 'Fitness analytics capstone with dashboards, PRs, and AI insights. Solo build.',
    stack: ['React', 'Python', 'Chart.js'],
    layout: 'stack',
    liveUrl: LINKS.macrovault,
    caseStudy: true,
    repoUrl: 'https://github.com/lclampitt/gainlytics-v2',
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
  gainlytics: {
    title: 'MacroVault',
    tag: 'Capstone',
    description:
      'MacroVault is a full stack fitness analytics platform I built to track body metrics, training, and nutrition with clean dashboards and AI insights. It is designed to be simple, fast, and useful for everyday lifters. This was my senior capstone, and I worked on it solo.',
    tags: ['Dashboards and tracking', 'Workouts and PRs', 'AI insights'],
    whatItDoes: [
      'Log workouts, sets, and PRs with a streamlined UI.',
      'Track bodyweight and body fat over time using charts.',
      'Use AI to analyze trends and suggest goals and targets.',
      'Dark theme laid out for desktop and mobile.',
    ],
    tech: ['React', 'Python', 'Chart.js', 'REST API', 'CSS'],
    externalUrl: LINKS.macrovault,
    repoUrl: 'https://github.com/lclampitt/gainlytics-v2',
    previewUrl: LINKS.macrovault,
  },
}

export const EXPERIENCE = [
  {
    title: 'CT Realty Trust',
    role: 'Software Developer',
    current: true,
    dates: 'Present',
    desc: 'Software developer at a multifamily and build to rent investment firm. Contributed heavily to the public site (ctrealtytrust.com), including marketing pages and portfolio presentation.',
    stack: ['Web', 'Frontend', 'Full site', 'Real estate'],
  },
  {
    title: 'Independent / Freelance',
    role: 'Builder',
    dates: '2023 — Present',
    desc: 'Shipped client and personal products end to end, from portfolio systems to full stack experiments.',
    stack: ['React', 'JavaScript', 'Python', 'UX'],
  },
  {
    title: 'BS Computer Science',
    role: 'CSU Fullerton',
    dates: '2023 — 2025',
    desc: 'Senior capstone: MacroVault. Solo designed and shipped fitness analytics with dashboards and AI insights.',
    stack: ['Capstone', 'React', 'Python'],
  },
]


export const SIM_RACING = [
  {
    slug: 'enascar-college',
    title: 'ENASCAR College iRacing Series',
    subtitle: 'Collegiate championship',
    description:
      'In the ENASCAR College iRacing Series, I represented California State University Fullerton against top collegiate drivers across the country. I would wind up winning two championships and earning over $30,000 in scholarship winnings.',
    videos: [
      { title: 'ENASCAR College iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/AzTAJeDYieA?start=5366' },
      { title: 'ENASCAR College iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/QZLY9Q3jsjE?start=4629' },
    ],
  },
  {
    slug: 'enascar-coca-cola',
    title: 'ENASCAR Coca-Cola iRacing Series',
    subtitle: 'Premier ENASCAR series',
    description:
      'The ENASCAR Coca-Cola iRacing Series is the highest level of NASCAR sanctioned sim racing. I competed in the series since I was 15 years old for 8 years. Through my time in the series I was able to score 3 wins and two runner-up championship finishes.',
    videos: [
      { title: 'ENASCAR Coca-Cola iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/8W9mW6Bb33Q?start=7645' },
      { title: 'ENASCAR Coca-Cola iRacing Series', desc: '', embedUrl: 'https://www.youtube.com/embed/e0XrzIcBf8o?start=2134' },
    ],
  },
  {
    slug: 'other-experience',
    title: 'Other experience',
    subtitle: 'Track days and competitions',
    description:
      'Beyond headline series, I have spent years competing in leagues, special events, and even got to experience real world track days. These highlights feature accomplishments outside the main sim racing series.',
    videos: [
      { title: 'On-board hot lap', desc: 'On-board hot lap in a Mazda MX-5 Cup car at the Thermal Club.', embedUrl: 'https://www.youtube.com/embed/Mtd2OrcN2wU?start=742' },
      { title: 'Mazda Hot Lap Challenge finish', desc: 'The last lap of the Mazda Hot Lap Challenge.', embedUrl: 'https://www.youtube.com/embed/JYCm3LJToeQ?start=3302' },
    ],
  },
]

export const ABOUT_SPEC = [
  { label: 'Based', items: ['Southern California'] },
  { label: 'Focus', items: ['Web', 'Full stack', 'iOS'] },
  { label: 'Open to', items: ['Roles', 'Freelance'] },
  { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Swift'] },
  { label: 'Frontend', items: ['React', 'Next.js', 'Tailwind', 'CSS', 'Motion'] },
  { label: 'Backend', items: ['FastAPI', 'Supabase', 'Stripe'] },
  { label: 'Mobile', items: ['SwiftUI', 'watchOS'] },
  { label: 'AI', items: ['Claude Code', 'Cursor', 'Claude API', 'MCP'] },
  { label: 'Tools', items: ['Git', 'Vercel', 'Figma'] },
  { label: 'Other', items: ['Sim racing, 8+ years'] },
]
