#!/usr/bin/env node
/*
 * SessionStart: a quick orientation printed into context when a session
 * opens or resumes, so Claude starts already aware of the state instead of
 * discovering it mid-task. Stdout from a SessionStart hook is added to the
 * session context. Fails open (prints nothing) on any problem.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function git(args) {
  try {
    return execSync(`git ${args}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const branch = git("rev-parse --abbrev-ref HEAD");
const dirty = git("status --porcelain")
  .split(/\r?\n/)
  .filter(Boolean).length;

const lines = ["Session orientation:"];
const onMain = branch === "main" || branch === "master";
lines.push(
  `- Branch: ${branch || "unknown"}${onMain ? "  ⚠ on the default branch. Start a feature branch before committing (the guard blocks a direct commit)." : ""}`,
);
lines.push(
  `- Working tree: ${dirty ? `${dirty} file(s) with uncommitted changes` : "clean"}`,
);
if (!existsSync(resolve(root, "node_modules"))) {
  lines.push("- node_modules is missing. Run `npm ci` before lint, build or the dev server.");
}
lines.push(
  "- Deploys: Vercel builds every PR as a preview and deploys main to loganclampitt.com. Merging is shipping.",
);

process.stdout.write(lines.join("\n") + "\n");
process.exit(0);
