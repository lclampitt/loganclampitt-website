# Subagents

Specialist workers the main session delegates to. Each runs in its own
context with a focused prompt and a scoped toolset.

| Agent               | Owns                          | Tools                 | Role                        |
| ------------------- | ----------------------------- | --------------------- | --------------------------- |
| `explorer`          | nothing (reads the repo)      | read only             | find and explain code       |
| `design`            | `src/` (site and console UI)  | edit + browser        | build UI, verify visually   |
| `backend`           | `api/`, `supabase/`           | edit + Bash           | functions, SQL, migrations  |
| `reviewer`          | nothing (reads the diff)      | read only             | quality and rules gate      |
| `security-reviewer` | nothing (reads the diff)      | read only             | secrets, RLS, privacy gate  |
| `debugger`          | nothing (reads a failure)     | read only + browser   | reproduce, one root cause   |

The reviewers read a CHANGE before it ships. The `debugger` reads a
FAILURE after it happened: reproduce, collect evidence, name the one
cause, and propose the fix for `backend` or `design` to make.

Every researcher and reviewer has **no Edit or Write tool**, so it
reports rather than changes code. `explorer` has no shell either and is
read only outright. `reviewer`, `security-reviewer` and `debugger` keep
Bash for `git diff`, `gh`, lint and build; their briefs forbid writing
files, committing or pushing with it, and the hooks block anything
destructive.

## The flow

1. Logan briefs the main session.
2. The main session delegates: `backend` and `design` do the work, in
   parallel when a change spans both (they own different folders).
3. The main session runs `reviewer`, plus `security-reviewer` when the
   change touches `api/`, `supabase/`, tracking or secrets. Findings go
   back to the right specialist; repeat until clean.
4. Branch, commit, PR, CI green, merge. Logan merges with `/ship`.

## What keeps it safe

The `.claude/hooks/` guards make that the only path: no commit on `main`,
no force push or destructive git, no `.env` access by any tool, and no
editing a migration that already ran. See `../hooks/README.md`.
