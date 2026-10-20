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
- `npm test` runs the api tests.
- `npm run dev` serves `api/` as well, through the same handlers Vercel runs. It needs a `.env.local` with the values named in `.env.example`; without it the api answers 503 not configured. Local data is labelled `development`, and the local console shows only that.
- `node scripts/update-datacenter-ranges.mjs` refreshes the cloud address list used to spot crawlers. Re-run every month or two.

## Console

`/console` is private: Overview, Visitors (with each visitor's journey) and Behaviour (with Busiest times by hour and by day). It is a separate lazy bundle and skips the site's chrome.

- Sign in is email and password, for `CONSOLE_EMAIL` only, checked by Supabase Auth through `api/console/auth.js`. The user is made by hand in Supabase (Authentication → Users), with sign ups off. The browser never holds a Supabase key, only the session Supabase issues at sign in.
- Every read goes through `api/console/data.js`, which checks that session with Supabase Auth before calling the SQL functions in `supabase/migrations/0002_console.sql`.
- Production shows production data; a preview shows only its own preview data.
- Signing in marks that browser as excluded, so Logan's own visits stop counting.
