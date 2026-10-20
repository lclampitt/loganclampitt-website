// Self test for guard.mjs and protect.mjs. Run: node .claude/hooks/guard.selftest.mjs
import { execFileSync } from "node:child_process";

const DOT = "." + "env"; // avoid a literal token in this file's own text

// The git-on-main rule depends on the CURRENT branch, so the test reads it
// and expects a block only when we are actually on main/master. On a
// feature branch the same commands are correctly allowed. That is the
// point of the guard, so assert it either way.
let branch = "";
try {
  branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    encoding: "utf8",
  }).trim();
} catch {
  // not a git checkout: the main-branch cases expect "allowed"
}
const onMain = branch === "main" || branch === "master";
const gitWant = onMain ? 2 : 0;
const gitNote = onMain ? "blocked (on main)" : `allowed (on ${branch || "?"})`;

const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });

const guardCases = [
  // Rule 1: main
  [bash("git commit -m x"), gitWant, `commit: ${gitNote}`],
  [bash("git push origin HEAD"), gitWant, `push: ${gitNote}`],
  [bash("git status"), 0, "git status: always allowed"],
  [bash("gh pr merge 12 --merge"), 0, "gh pr merge: the sanctioned path"],
  // Rule 2: dotenv
  [bash(`cat ${DOT}.local`), 2, "read a dotenv file: blocked"],
  [bash(`echo X=1 >> ${DOT}`), 2, "write a dotenv file: blocked"],
  [bash(`cp ${DOT}.example ${DOT}.local`), 2, "copy into a dotenv file: blocked"],
  [bash(`cat ${DOT}*`), 2, "a dotenv glob: blocked"],
  [bash(`cat ${DOT}.example`), 0, "the example file: allowed"],
  [bash(`grep TODO src/${DOT}ironment.js`), 0, `${DOT}ironment is not ${DOT}: allowed`],
  [bash("npm run lint"), 0, "npm run lint: allowed"],
  // Rule 3: destructive git
  [bash("git push --force origin main"), 2, "force push: blocked"],
  [bash("git push -f origin feature"), 2, "push -f: blocked"],
  [bash("git push --force-with-lease origin feature"), gitWant, `force-with-lease: ${gitNote}`],
  [bash("git push --mirror origin"), 2, "push --mirror: blocked"],
  [bash("git reset --hard origin/main"), 2, "reset --hard: blocked"],
  [bash("git reset HEAD~1"), 0, "soft reset: allowed"],
  [bash("git clean -fd"), 2, "clean -fd: blocked"],
  [bash("git clean -n"), 0, "clean dry run: allowed"],
  [bash("git checkout -- ."), 2, "checkout -- . : blocked"],
  [bash("git restore ."), 2, "restore . : blocked"],
  [bash("git restore --staged ."), 0, "restore --staged . (unstage): allowed"],
  [bash("git checkout -- src/App.jsx"), 0, "restore one file: allowed"],
  [bash("git checkout -b claude/topic"), 0, "new branch: allowed"],
  [bash("git branch -D old"), 2, "branch -D: blocked"],
  [bash("git branch -d old"), 0, "branch -d: allowed"],
  [bash("git stash drop"), 2, "stash drop: blocked"],
  [bash("git checkout -f main"), 2, "checkout -f: blocked"],
  [bash("git restore :/"), 2, "restore :/ : blocked"],
  [bash("git branch -d -f old"), 2, "branch -d -f: blocked"],
  [bash("git push origin +feature"), 2, "+ref push: blocked"],
  [bash("git push --force-with-lease --force-if-includes origin feature"), gitWant, `lease + if-includes: ${gitNote}`],
  [bash("git worktree remove --force ../wt"), 2, "worktree remove --force: blocked"],
  [bash("git push origin f && rm -f out.log"), gitWant, `push next to rm -f: ${gitNote}`],
  // Rule 1 from a feature branch: a push that targets main
  [bash("git push origin HEAD:main"), 2, "push HEAD:main: blocked"],
  [bash("git push origin feature:refs/heads/main"), 2, "push to refs/heads/main: blocked"],
  [bash("git push origin main"), 2, "push main: blocked"],
  [bash("git push -u origin claude/main-menu"), gitWant, `branch with main in its name: ${gitNote}`],
  [bash("git checkout main && git commit -m x"), 2, "checkout main then commit: blocked"],
  [bash("git -C . commit -m x"), gitWant, `git -C . commit: ${gitNote}`],
  [bash("git checkout -b claude/topic && git commit -m x"), 0, "new branch then commit: allowed"],
  [bash("git pull --ff-only origin main"), 0, "pull main: allowed"],
  // Rule 2 extras
  [bash(`cat .ENV`), 2, "dotenv in capitals: blocked"],
  [bash("vercel env pull"), 2, "vercel env pull: blocked"],
  // Rule 4: irreversible
  [bash("rm -rf dist"), 2, "rm -rf: blocked"],
  [bash("rm -f claude-hook.log"), 0, "rm -f (no -r): allowed"],
  [bash("rm -f a.txt && grep -r foo src"), 0, "rm -f next to grep -r: allowed"],
  [{ tool_name: "PowerShell", tool_input: { command: "Remove-Item -Recurse -Force dist" } }, 2, "Remove-Item -Recurse -Force: blocked"],
  [{ tool_name: "PowerShell", tool_input: { command: `Get-Content ${DOT}` } }, 2, "PowerShell dotenv read: blocked"],
  [bash('psql -c "DROP TABLE events"'), 2, "DROP TABLE: blocked"],
  [bash('psql -c "TRUNCATE TABLE events"'), 2, "TRUNCATE TABLE: blocked"],
  [bash('psql -c "TRUNCATE events"'), 2, "TRUNCATE without TABLE: blocked"],
  [bash('psql -c "DELETE FROM events"'), 2, "DELETE FROM: blocked"],
  [bash('psql -c "DROP VIEW bot_visitors"'), 2, "DROP VIEW: blocked"],
  [bash("supabase db reset --linked"), 2, "supabase db reset: blocked"],
  [bash('git commit -m "Drop table of contents"'), gitWant, `commit message saying drop: ${gitNote}`],
  [bash('grep -rn "delete from" api'), 0, "grep for SQL text: allowed"],
  [{ tool_name: "mcp__x__execute_sql", tool_input: { query: "drop table events" } }, 2, "execute_sql DROP: blocked"],
  [{ tool_name: "mcp__x__execute_sql", tool_input: { query: "select count(*) from events" } }, 0, "execute_sql SELECT: allowed"],
];

