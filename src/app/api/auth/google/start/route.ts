import { cookies } from "next/headers";
import { env } from "@/lib/server/env";
import { randomToken, sign } from "@/lib/server/crypto";
import { route, rateLimit } from "@/lib/server/http";
import { authorizeUrl, googleOn, OAUTH_COOKIE, safeNext } from "@/lib/server/google";
import { client } from "@/lib/server/request";

/** Starts "Continue with Google": a fresh state and PKCE verifier in a signed, httpOnly, ten-minute cookie, then off
 * to Google. ?next= is where to come back to on this site. */
export const GET = route(async (req) => {
  const site = env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (!googleOn()) return Response.redirect(`${site}/signin?error=google_off`, 302);
  rateLimit("oauth", client(req).ip);
  const next = safeNext(new URL(req.url).searchParams.get("next"));
  const state = randomToken(24);
  const verifier = randomToken(48);
  const payload = Buffer.from(JSON.stringify({ state, verifier, next, exp: Date.now() + 600_000 })).toString("base64url");
  (await cookies()).set(OAUTH_COOKIE, sign(payload, env().AUTH_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // sent back on Google's redirect (a top-level navigation)
    path: "/api/auth/google",
    maxAge: 600,
  });
  return new Response(null, { status: 302, headers: { Location: authorizeUrl(state, verifier), "Cache-Control": "no-store" } });
});
