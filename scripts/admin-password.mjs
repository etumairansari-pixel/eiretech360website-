/**
 * Sets the content admin's password.
 *
 * The password itself is never stored — only a scrypt hash of it, in
 * .env.local, which git ignores. Losing it costs nothing: run this again.
 *
 * Usage: npm run admin:password
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./admin-auth.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(rootDir, ".env.local");
const KEY = "ADMIN_PASSWORD_HASH";

/**
 * Writes the hash into .env.local, replacing any previous one.
 *
 * @param {string} value The new password.
 */
function store(value) {
  const line = `${KEY}=${hashPassword(value)}`;
  let env = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";

  if (new RegExp(`^${KEY}=.*$`, "m").test(env)) {
    env = env.replace(new RegExp(`^${KEY}=.*$`, "m"), line);
  } else {
    env =
      env.trimEnd() + (env.trim() ? "\n\n" : "") + "# Content admin (npm run admin)\n" + line + "\n";
  }

  fs.writeFileSync(envFile, env);

  console.log(`\n  Saved to .env.local — git ignores that file, so it stays on this machine.`);
  console.log(`  Start the editor with: npm run admin\n`);
}

// A non-interactive path, for setting the password from a script. The prompt
// below is the normal route; this exists because piping into a hidden prompt
// is not something readline handles reliably.
const fromEnv = process.env.NEW_ADMIN_PASSWORD;
if (fromEnv) {
  if (fromEnv.length < 8) {
    console.error("\n  NEW_ADMIN_PASSWORD is too short — use at least 8 characters.\n");
    process.exit(1);
  }
  store(fromEnv);
  process.exit(0);
}

if (!process.stdin.isTTY) {
  console.error("\n  This needs a terminal so the password can be typed without being shown.");
  console.error("  To set it from a script instead:  NEW_ADMIN_PASSWORD=... npm run admin:password\n");
  process.exit(1);
}

/**
 * One readline interface for the whole prompt.
 *
 * Both questions share it: opening a second one after the first closed would
 * find stdin already ended whenever input is piped rather than typed.
 */
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// readline echoes what is typed through this hook. Suppressing everything
// except the prompt itself keeps the password out of the terminal scrollback
// and out of any screen recording.
let echo = true;
const write = rl._writeToOutput?.bind(rl);
rl._writeToOutput = (chunk) => {
  if (echo) {
    write?.(chunk);
    return;
  }
  if (chunk.includes("\n") || chunk.includes("\r")) write?.("\n");
};

function askHidden(question) {
  return new Promise((resolve) => {
    echo = true;
    rl.question(question, (answer) => {
      echo = true;
      resolve(answer);
    });
    echo = false;
  });
}

const password = await askHidden("  New admin password: ");

if (password.length < 8) {
  rl.close();
  console.error("\n  Too short — use at least 8 characters.\n");
  process.exit(1);
}

const again = await askHidden("  Type it again:      ");
rl.close();

if (password !== again) {
  console.error("\n  They do not match. Nothing was changed.\n");
  process.exit(1);
}

store(password);