const protectCases = [
  [{ tool_name: "Read", tool_input: { file_path: DOT } }, 2, "Read a dotenv file: blocked"],
  [{ tool_name: "Read", tool_input: { file_path: `C:\\repo\\${DOT}.local` } }, 2, "Read a Windows dotenv path: blocked"],
  [{ tool_name: "Write", tool_input: { file_path: `api/${DOT}.production` } }, 2, "Write a nested dotenv file: blocked"],
  [{ tool_name: "Edit", tool_input: { file_path: `${DOT}.example` } }, 0, "Edit the example file: allowed"],
  [{ tool_name: "Read", tool_input: { file_path: `src/${DOT}ironment.js` } }, 0, `Read ${DOT}ironment.js: allowed`],
  [{ tool_name: "Grep", tool_input: { pattern: "SUPABASE", glob: `**/${DOT}*` } }, 2, "Grep inside dotenv files: blocked"],
  [{ tool_name: "Grep", tool_input: { pattern: `${DOT}`, glob: "**/*.js" } }, 0, "Grep for the word: allowed"],
  [{ tool_name: "Glob", tool_input: { pattern: `**/${DOT}*` } }, 2, "Glob for dotenv files: blocked"],
  [{ tool_name: "Read", tool_input: { file_path: `C:\\repo\\${DOT.toUpperCase()}` } }, 2, "Read a dotenv file in capitals: blocked"],
  [{ tool_name: "Grep", tool_input: { pattern: "x", glob: `*${DOT}*` } }, 2, "Grep glob that reaches dotenv: blocked"],
  [{ tool_name: "Read", tool_input: { file_path: `${DOT}.example` } }, 0, "Read the example file: allowed"],
  [{ tool_name: "Read", tool_input: { file_path: "src/App.jsx" } }, 0, "Read a normal file: allowed"],
  [{ tool_name: "Write", tool_input: { file_path: "supabase/migrations/9999_selftest_new.sql" } }, 0, "Write a NEW migration: allowed"],
];

let pass = 0;
let total = 0;
for (const [script, cases] of [
  [".claude/hooks/guard.mjs", guardCases],
  [".claude/hooks/protect.mjs", protectCases],
]) {
  console.log(`\n${script}`);
  for (const [payload, want, label] of cases) {
    let code = 0;
    try {
      execFileSync("node", [script], { input: JSON.stringify(payload), stdio: ["pipe", "ignore", "ignore"] });
    } catch (e) {
      code = e.status ?? 1;
    }
    const ok = code === want;
    pass += ok ? 1 : 0;
    total += 1;
    console.log(`${ok ? "ok  " : "FAIL"}  exit=${code} want=${want}  ${label}`);
  }
}
console.log(`\n${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
