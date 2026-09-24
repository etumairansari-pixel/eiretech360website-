/**
 * Password hashing and sessions for the content admin.
 *
 * The admin binds to 127.0.0.1, so this is not defending against the internet —
 * it is there so that anything else running on the machine, or anyone who walks
 * up to it, cannot read or rewrite the site's content.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * PBKDF2 rather than scrypt or bcrypt, because the same hash has to be checked
 * in two places: here, and by api.php on the deployed site. Both Node and PHP
 * implement PBKDF2 natively, so one password works in both without pulling in
 * a dependency on either side.
 */
const PBKDF2 = { digest: "sha256", iterations: 210000, keylen: 32, saltBytes: 16 };
const SESSION_MS = 12 * 60 * 60 * 1000;
export const COOKIE = "eiretech_admin";

/* ------------------------------------------------------------------
   Passwords
------------------------------------------------------------------ */

/** Hashes a password for storage: "pbkdf2$sha256$iterations$salt$key", hex. */
export function hashPassword(password) {
  const salt = crypto.randomBytes(PBKDF2.saltBytes);
  const key = crypto.pbkdf2Sync(
    password.normalize("NFKC"),
    salt,
    PBKDF2.iterations,
    PBKDF2.keylen,
    PBKDF2.digest,
  );

  return [
    "pbkdf2",
    PBKDF2.digest,
    PBKDF2.iterations,
    salt.toString("hex"),
    key.toString("hex"),
  ].join("$");
}

/**
 * Checks a password against a stored hash.
 *
 * The comparison is constant-time: a plain `===` leaks how much of the hash
 * matched through how long it took to decide.
 */
export function verifyPassword(password, stored) {
  const parts = String(stored ?? "").split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2") return false;

  const [, digest, iterations, saltHex, keyHex] = parts;
  const rounds = Number(iterations);
  if (!Number.isInteger(rounds) || rounds < 1000) return false;

  const expected = Buffer.from(keyHex, "hex");
  if (expected.length === 0) return false;

  let actual;
  try {
    actual = crypto.pbkdf2Sync(
      password.normalize("NFKC"),
      Buffer.from(saltHex, "hex"),
      rounds,
      expected.length,
      digest,
    );
  } catch {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}

/* ------------------------------------------------------------------
   Reading the configured hash
------------------------------------------------------------------ */

/**
 * Reads ADMIN_PASSWORD_HASH from the environment or .env.local.
 *
 * .env.local is parsed here rather than pulled in through Vite, because the
 * admin server starts before any Vite config is evaluated.
 *
 * @returns {string|null}
 */
export function readPasswordHash() {
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH.trim();

  const envFile = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envFile)) return null;

  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = /^\s*ADMIN_PASSWORD_HASH\s*=\s*(.+?)\s*$/.exec(line);
    if (match) return match[1].replace(/^["']|["']$/g, "");
  }

  return null;
}

/* ------------------------------------------------------------------
   Sessions

   Held in memory only: restarting the server signs everyone out, which is the
   behaviour you want from a tool you start and stop all day.
------------------------------------------------------------------ */

const sessions = new Map();

export function createSession() {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  return token;
}

export function isValidSession(token) {
  if (!token) return false;

  const expires = sessions.get(token);
  if (!expires) return false;

  if (Date.now() > expires) {
    sessions.delete(token);
    return false;
  }

  return true;
}

export function destroySession(token) {
  if (token) sessions.delete(token);
}

/** Reads one cookie from a request header. */
export function readCookie(header, name) {
  for (const part of String(header ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/* ------------------------------------------------------------------
   Throttling

   Without this, a password is only as strong as how fast something can guess
   it. The delay grows with each failure and resets on success.
------------------------------------------------------------------ */

let failures = 0;
let lockedUntil = 0;

export function loginLockRemaining() {
  return Math.max(0, lockedUntil - Date.now());
}

export function recordLoginFailure() {
  failures += 1;
  // No delay for the first few — typos are normal. After that it climbs fast.
  if (failures > 3) {
    lockedUntil = Date.now() + Math.min(60_000, 2 ** (failures - 3) * 1000);
  }
}

export function recordLoginSuccess() {
  failures = 0;
  lockedUntil = 0;
}
