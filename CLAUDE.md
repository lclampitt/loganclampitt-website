# CLAUDE.md

Logan Clampitt's personal site, loganclampitt.com. Vite, React 19,
Tailwind 4, Framer Motion, React Router, hosted on Vercel. The contact
bar posts to Formspree. This file is the short list of things that must
not go wrong; [README.md](README.md) has the rest.

This repo stands on its own. It shares nothing with pixel-lord (no code,
no database, no API). Read pixel-lord for reference only; never edit it
or send anything to its services.

## Rules

1. **Fail honest.** An unknown shows as unknown, never a zero. No invented
   numbers, ever. A failed request says so and never blanks a page.
2. **Secrets stay on the server.** They live in Vercel's environment
   variables, which Logan sets himself, and are read only in `api/`.
   **Never put a secret in a `VITE_` variable**: Vite ships those to the
   browser. Never read or write a `.env` file (the hooks block it).
3. **Visitors' privacy.** No cookies for visitors, no IP stored, city and
   region at most, nothing tracked when the browser sends Global Privacy
   Control or is excluded. No contact form text in analytics.
4. **Database.** Supabase, its own project. Every table has RLS on with no
   policies, and only `api/` (service role) reads or writes. Migrations in
   `supabase/migrations/` are append only; never edit one on `main`. Ask
   Logan before creating or changing anything that could cost money.
5. **Copy.** Every on screen word follows the `ui-copy` skill: short
   clarifiers, no dashes or hyphenated compounds.

## Map

- `src/data/content.js` holds the site's copy and links. `src/pages/` are
  the routes, `src/components/` the UI.
- `api/` holds Vercel functions. `npm run dev` serves them too (the
  `local-api` plugin in `vite.config.js`), reading Logan's `.env.local`.
- `vercel.json` sends every path except `/assets` and `/api` to
  `index.html`.

## Workflow

Branch → PR → CI green → merge, one PR per piece of work. Never commit to
`main`; Vercel deploys it straight to the live site. Logan merges with
`/ship`. Stage explicit paths, never `git add -A`.

Agents (`.claude/agents/`): `design` owns `src/`, `backend` owns `api/`
and `supabase/`; `reviewer` and `security-reviewer` gate every PR. Hooks
(`.claude/hooks/`) block commits on main, destructive git and `.env`
access, and run lint and build at the end of each turn.
