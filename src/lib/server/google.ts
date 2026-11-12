import "server-only";
import { createHash } from "node:crypto";
import { env } from "./env";

// Sign in with Google: OpenID Connect, authorization code flow with PKCE, done entirely on the server. The browser
// only ever carries the one-time code; the secret, the tokens and the profile stay here.

export const googleOn = () => !!(env().GOOGLE_CLIENT_ID && env().GOOGLE_CLIENT_SECRET);
export const OAUTH_COOKIE = "fv_oauth";
const site = () => env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
export const redirectUri = () => `${site()}/api/auth/google/callback`;

export function challenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function authorizeUrl(state: string, verifier: string) {
  const q = new URLSearchParams({
    client_id: env().GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

export type GoogleProfile = { sub: string; email: string; emailVerified: boolean; name: string | null; picture: string | null };

/** Trades the code for tokens (with the PKCE verifier) and reads who signed in, straight from Google over HTTPS. */
export async function exchange(code: string, verifier: string): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env().GOOGLE_CLIENT_ID!,
      client_secret: env().GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!tokenRes.ok) throw new Error(`google token: ${tokenRes.status}`);
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("google token: no access token");
  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!infoRes.ok) throw new Error(`google userinfo: ${infoRes.status}`);
  const p = (await infoRes.json()) as { sub?: string; email?: string; email_verified?: boolean | string; name?: string; picture?: string };
  if (!p.sub || !p.email) throw new Error("google userinfo: no subject or email");
  return {
    sub: String(p.sub),
    email: p.email.trim().toLowerCase(),
    emailVerified: p.email_verified === true || p.email_verified === "true",
    name: p.name?.slice(0, 80) ?? null,
    picture: p.picture?.startsWith("https://") ? p.picture.slice(0, 500) : null,
  };
}

/** Where to go after signing in: only a path on this site (never "//elsewhere" or a full URL). */
export function safeNext(next: string | null | undefined): string {
  if (!next || next.length > 300 || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\") || /[\r\n]/.test(next)) return "/account";
  return next;
}
