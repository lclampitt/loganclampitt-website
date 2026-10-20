---
name: review-diff
description: Review a code change in the loganclampitt.com repo for clean,
  organized code and the repo's rules before it merges. Use this whenever
  the user asks to review a diff, a branch, or a PR, to check code
  quality, or says a change is "ready" / "about to merge" / "give this a
  look". Reach for it as the standard gate before opening any PR, even if
  the user only says "does this look good?". Not for security
  specifically (use security-review for secrets, RLS, tracking and the
  console's sign in); this is the general quality and correctness gate.
---

# Review a diff (loganclampitt.com)

The quality gate before a change ships. Get the change with
`git diff main...HEAD` (or the named files). Report findings; do not fix
them here. Hand them back to whoever wrote the code.

## Clean, organized code
- Dead code, unused imports or exports, commented out blocks left behind.
- Unclear names, duplication, a component or function doing too much.
- Inconsistency with the surrounding file: two space indent, no
  semicolons, single quotes; comments carry WHY, briefly. A change that
  contradicts a nearby comment must update it in the same pass.
- Site copy and links belong in `src/data/content.js`, not inline.
- Effects clean up what they start (listeners, observers, timers,
  `requestAnimationFrame`), matching the pattern in `ContactBar.jsx`.
- Anything only the console needs is lazy loaded, so the public bundle
  does not grow.

## The rules (CLAUDE.md)
- **Fail honest:** an unknown shows as unknown, never a zero; **no
  invented numbers, ever**; a failed request never blanks a page; "not
  enough history" when there is no comparable earlier period. Exclusions
  (crawlers, Logan's own visits) travel with the count they qualify.
- **Secrets on the server:** nothing secret in a `VITE_` variable or
  under `src/`.
- **Privacy:** tracking honours Global Privacy Control and the exclude
  switch; no cookies for visitors; no form text, name or email in events.
- **Copy:** every on screen string follows the `ui-copy` skill. Search the
  added strings for `—`, `–`, ` - ` and hyphenated words.
- **Console look:** slate, white and navy; no coloured side borders on
  cards; no decorative pills or badges.
- **Migrations:** no applied migration edited; a new table enables RLS in
  the same migration; new columns nullable or defaulted, since the
  database changes before the code deploys.

## Safety spot checks
- `vercel.json` still excludes `/assets` and `/api` from the SPA rewrite.
- Nothing staged that the task did not change; no `git add -A`.
- `npm run lint` and `npm run build` pass.

## Report format
Verdict first, **clean** or **changes needed**, then each finding as
`file:line — problem — why it matters`, most serious first. If it is
clean, say so plainly; do not manufacture problems. You are a gate, not
an author.
