import "server-only";

/** Where a request came from. The site sits behind Cloudflare (the origin refuses anything else), so its headers are
 * trusted: the visitor's IP, country, and, with Cloudflare's "Add visitor location headers" managed transform turned
 * on, the region, city and coordinates. Without Cloudflare (local development) the forwarded IP is used and there is
 * no location. */
export type Client = {
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  userAgent: string | null;
  referrer: string | null;
};

const clip = (s: string | null, n: number) => (s ? s.slice(0, n) : null);
const num = (s: string | null) => {
  const v = s === null ? NaN : Number(s);
  return Number.isFinite(v) ? v : null;
};
// Cloudflare's headers are latin-1 percent-encoded for cities like "São Paulo"
const text = (s: string | null) => {
  if (!s) return null;
  try {
    return decodeURIComponent(escape(s));
  } catch {
    return s;
  }
};

export function client(req: Request): Client {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ip = h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? forwarded;
  const country = h.get("cf-ipcountry");
  return {
    ip: clip(ip, 64),
    // XX: unknown, T1: Tor
    country: country && country !== "XX" ? country.slice(0, 2).toUpperCase() : null,
    region: clip(text(h.get("cf-region")), 80),
    city: clip(text(h.get("cf-ipcity")), 80),
    latitude: num(h.get("cf-iplatitude")),
    longitude: num(h.get("cf-iplongitude")),
    userAgent: clip(h.get("user-agent"), 400),
    referrer: clip(h.get("referer"), 400),
  };
}
