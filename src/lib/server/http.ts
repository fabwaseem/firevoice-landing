import "server-only";
import type { z } from "zod";
import { limit, type LimitName } from "./ratelimit";

/** Thrown anywhere in a handler; `route()` turns it into a JSON error response. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
    public headers?: Record<string, string>,
  ) {
    super(message ?? code);
  }
}

const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function json(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return new Response(JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v)), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE, ...init.headers },
  });
}

/** Reads a JSON body of at most `maxBytes` and checks it against `schema`. */
export async function body<T extends z.ZodType>(req: Request, schema: T, maxBytes = 64 * 1024): Promise<z.infer<T>> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new HttpError(415, "unsupported_media_type", "Send JSON.");
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new HttpError(413, "too_large", "The request is too large.");
  // read it ourselves so a body without (or lying about) its length is still cut off
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "invalid", "The request has no body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "too_large", "The request is too large.");
    }
    chunks.push(value);
  }
  let data: unknown;
  try {
    data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "invalid", "The body is not valid JSON.");
  }
  const r = schema.safeParse(data);
  if (!r.success) {
    const first = r.error.issues[0];
    throw new HttpError(400, "invalid", first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid request.");
  }
  return r.data;
}

/** Fails with 429 when `who` went over the named limit. */
export function rateLimit(name: LimitName, who: string | null | undefined) {
  const r = limit(name, who ?? "unknown");
  if (!r.ok) throw new HttpError(429, "rate_limited", "Too many requests. Try again later.", { "Retry-After": String(r.retryAfter) });
}

/** Wraps a route handler: errors become JSON (never a stack trace), unexpected ones are logged. */
export function route<A extends unknown[]>(fn: (req: Request, ...rest: A) => Promise<Response>) {
  return async (req: Request, ...rest: A): Promise<Response> => {
    try {
      return await fn(req, ...rest);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.code, message: e.message }, { status: e.status, headers: e.headers });
      console.error(`[api] ${req.method} ${new URL(req.url).pathname}`, e);
      return json({ error: "server_error", message: "Something went wrong on our side." }, { status: 500 });
    }
  };
}

/** The bearer token in Authorization, if any. */
export function bearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t.length >= 20 && t.length <= 200 ? t : null;
}
