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

- Homepage is a single page: compact hero, projects, experience, skills, about.
- Hero follows a content-first layout: wordmark, short bio, CTAs, a stylized GitHub style activity strip, then link pills.
- The activity strip is decorative only. It does not fetch or display live contribution totals.
- Sticky contact bar expands upward and posts to Formspree (`mdapkror`).
- Project and sim racing routes stay available for deeper pages.
- `vercel.json` rewrites keep SPA routes on Vercel. Domain is `loganclampitt.com`.
