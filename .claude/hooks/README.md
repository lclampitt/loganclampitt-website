# Claude Code hooks

Small scripts Claude Code runs automatically at certain moments. Wired up
in `../settings.json`. They **fail open** (any error → exit 0) so a broken
hook can never wedge a session. A blocked action exits 2 with the reason.

Re-run the guard and protect checks any time:

```bash
node .claude/hooks/guard.selftest.mjs
```

## guard.mjs: `PreToolUse` on Bash, PowerShell and MCP `execute_sql`

The command is split at `&&`, `||`, `;`, `|` and newlines, and each rule
reads one segment, so a harmless `rm -f` next to a `grep -r` is not taken
for `rm -rf`.

- **Nothing reaches `main` except through a PR:** `git commit` / `push` /
  `merge` / `rebase` / `cherry-pick` **while on `main`** (including after a
  `git checkout main &&` in the same command), and any push whose refspec
  targets main (`git push origin HEAD:main`) from any branch. GitHub has
  no branch protection on `main`, and Vercel deploys it straight to
  loganclampitt.com, so this is the only lock. `gh pr merge` is the
  sanctioned path and is allowed.
- **No dotenv:** any shell command that names a `.env` file (any case),
  and `vercel env pull`, which writes one. `.env.example` (names only, no
  values) is allowed.
- **No destructive git:** force push (`--force-with-lease` is allowed),
  `+ref` push, `push --mirror`, `reset --hard`, `clean -f`,
  `checkout -f`, `checkout -- .` / `restore .`, `branch -D`,
  `stash drop` / `clear`, `worktree remove --force`.
- **No other irreversible command:** `rm -rf`, PowerShell's
  `Remove-Item -Recurse -Force`, `supabase db reset`, and destructive SQL
  (`DROP`, `TRUNCATE`, `DELETE FROM`) from a shell or an MCP
  `execute_sql` call. Segments that only carry or search text (`git`,
  `gh`, `grep`, `echo` …) skip the SQL rule, so a commit message may say
  "drop". Schema changes go through a migration.

Known gap: a recursive `grep` over the repo reads `.env` files too. The
Grep tool skips gitignored files, so prefer it.

## protect.mjs: `PreToolUse` on the file tools (always on)

- **Never any `.env` file**, read or write, at any path and in any case,
  through Read, Edit, Write, Grep or Glob (a glob that could reach one
  counts). Secrets live in Vercel's environment variables, which Logan
  sets himself. The deny list in `settings.json` names the usual files;
  this hook catches every other `.env.*` and leaves `.env.example` usable.
- **No editing an applied migration:** a `supabase/migrations/*.sql`
  already on `origin/main` has run against the live database. Add a new
  migration instead. A migration not yet on main can still be iterated.

## session-start.mjs: `SessionStart` (orientation)

Prints the branch (with a warning on `main`), whether the tree is dirty,
whether `node_modules` is missing, and a reminder that merging to `main`
is shipping.

## autofix.mjs: `PostToolUse` on Edit|Write (quiet)

After Claude edits a `.js/.jsx/.mjs/.cjs` file, runs `eslint --fix` on
**that one file** with the repo's own rules. No new dependency, no new
style (there is no Prettier). Fixes show up in the diff.

## checks.mjs: `Stop` (end of turn)

When a turn ends and source, styles or config changed in the working
tree, runs `npm run lint` and `npm run build` (through node directly).
Both are fast here, about 3s and 1s. A failure exits 2 so it is fixed
before the turn ends; after three blocks in a row it lets the turn end
instead of looping, and resets for the next turn. Quiet turns exit
immediately.

## Paths

Every hook command is `node "$CLAUDE_PROJECT_DIR/.claude/hooks/…"`, so the
hooks still run after a `cd` into a subfolder. A relative path would fail
to load there, and a hook that cannot load fails open.
