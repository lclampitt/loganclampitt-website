#!/usr/bin/env node
/*
 * PreToolUse guard for the shell tools (Bash and PowerShell) and for SQL
 * sent through an MCP execute_sql tool. Enforces this repo's rules
 * mechanically, so they hold even if an instruction is misread:
 *
 *   1. Nothing lands on main except through a PR. No git commit / push /
 *      merge / rebase / cherry-pick while on main (or master), and no push
 *      whose refspec targets main from any branch (`HEAD:main`). Vercel
 *      deploys main straight to loganclampitt.com, and main has no branch
 *      protection on GitHub, so this hook is the only lock.
 *   2. No shell command that reads or writes a .env file, and no
 *      `vercel env pull` (it writes one). The settings' permissions.deny
 *      and protect.mjs cover the file TOOLS; a shell `cat .env` slips past
 *      both. This closes it.
 *   3. No destructive git: force push (--force-with-lease is fine), push
 *      --mirror, a `+ref` push, reset --hard, clean -f, checkout -f, a
 *      checkout/restore that throws away the whole tree, branch -D, stash
 *      drop/clear, worktree remove --force.
 *   4. No other irreversible command: rm -rf / Remove-Item -Recurse
 *      -Force, destructive SQL (DROP, TRUNCATE, DELETE FROM), or
 *      `supabase db reset`. Schema changes go through a reviewed migration.
 *
 * The command is split at && || ; | and newlines, and each rule looks at
 * one segment at a time, so `rm -f a && grep -r x` is not read as rm -rf.
 * SQL rules skip segments that only carry or search text (git, gh, grep,
 * echo …), so a commit titled "Drop table of contents" is not blocked.
 *
 * HOW IT SIGNALS: exit 2 with a message on stderr blocks the tool call
 * and shows the reason to Claude immediately. Exit 0 allows it. Anything
 * unexpected (bad JSON, git not found) exits 0. A guard that breaks must
 * fail OPEN, never wedge the session.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";

function readPayload() {
  let raw = "";
  try {
    raw = readFileSync(0, "utf8");
  } catch {
    return { command: "", sqlOnly: false };
  }
  if (!raw.trim()) return { command: "", sqlOnly: false };
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { command: raw, sqlOnly: false }; // fall back to scanning the whole payload
  }
  // Different Claude Code versions name the field differently; try each.
  const input = data.tool_input ?? data.inputs ?? data.input ?? data;
  // The session's working folder: where the command runs. The hook itself
  // may start in another checkout (a worktree's parent repo is on main).
  const cwd = typeof data.cwd === "string" ? data.cwd : undefined;
  if (typeof input?.command === "string") return { command: input.command, sqlOnly: false, cwd };
  // An MCP execute_sql call: only the SQL rules apply.
  if (typeof input?.query === "string") return { command: input.query, sqlOnly: true, cwd };
  return { command: JSON.stringify(data), sqlOnly: false, cwd };
}

function block(message) {
  process.stderr.write(`BLOCKED by .claude/hooks/guard.mjs: ${message}\n`);
  process.exit(2);
}

const { command, sqlOnly, cwd } = readPayload();
if (!command) process.exit(0);

const segments = command.split(/&&|\|\||[;|\n]/).map((s) => s.trim()).filter(Boolean);

// `git -C dir -c k=v --no-pager commit` → "commit". Returns the git
// subcommand of a segment and the text after it, or null.
function gitCall(segment) {
  const m = segment.match(/\bgit((?:\s+(?:-C\s+\S+|-c\s+\S+|--[\w-]+(?:=\S+)?|-[a-zA-Z]))*)\s+([a-z][\w-]*)(.*)$/);
  return m ? { sub: m[2], rest: m[3] } : null;
}

// ── Rule 4 (SQL part): destructive SQL ──────────────────────────────
// Run first: it is the only rule for an execute_sql payload.
const DESTRUCTIVE_SQL = [
  /\bdrop\s+(table|database|schema|view|materialized\s+view|function|index|policy|trigger|type|extension|role|owned)\b/i,
  /\balter\s+table\b[^;]*\bdrop\b/i,
  /\btruncate\b(\s+table)?\s+(only\s+)?["\w]/i,
  /\bdelete\s+from\b/i,
];
// Segments that only carry or search text (a commit message, a grep for
// "delete from" in the code) are skipped; anything that could execute SQL
// (psql, node, curl, supabase) is checked.
const TEXT_ONLY = /^(git|gh|grep|rg|echo|printf|cat|head|tail|sed|awk|findstr|Select-String|Get-Content|Write-Output)\b/i;
for (const segment of sqlOnly ? [command] : segments) {
  if (!sqlOnly && TEXT_ONLY.test(segment)) continue;
  if (DESTRUCTIVE_SQL.some((re) => re.test(segment))) {
    block("destructive SQL (DROP, TRUNCATE, DELETE FROM) would destroy data. Make schema changes through a reviewed migration in supabase/migrations/, and ask Logan before deleting rows.");
  }
}
if (sqlOnly) process.exit(0);

// ── Rule 2: no .env access ──────────────────────────────────────────
// A `.env` token, ending at a dot (.env.local), slash, quote, space, a
// glob star, or end of string, so `.environment` and `.eslintrc` do not
// trip it. Case-insensitive: Windows opens `.ENV` as `.env`.
// `.env.example` is allowed: it carries variable NAMES only.
const envToken = /(^|[\s"'=(/\\])\.env(\.[\w.-]*)?(?=$|[\s"')/\\;|&>*?])/gi;
for (const m of command.matchAll(envToken)) {
  if ((m[2] ?? "").toLowerCase() !== ".example") {
    block("this command references a .env file. Secrets live in Vercel's environment variables; ask Logan to touch .env.");
  }
}
if (/\bvercel\s+env\s+pull\b/i.test(command)) {
  block("vercel env pull writes secrets into a local .env file. Ask Logan which variables are set instead.");
}

// ── Rule 3: no destructive git ──────────────────────────────────────
for (const segment of segments) {
  const call = gitCall(segment);
  if (!call) continue;
  const { sub, rest } = call;
  const args = ` ${rest} `;

  if (sub === "push") {
    // --force-with-lease (optionally with --force-if-includes) is the safe
    // variant a rebase-and-repush uses, so it is allowed.
    if (/\s--force(?![-\w])/.test(args) || /\s-[a-zA-Z]*f[a-zA-Z]*\s/.test(args)) {
      block("git push --force rewrites remote history. Use --force-with-lease, or push a fresh branch.");
    }
    if (/\s\+\S/.test(args)) {
      block("a `+ref` push is a force push. Use --force-with-lease, or push a fresh branch.");
    }
    if (/\s--mirror\b/.test(args)) {
      block("git push --mirror can delete remote branches. Push the one branch you mean.");
    }
    if (/\s--delete\b|\s:\S/.test(args) && /\b(main|master)\b/.test(args)) {
      block("that would delete main on GitHub.");
    }
  }
  if (sub === "reset" && /\s--hard\b/.test(args)) {
    block("git reset --hard throws away uncommitted work. Commit or stash first, or ask Logan.");
  }
  if (sub === "clean" && (/\s-[a-zA-Z]*f/.test(args) || /\s--force\b/.test(args))) {
    block("git clean -f deletes untracked files for good. Remove the specific files you mean.");
  }
  if (sub === "checkout" && (/\s-[a-zA-Z]*f[a-zA-Z]*\s/.test(args) || /\s--force\b/.test(args))) {
    block("git checkout -f throws away uncommitted work. Commit or stash first.");
  }
  // `git checkout -- .` / `git restore .` / `:/` discard every unstaged
  // change at once. Restoring a named file is fine, and so is
  // `git restore --staged .`, which only unstages.
  if (sub === "checkout" || sub === "restore") {
    const unstageOnly = sub === "restore" && /\s--staged\b/.test(args) && !/\s--worktree\b/.test(args);
    if (!unstageOnly && /\s(\.|:\/|\*)(?=\s)/.test(args)) {
      block("this discards every unstaged change in the tree. Restore the specific files you mean.");
    }
  }
  if (sub === "branch" && (/\s-[a-zA-Z]*D/.test(args) || (/\s(-d|--delete)\b/.test(args) && /\s(-f|--force)\b/.test(args)))) {
    block("git branch -D deletes a branch even if it is not merged. Use -d, which refuses unmerged work.");
  }
  if (sub === "stash" && /^\s*(drop|clear)\b/.test(rest)) {
    block("dropping a stash loses that work for good. Leave it, or ask Logan.");
  }
  if (sub === "worktree" && /^\s*remove\b/.test(rest) && /\s(-f|--force)\b/.test(args)) {
    block("git worktree remove --force throws away that worktree's uncommitted work.");
  }
}

// ── Rule 4: other irreversible commands ─────────────────────────────
for (const segment of segments) {
  // rm with BOTH recursive and force: the classic irreversible wipe.
  const rm = segment.match(/(?:^|\s)rm\s(.*)$/);
  if (rm) {
    const flags = rm[1].match(/(?:^|\s)-[a-zA-Z]+/g) || [];
    const recursive = /--recursive\b/.test(rm[1]) || flags.some((f) => /r/i.test(f));
    const force = /--force\b/.test(rm[1]) || flags.some((f) => /f/.test(f));
    if (recursive && force) {
      block("rm -rf is irreversible. Delete specific paths, or use `git worktree remove` for a worktree.");
    }
  }
  // PowerShell's equivalent (and its rm / ri / del aliases).
  if (/\b(Remove-Item|ri|rd|rmdir|del)\b/i.test(segment) && /\s-Recurse\b/i.test(segment) && /\s-Force\b/i.test(segment)) {
    block("Remove-Item -Recurse -Force is irreversible. Delete specific paths.");
  }
  if (/\bsupabase\s+db\s+reset\b/i.test(segment)) {
    block("supabase db reset wipes the database. Ask Logan.");
  }
}

// ── Rule 1: nothing lands on main except through a PR ───────────────
// The branch is read in the folder the git command really runs in: the
// session's folder, moved by a `cd <dir>` earlier in the chain, or a
// `git -C <dir>`. Reading it in the hook's own folder was wrong for
// worktrees (2026-10-20): the parent checkout sits on main while the
// worktree is on a feature branch, so every commit was blocked.
const branches = new Map();
function branchIn(dir) {
  const key = dir ?? "";
  if (branches.has(key)) return branches.get(key);
  let name = "";
  try {
    name = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    name = ""; // not a git repo, or git missing: nothing to guard
  }
  branches.set(key, name);
  return name;
}
const isMain = (name) => name === "main" || name === "master";
const unquote = (s) => s.replace(/^["']|["']$/g, "");

// Track a `git checkout main && git commit` chain: the branch the later
// segment runs on is the one switched to, not the one read up front.
let switchedTo = null;
let dir = cwd;
for (const segment of segments) {
  const cd = segment.match(/^(?:cd|Set-Location|pushd)\s+(?:\/d\s+)?("[^"]+"|'[^']+'|\S+)\s*$/i);
  if (cd) {
    dir = resolvePath(dir ?? process.cwd(), unquote(cd[1]));
    switchedTo = null;
    continue;
  }
  const call = gitCall(segment);
  if (!call) continue;
  const { sub, rest } = call;
  const args = ` ${rest} `;
  const dashC = segment.match(/\bgit\s+(?:[^|;&]*?\s)?-C\s+("[^"]+"|'[^']+'|\S+)/);
  const where = dashC ? resolvePath(dir ?? process.cwd(), unquote(dashC[1])) : dir;

  if (sub === "checkout" || sub === "switch") {
    const created = args.match(/\s-[bcB]\s+(\S+)/);
    if (created) {
      switchedTo = created[1];
    } else if (!/\s--(?=\s)/.test(args)) {
      // `git checkout -- file` restores a file and leaves the branch alone
      const target = rest.trim().split(/\s+/).find((a) => !a.startsWith("-"));
      if (target) switchedTo = target;
    }
    continue;
  }
  if (sub === "push" && /\s(\S*:)?(refs\/heads\/)?(main|master)(?=\s)/.test(args.replace(/\sorigin\s/, " "))) {
    block("this push targets main. Push a branch and open a PR; merging the PR with gh is the sanctioned path.");
  }
  if (/^(commit|merge|rebase|push|cherry-pick|am|revert)$/.test(sub)) {
    const on = switchedTo ?? branchIn(where);
    if (isMain(on)) {
      block(`you are on '${on}'. Direct commit/push/merge/rebase to ${on} is not allowed. Make a branch and open a PR (merging the PR with gh is the sanctioned path).`);
    }
  }
}

process.exit(0);
