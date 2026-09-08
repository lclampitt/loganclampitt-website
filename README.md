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
- First visit in a session shows a short racecar + tire smoke intro (sessionStorage `logan-intro-seen`). Skip is available. Reduced motion gets a brief static fade.
- The GitHub graph is a Fardeen-style animated heatmap that fills the card width. It tries public contribution feeds for `lclampitt` and falls back to a labeled stylized map when those feeds are empty. No API key is required.
- Sticky contact bar expands upward and posts to Formspree (`mdapkror`).
- Project and sim racing routes stay available for deeper pages.
- `vercel.json` rewrites keep SPA routes on Vercel. Domain is `loganclampitt.com`.
