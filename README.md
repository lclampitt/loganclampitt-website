# loganclampitt.com

Personal site for Logan Clampitt. Built with Vite, React, Tailwind CSS, Framer Motion, and React Router.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Notes

- Homepage is a single page: hero, projects, experience, skills, GitHub graph, about.
- The GitHub graph is a Fardeen-style animated heatmap (cascade fill, then random cell pops) in the zinc + amber palette. It first tries the public `github-contributions-api.jogruber.de` feed for `lclampitt`. That API currently 404s and GitHub’s public contribution calendar for this account is empty, so the section falls back to a labeled stylized map that can swap in live totals later. No API key is required.
- Sticky contact bar expands upward and posts to Formspree (`mdapkror`).
- Project and sim racing routes stay available for deeper pages.
- `vercel.json` rewrites keep SPA routes on Vercel. Domain is `loganclampitt.com`.
