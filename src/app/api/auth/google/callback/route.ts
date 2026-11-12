import { cookies } from "next/headers";
import { connection } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { safeEqual, unsign } from "@/lib/server/crypto";
import { startWebSession } from "@/lib/server/auth";
import { route, rateLimit } from "@/lib/server/http";
import { exchange, googleOn, OAUTH_COOKIE, safeNext } from "@/lib/server/google";
import { client } from "@/lib/server/request";

/** Google sends the person back here. The state must match the signed cookie this browser got at the start (so no
 * one else's sign-in can be slipped in), the email must be verified by Google, and then: the account with this Google
 * id, or the account with this email (linked now), or a new account. */
export const GET = route(async (req) => {
  // every sign-in gets its own state and verifier: never built ahead of time
  await connection();
  const site = env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const fail = (why: string) => new Response(null, { status: 302, headers: { Location: `${site}/signin?error=${why}`, "Cache-Control": "no-store" } });
  if (!googleOn()) return fail("google_off");
  const c = client(req);
  rateLimit("oauth", c.ip);

  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, path: "/api/auth/google" });
  const value = raw ? unsign(raw, env().AUTH_SECRET) : null;
  let saved: { state: string; verifier: string; next: string; exp: number } | null = null;
  try {
    saved = value ? JSON.parse(Buffer.from(value, "base64url").toString("utf8")) : null;
  } catch {
    saved = null;
  }
  const q = new URL(req.url).searchParams;
  if (q.get("error")) return fail("google_cancelled");
  const state = q.get("state") ?? "";
  const code = q.get("code") ?? "";
  if (!saved || saved.exp < Date.now() || !state || !safeEqual(state, saved.state) || !code || code.length > 2000) return fail("google_state");

  let p;
  try {
    p = await exchange(code, saved.verifier);
  } catch (e) {
    console.error("[google]", e);
    return fail("google_failed");
  }
  if (!p.emailVerified) return fail("google_unverified");

  const now = new Date();
  let user = await db().user.findUnique({ where: { googleId: p.sub } });
  if (!user) {
    const byEmail = await db().user.findUnique({ where: { email: p.email } });
    if (byEmail) {
      // Google vouches for this address: link it (and count the email as confirmed)
      user = await db().user.update({
        where: { id: byEmail.id },
        data: { googleId: p.sub, emailVerifiedAt: byEmail.emailVerifiedAt ?? now, avatarUrl: byEmail.avatarUrl ?? p.picture, name: byEmail.name ?? p.name },
      });
    } else {
      try {
        user = await db().user.create({
          data: {
            email: p.email,
            googleId: p.sub,
            name: p.name,
            avatarUrl: p.picture,
            emailVerifiedAt: now,
            signupIp: c.ip,
            signupCountry: c.country,
            signupCity: c.city,
          },
        });
      } catch (e) {
        // two tabs finishing at once: the other one made it
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") user = await db().user.findUnique({ where: { googleId: p.sub } });
        else throw e;
      }
    }
  }
  if (!user) return fail("google_failed");
  if (user.disabledAt) return fail("disabled");
  await startWebSession(user.id, c);
  return new Response(null, { status: 302, headers: { Location: `${site}${safeNext(saved.next)}`, "Cache-Control": "no-store" } });
});
