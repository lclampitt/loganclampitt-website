---
name: security-review
description: Run a security and privacy review of a code change in the
  loganclampitt.com repo before it ships. Use this whenever a change
  touches api/, supabase/ or a migration, visitor tracking or any visitor
  data, the /console or its sign in, secrets or environment variables, or
  vercel.json, and whenever the user asks "is this safe to merge", "review
  this for security", or is about to merge a PR with any of those. Reach
  for it even when the user does not say the word "security": a new
  table, a new stored field, or a new function all warrant it.
---

# Security review (loganclampitt.com)

Review a change for the risks that actually hurt here: a leaked Supabase
service key, visitor data readable by anyone, someone other than Logan
getting into the console, or tracking a visitor who asked not to be. This
is narrower than a general code review: you are not grading naming or
duplication, only safety and privacy.

Get the change first: `git diff main...HEAD` (or the files named). Report
findings; you do not fix them.

## The checklist

**Secrets.**
- Secrets are read from `process.env` inside `api/` only. Flag any secret
  in a `VITE_` variable: Vite inlines every `VITE_` value into the public
  bundle. Search the diff for `VITE_` and for `service_role`.
- Flag any key, token or credential in a tracked file, a log line, an
  error response, or a URL. Never read a `.env` file to check; the hooks
  block it.
- A new environment variable is named in the PR description with where it
  goes in Vercel (Production, Preview), never with its value.

**Database (Supabase).** Every table in `public` is reachable through
the Data API with the publishable key, so a table without RLS is world
readable.
- A migration that creates a table MUST `ENABLE ROW LEVEL SECURITY` in the
  same migration, with **no policies**, and `REVOKE ALL` from `anon` and
  `authenticated`.
- A view is `WITH (security_invoker = true)` and gets the same revoke.
- A function revokes `EXECUTE` from `public`, `anon` and `authenticated`,
  and is `SECURITY INVOKER` unless the reason is stated beside it. A
  `SECURITY DEFINER` function sets `search_path`.
- No SQL built by string concatenation from request input.
- After a migration is applied, the Supabase security advisors show no new
  warnings.

**Ingest (`api/events.js`).**
- The body size and batch size caps run before any per event work.
- Event names come from the fixed list; props are type checked, and
  strings are length capped.
- Server fields (geo, bot flag, `received_at`, `clock_source`) are set by
  the server, never copied from the body. The body is never spread into
  the row.
- The IP and the raw user agent are used only in memory, never stored or
  logged. Geo is city and region at most.
- Only POST is accepted; responses carry no internals.

**Console (`api/console/*`, `/console`).**
- Every handler verifies the bearer token with Supabase Auth and compares
  the email to `CONSOLE_EMAIL` before any query. Flag a handler that
  reads data first, or trusts an email sent by the client.
- Sign in is email and password, accepted only for `CONSOLE_EMAIL` and
  rate limited; a wrong email and a wrong password get the same answer.
  The password is never logged or stored. Supabase sign ups stay off.
- 401 carries no data and no hint of which check failed.

**Privacy.**
- With Global Privacy Control on, or the browser marked excluded, no
  event is built or sent.
- No cookies for visitors; the visitor id is a random value in
  localStorage.
- No contact form text, name or email in `events` (Contact_Sent records
  that it happened, nothing more).
- The privacy note still describes what is collected. Flag a new stored
  field it does not cover.

**Routing.** `vercel.json` keeps `/api` out of the SPA rewrite, and no
new rewrite exposes a function under an unexpected path.

## Report format

Lead with a verdict, **clean** or **risks found**, then list each finding
as:

```
file:line — the risk — the consequence
```

Most severe first. If the change is clean on every point above, say so
plainly; do not invent risks to look thorough. You are a gate, not an
author. Never imply you will fix anything.
