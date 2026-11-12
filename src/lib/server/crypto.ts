import "server-only";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/** A random token for a URL or a header: 32 bytes, base64url. */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

/** Tokens are stored as their SHA-256, so a database leak does not hand out working tokens. */
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  // compare against itself when the lengths differ, so the time does not reveal the length
  return x.length === y.length ? timingSafeEqual(x, y) : (timingSafeEqual(x, x), false);
}

// Passwords: scrypt at OWASP's N=2^15, r=8, p=3 (32 MB, about 100 ms), with a 16-byte salt. Stored as
// "scrypt$N$r$p$salt$hash" so the cost can be raised later without breaking old hashes.
const N = 2 ** 15;
const R = 8;
const P = 3;
const KEYLEN = 64;

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: n, r, p, maxmem: 256 * n * r * p + 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const key = await derive(password, Buffer.from(salt, "base64url"), Number(n), Number(r), Number(p));
  const want = Buffer.from(hash, "base64url");
  return key.length === want.length && timingSafeEqual(key, want);
}

/** A hash that costs as much as a real check: run when there is no such user, so timing does not reveal accounts. */
let dummy: string | undefined;
export async function burnPasswordCheck(password: string) {
  dummy ??= await hashPassword("not-a-real-password");
  await verifyPassword(password, dummy);
}

/** value.signature, signed with AUTH_SECRET (the admin's cookie). */
export function sign(value: string, secret: string): string {
  return `${value}.${createHmac("sha256", secret).update(value).digest("base64url")}`;
}

export function unsign(signed: string, secret: string): string | null {
  const i = signed.lastIndexOf(".");
  if (i <= 0) return null;
  const value = signed.slice(0, i);
  return safeEqual(sign(value, secret), signed) ? value : null;
}

/** A licence key people can read out: FV-XXXXX-XXXXX-XXXXX-XXXXX (no 0/O/1/I). */
export function licenseKey(): string {
  const abc = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(20);
  const chars = Array.from(bytes, (b) => abc[b % abc.length]).join("");
  return `FV-${chars.match(/.{5}/g)!.join("-")}`;
}
