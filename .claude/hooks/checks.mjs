#!/usr/bin/env node
/*
 * Stop hook: `npm run lint` and `npm run build` at the END of a turn, but
 * only when something that feeds them changed in the working tree (source,
 * styles, config, api/). Quiet turns exit fast and pay nothing.
 *
 * Both are cheap here (lint about 3s, build about 1s, measured 2026-10-20),
 * so the whole project is checked rather than just the files touched. Main
 * lints clean, so any error is new. If either fails, exit 2 hands the
 * output back so it is fixed before the turn ends.
 *
 * Loop guard: Claude Code re-runs this after every fix attempt. After three
 * blocks in a row in one session it lets the turn end (exit 0) rather than
 * spin forever, and resets so the next turn is checked again. The failure
 * is still in the transcript, and CI catches it.
 *
 * Runs eslint and vite through node directly, not `npm run`, because npm
 * is a .cmd shim on Windows that execFileSync cannot start without a shell.
 * Fails open on any infra problem (no node_modules, git missing).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let data = {};
try {
  data = JSON.parse(readFileSync(0, "utf8"));
} catch {
  // no payload: still run the checks, just without the loop guard's id
}

function run(cmd, args) {
  try {
    return { ok: true, out: execFileSync(cmd, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    if (e.status == null) return { ok: true, out: "" }; // could not start: fail open
    return { ok: false, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

// Files changed in the working tree, repo-relative, forward-slashed.
function changedFiles() {
  // -uall lists each untracked file, not just its new directory
  const { out } = run("git", ["status", "--porcelain", "-uall"]);
  const files = [];
  for (const line of out.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let p = line.slice(3).trim(); // drop the 2-char status + space
    if (p.includes(" -> ")) p = p.split(" -> ")[1]; // renames
    files.push(p.replace(/^"|"$/g, "").replace(/\\/g, "/"));
  }
  return files;
}

const relevant = changedFiles().filter(
  (f) =>
    !/^(dist|node_modules)\//.test(f) &&
    (/\.(jsx?|mjs|cjs|css|html)$/.test(f) || /^(package(-lock)?\.json|vercel\.json)$/.test(f)),
);
if (relevant.length === 0) process.exit(0);

const eslint = resolve(root, "node_modules/eslint/bin/eslint.js");
const vite = resolve(root, "node_modules/vite/bin/vite.js");
if (!existsSync(eslint) || !existsSync(vite)) process.exit(0); // npm ci not run

// Keep what is handed back short: the tail is where the error is.
const tail = (text, n) => text.trim().split(/\r?\n/).slice(-n).join("\n");

const failures = [];
const lint = run("node", [eslint, "."]);
if (!lint.ok) failures.push(`npm run lint failed:\n${tail(lint.out, 60)}`);
const build = run("node", [vite, "build", "--logLevel", "error"]);
if (!build.ok) failures.push(`npm run build failed:\n${tail(build.out, 40)}`);

const counter = join(tmpdir(), `lc-site-checks-${String(data.session_id ?? "nosession").replace(/[^\w-]/g, "")}`);
if (failures.length === 0) {
  try {
    rmSync(counter, { force: true });
  } catch {
    // nothing to reset
  }
  process.exit(0);
}

let blocks = 0;
try {
  blocks = Number(readFileSync(counter, "utf8")) || 0;
} catch {
  blocks = 0;
}
if (blocks >= 3) {
  // See "Loop guard" above. Reset, so the next turn is checked again.
  try {
    rmSync(counter, { force: true });
  } catch {
    // the guard is best effort
  }
  process.exit(0);
}
try {
  writeFileSync(counter, String(blocks + 1));
} catch {
  // the guard is best effort
}

process.stderr.write(`Checks failed. Fix before finishing:\n\n${failures.join("\n\n")}\n`);
process.exit(2);
