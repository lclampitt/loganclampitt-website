#!/usr/bin/env node
/*
 * PreToolUse on Read|Edit|Write|MultiEdit|NotebookEdit|Grep. Protects two
 * things Claude must never touch through the file tools:
 *
 *   1. Any .env file, at any path, for reading OR writing. Secrets live in
 *      Vercel's environment variables (Logan sets them himself). The
 *      settings' permissions.deny says the same; this is the second lock,
 *      and it also catches a Grep aimed at a .env file. `.env.example` is
 *      allowed: it holds variable names only, never values.
 *   2. An APPLIED migration. A supabase/migrations/*.sql that is already
 *      on origin/main has been run against the live database; editing it
 *      silently diverges the repo from the database. Creating a NEW
 *      migration, or iterating on one not yet on main, is fine.
 *
 * Always on. Blocks with exit 2; fails open on anything odd.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, resolve, relative } from "node:path";

let data = {};
try {
  data = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}
const input = data.tool_input ?? data.inputs ?? data.input ?? {};
const tool = data.tool_name ?? "";

function block(message) {
  process.stderr.write(`BLOCKED by .claude/hooks/protect.mjs: ${message}\n`);
  process.exit(2);
}

// A path that names a .env file: `.env`, `.env.local`,
// `api/.env.production`. Not `.env.example`, not `.environment.js`.
// Case-insensitive, because Windows opens `.ENV` as `.env`.
function namesDotenv(p) {
  if (typeof p !== "string" || !p) return false;
  const name = basename(p.replace(/\\/g, "/")).toLowerCase();
  if (name === ".env.example") return false;
  return name === ".env" || name.startsWith(".env.");
}

// A glob that could match a .env file: `**/.env*`, `*.env*`,
// `{.env,*.js}`. Any `.env` in a glob counts unless it is exactly the
// example file; a false block here costs a rephrased search, nothing more.
function globReachesDotenv(g) {
  if (typeof g !== "string" || !g) return false;
  return /\.env(?!\.example\b)/i.test(g);
}

// 1. .env, every tool that can read or write a file
const paths = [input.file_path, input.filePath, input.notebook_path, input.path];
// Grep's `pattern` is the text searched for, so only its `glob` filter is
// a path; Glob's `pattern` is a path pattern.
const globs = tool === "Grep" ? [input.glob] : tool === "Glob" ? [input.pattern] : [];
if (paths.some(namesDotenv) || globs.some(globReachesDotenv)) {
  block("that is a .env file. Claude never reads or writes .env files; secrets live in Vercel's environment variables. Ask Logan.");
}

// 2. applied migrations are append-only (writes only)
if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool)) {
  const file = input.file_path ?? input.filePath;
  if (file) {
    const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const rel = relative(root, resolve(root, file)).replace(/\\/g, "/");
    if (!rel.startsWith("..") && /^supabase\/migrations\/.+\.sql$/.test(rel)) {
      let shipped = false;
      try {
        execFileSync("git", ["cat-file", "-e", `origin/main:${rel}`], { cwd: root, stdio: "ignore" });
        shipped = true; // the file exists on origin/main
      } catch {
        shipped = false; // new, or only on this branch: fine to edit
      }
      if (shipped) {
        block(`${rel} is already on main and has run against the live database. Add a NEW migration instead of editing this one.`);
      }
    }
  }
}

process.exit(0);
