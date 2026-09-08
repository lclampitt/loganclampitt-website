export const LINKS = {
  github: 'https://github.com/lclampitt',
  githubHandle: 'lclampitt',
  linkedin: 'https://www.linkedin.com/in/loganclampitt/',
  linkedinHandle: 'loganclampitt',
  resume: '/Resume - Logan Clampitt 2026.pdf',
  ctRealty: 'https://www.ctrealtytrust.com/',
  macrovault: 'https://www.gainlytics.org/',
  socaldiecasts: 'https://www.socaldiecasts.com/',
}

export const FORMSPREE_ID = 'mdapkror'

export const PROJECTS = [
  {
    slug: 'ct-realty-trust',
    title: 'CT Realty Trust',
    previewLabel: 'CTREALTYTRUST.COM',
    previewImage: null,
    status: [],
    statusTone: 'amber',
    desc: 'Company website for a multifamily and build to rent investment firm. Contributed heavily to the public site as Software Developer, including marketing pages and portfolio presentation.',
    layout: 'featured',
    liveUrl: LINKS.ctRealty,
    caseStudy: true,
    repoUrl: null,
  },
  {
    slug: 'gainlytics',
    title: 'MacroVault',
    previewLabel: 'MACROVAULT',
    previewImage: null,
    status: [],
    statusTone: 'amber',
    desc: 'Fitness analytics capstone with dashboards, PRs, and AI insights. Solo build.',
    layout: 'stack',
    liveUrl: LINKS.macrovault,
    caseStudy: true,
    repoUrl: 'https://github.com/lclampitt/gainlytics-v2',
  },
  {
    slug: 'socaldiecasts',
    title: 'SoCalDiecasts',
    previewLabel: 'SOCALDIECASTS',
    previewImage: null,
    status: [],
    statusTone: 'amber',
    desc: 'Brand forward e-commerce for a diecast collectibles business.',
    layout: 'stack',
    liveUrl: LINKS.socaldiecasts,
    caseStudy: true,
    repoUrl: 'https://github.com/lclampitt/socaldiecasts',
  },
]

export const PROJECT_DETAILS = {
  'ct-realty-trust': {
    title: 'CT Realty Trust',
    tag: 'Work',
    description:
      'Company website for a multifamily and build to rent investment firm. I contribute as Software Developer on the public site, including marketing pages and portfolio presentation. This is company work, not a solo build of the entire site.',
    tags: ['Web', 'Frontend', 'Marketing pages', 'Portfolio presentation'],
    whatItDoes: [
      'Public marketing pages for the firm.',
      'Portfolio presentation on the public site.',
      'Ongoing contribution as Software Developer, not sole authorship of the whole site.',
    ],
    tech: ['Web', 'Frontend'],
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
  socaldiecasts: {
    title: 'SoCalDiecasts',
    tag: 'E-commerce',
    description:
      'An e-commerce website for a Southern California diecast collectibles business. Focused on product presentation, intuitive browsing, and a smooth purchase flow, with a brand forward look.',
    tags: ['E-commerce', 'Responsive design', 'Brand identity'],
    whatItDoes: [
      'Browse and filter a product catalog of diecast collectibles.',
      'Brand aligned visual design.',
      'Layout that works across screen sizes.',
      'Purchase flow focused on usability and speed.',
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'E-commerce'],
    externalUrl: LINKS.socaldiecasts,
    repoUrl: 'https://github.com/lclampitt/socaldiecasts',
    previewUrl: LINKS.socaldiecasts,
  },
}

export const EXPERIENCE = [
  {
    initials: 'CT',
    title: 'CT Realty Trust',
    role: 'Software Developer',
    badge: 'Current',
    dates: 'Present',
    desc: 'Software developer at a multifamily and build to rent investment firm. Contributed heavily to the public site (ctrealtytrust.com), including marketing pages and portfolio presentation.',
    chips: ['Web', 'Frontend', 'Full site', 'Real estate'],
  },
  {
    initials: 'LC',
    title: 'Independent / Freelance',
    role: 'Builder',
    badge: 'Builder',
    dates: '2023 to Present',
    desc: 'Shipped client and personal products end to end: SoCalDiecasts storefront, portfolio systems, and full stack experiments.',
    chips: ['React', 'JavaScript', 'Python', 'UX'],
  },
  {
    initials: 'CS',
    title: 'BS Computer Science',
    role: 'CSU Fullerton',
    badge: 'Grad',
    dates: '2023 to 2025',
    desc: 'Senior capstone: MacroVault. Solo designed and shipped fitness analytics with dashboards and AI insights.',
    chips: ['Capstone', 'React', 'Python'],
  },
]

export const SKILLS = [
  'JavaScript',
  'React',
  'Python',
  'HTML/CSS',
  'Tailwind',
  'UI/UX',
  'Motion',
  'Git',
  'Figma',
  'C++',
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

export const ABOUT_FACTS = [
  { label: 'Based', value: 'SoCal' },
  { label: 'Focus', value: 'Web / full stack' },
  { label: 'Open to', value: 'Roles + freelance' },
  { label: 'Also', value: 'Sim racing, 8+ years' },
]
