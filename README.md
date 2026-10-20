# loganclampitt.com

Personal site for Logan Clampitt. Built with Vite, React, Tailwind CSS, Framer Motion, and React Router.

## Built with Claude Code

This repo is developed with [Claude Code](https://claude.com/claude-code), set up as a small team of specialist agents with guard rails enforced by code rather than by instructions. Everything lives in [`.claude/`](.claude) and [`CLAUDE.md`](CLAUDE.md).

**Agents** ([`.claude/agents/`](.claude/agents)). Each has a focused brief and only the tools its job needs.

| Agent | Role |
|---|---|
| [`design`](.claude/agents/design.md) | Builds UI in `src/`. Knows the site's brand and the console's separate design language, and verifies changes in a browser at desktop and phone width. |
| [`backend`](.claude/agents/backend.md) | Owns `api/` and `supabase/`. Enforces server side secrets, RLS on every table, append only migrations, and "unknown, never zero". |
| [`reviewer`](.claude/agents/reviewer.md) | Read only quality gate run on every PR diff. Reports findings; cannot edit. |
| [`security-reviewer`](.claude/agents/security-reviewer.md) | Read only security and privacy gate for anything touching `api/`, the database, tracking or secrets. |
| [`debugger`](.claude/agents/debugger.md) | Read only investigator: reproduce, collect evidence, name one root cause, hand the fix to `design` or `backend`. |
| [`explorer`](.claude/agents/explorer.md) | Read only researcher that traces a feature across the stack and reports the conclusion. |

**Hooks** ([`.claude/hooks/`](.claude/hooks), wired in [`settings.json`](.claude/settings.json)). They run automatically and fail open, so a broken hook never wedges a session.

- [`guard.mjs`](.claude/hooks/guard.mjs): blocks committing or pushing to `main`, force pushes and other destructive git, `rm -rf`, destructive SQL, and any shell access to `.env` files. Covered by a 72 case [self test](.claude/hooks/guard.selftest.mjs) that runs in CI.
- [`protect.mjs`](.claude/hooks/protect.mjs): the file tools can never read or write a `.env` file, or edit a migration that has already run against the live database.
- [`autofix.mjs`](.claude/hooks/autofix.mjs): runs `eslint --fix` on each file as it is edited.
- [`checks.mjs`](.claude/hooks/checks.mjs): runs lint and build at the end of every turn and hands failures back to be fixed, with a loop guard.
- [`session-start.mjs`](.claude/hooks/session-start.mjs): orients each new session (branch, uncommitted work, deploy reminder).

**Skills** ([`.claude/skills/`](.claude/skills)). Reusable procedures the agents follow.

- [`review-diff`](.claude/skills/review-diff/SKILL.md): the quality checklist and report format for every PR.
- [`security-review`](.claude/skills/security-review/SKILL.md): the security and privacy checklist (secrets, RLS, ingest limits, console auth, visitor privacy).
- [`ui-copy`](.claude/skills/ui-copy/SKILL.md): house rules for every word on screen.

The workflow is branch, PR, CI (lint, build, tests and the hook self test), review by the gate agents, then merge. Vercel deploys `main` to the live site.

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
