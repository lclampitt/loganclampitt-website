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
- `vercel.json` rewrites keep SPA routes on Vercel, except `/assets` and `/api`. Domain is `loganclampitt.com`.

## Visitor tracking

First party, no cookies, no third parties. The note visitors see is `/privacy`.

- `src/lib/analytics/` batches events in the browser and sends them to `/api/events` (sendBeacon when the page hides). Nothing is sent when the browser sends Global Privacy Control, when the browser is excluded on `/privacy`, or on `/console`.
- `shared/events.js` is the event vocabulary both sides use.
- `api/events.js` caps the body (64 KB) and batch (50), validates every event, adds place, device and bot flag from the request, and inserts into Supabase with the service role key. The IP and user agent are never stored.
- `supabase/migrations/` holds the schema: an `events` table with RLS on and no API access, and a `bot_visitors` view.
- `npm test` runs the ingest tests. `npm run dev` does not run `api/`; use a Vercel preview to see events land.
- `node scripts/update-datacenter-ranges.mjs` refreshes the cloud address list used to spot crawlers. Re-run every month or two.
