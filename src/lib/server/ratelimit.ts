import "server-only";

// A sliding-window limiter in memory: the site runs as one server process, so this is exact and needs no extra
// service. Each key keeps the times of its recent hits; old keys are swept so memory stays bounded.
type Bucket = number[];
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 100_000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000 && buckets.size < MAX_KEYS) return;
  lastSweep = now;
  for (const [k, hits] of buckets) if (!hits.length || now - hits[hits.length - 1] > 3_600_000) buckets.delete(k);
  // still too many (an attack spraying keys): drop the oldest half
  if (buckets.size >= MAX_KEYS) {
    let i = 0;
    for (const k of buckets.keys()) if (i++ % 2 === 0) buckets.delete(k);
  }
}

/** True when `key` may go ahead: at most `limit` hits in the last `windowMs`. */
export function allow(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const hits = buckets.get(key) ?? [];
  while (hits.length && now - hits[0] >= windowMs) hits.shift();
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, retryAfter: 0 };
}

/** The limits per kind of request (per IP unless said otherwise). */
export const LIMITS = {
  register: [20, 3_600_000], // installs registering
  events: [120, 60_000], // per install: a batch every few seconds at most
  crash: [30, 3_600_000], // per install
  feedback: [10, 3_600_000],
  waitlist: [8, 3_600_000],
  login: [10, 900_000], // per IP and per email
  signup: [6, 3_600_000],
  mail: [5, 3_600_000], // forgot password / resend verification, per IP and per email
  admin: [8, 900_000], // admin sign-in attempts
  read: [240, 60_000], // reads by a signed-in app
  applogin: [20, 3_600_000], // the app asking to sign in through the browser
  poll: [60, 60_000], // the app checking whether it was approved (per request)
  approve: [30, 900_000], // looking up or approving codes in the browser (per person)
  oauth: [30, 900_000], // Google sign-in starts and returns
} as const satisfies Record<string, readonly [number, number]>;

export type LimitName = keyof typeof LIMITS;
export const limit = (name: LimitName, who: string) => allow(`${name}:${who}`, LIMITS[name][0], LIMITS[name][1]);
