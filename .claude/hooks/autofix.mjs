#!/usr/bin/env node
/*
 * PostToolUse on Edit|Write: quietly auto-fix the ONE file just changed,
 * using the repo's own ESLint rules (eslint.config.js). Controlled on
 * purpose:
 *   - only the file that was edited, never a sweep of the tree
 *   - only .js/.jsx/.mjs/.cjs inside the repo, outside dist/ and
 *     node_modules/
 *   - only what the existing rules can fix: no new style, no new
 *     dependency (there is no Prettier here)
 *   - fails open: any problem exits 0, so it can never block an edit.
 *
 * The fixes are rule-driven and show up in the diff like any other change.
 * Whatever --fix cannot fix is left for the Stop check (checks.mjs).
 */
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, relative } from "node:path";

let data = {};
try {
  data = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const input = data.tool_input ?? data.inputs ?? data.input ?? {};
const file = input.file_path ?? input.filePath ?? input.path;
if (!file) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const abs = resolve(root, file);
const rel = relative(root, abs).replace(/\\/g, "/");
if (rel.startsWith("..")) process.exit(0); // outside the repo: leave it
if (!/\.(jsx?|mjs|cjs)$/.test(rel)) process.exit(0);
if (/^(dist|node_modules)\//.test(rel)) process.exit(0);

const eslint = resolve(root, "node_modules/eslint/bin/eslint.js");
if (!existsSync(eslint)) process.exit(0); // npm install not run yet

try {
  execFileSync("node", [eslint, "--fix", abs], { cwd: root, stdio: "ignore" });
} catch {
  // ESLint exits non-zero when unfixable problems remain; the --fix pass
  // still applied what it could. Stay silent.
}
process.exit(0);
