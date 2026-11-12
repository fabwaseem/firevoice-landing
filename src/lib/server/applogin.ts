import "server-only";
import { randomBytes } from "node:crypto";

// The code the browser shows while the app waits: 8 characters people can read and compare (no 0/O/1/I), 40 bits.
// Guessing one is useless without also being signed in and inside its ten minutes, and lookups are rate limited.
const ABC = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function appCode(): string {
  const b = randomBytes(8);
  const s = Array.from(b, (x) => ABC[x % ABC.length]).join("");
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export const APP_LOGIN_MINUTES = 10;
