"use client";

import { useCallback, useEffect, useState } from "react";

export type WebUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  verified: boolean;
  hasPassword: boolean;
  google: boolean;
  createdAt: string;
};

export class AuthError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

/** A JSON call to this site's API, with the session cookie. */
export async function post<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
  let r: Response;
  try {
    r = await fetch(path, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new AuthError(0, "offline", "No connection. Check your internet and try again.");
  }
  const d = (await r.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!r.ok)
    throw new AuthError(r.status, d.error ?? "error", d.error === "rate_limited" ? "Too many tries. Wait a few minutes and try again." : (d.message ?? "That did not work."));
  return d as T;
}

/** Who is signed in on this browser (null: nobody; undefined: still checking). */
export function useMe() {
  const [me, setMe] = useState<{ user: WebUser; installs: number } | null | undefined>(undefined);
  const load = useCallback(() => {
    fetch("/api/v1/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => (r.ok ? ((await r.json()) as { user: WebUser; installs: number }) : null))
      .then(setMe, () => setMe(null));
  }, []);
  useEffect(load, [load]);
  return { me, reload: load, setMe };
}

/** Whether "Continue with Google" is set up on the server. */
export function useProviders() {
  const [p, setP] = useState<{ google: boolean } | null>(null);
  useEffect(() => {
    fetch("/api/v1/auth/providers", { cache: "no-store" })
      .then((r) => r.json())
      .then(setP, () => setP({ google: false }));
  }, []);
  return p;
}

/** Only a path on this site may be returned to after signing in. */
export function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\") || next.length > 300) return "/account";
  return next;
}
