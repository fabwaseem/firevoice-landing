import "server-only";
import { cookies } from "next/headers";
import type { Install, User } from "@/generated/prisma/client";
import { db } from "./db";
import { env } from "./env";
import { randomToken, sign, unsign, sha256, safeEqual } from "./crypto";
import { bearer, HttpError } from "./http";

// Three kinds of caller:
//   an install of the desktop app:  "Authorization: Bearer <install token>" plus, when signed in,
//                                   "X-FireVoice-Session: <session token>" (signed in through the browser)
//   a person on the website:         the same kind of session token, in an httpOnly cookie
//   the admin:                       a signed, short-lived cookie (ADMIN_PASSWORD at /admin)

export const SESSION_DAYS = 90;
export const WEB_SESSION_DAYS = 30;
const PROD = process.env.NODE_ENV === "production";
// __Host-: only over HTTPS, only this exact host, path "/" (no subdomain can set or read it)
export const WEB_COOKIE = PROD ? "__Host-fv_session" : "fv_session";
export const ADMIN_COOKIE = "fv_admin";
const ADMIN_HOURS = 12;

/** The install making the request, or a 401. Deleted installs (the person asked to erase their data) stay out. */
export async function requireInstall(req: Request): Promise<Install> {
  const token = bearer(req);
  if (!token) throw new HttpError(401, "unauthorized", "This install is not registered.");
  const install = await db().install.findUnique({ where: { tokenHash: sha256(token) } });
  if (!install || install.deletedAt) throw new HttpError(401, "unauthorized", "This install is not registered.");
  return install;
}

export async function optionalInstall(req: Request): Promise<Install | null> {
  return bearer(req) ? requireInstall(req).catch(() => null) : null;
}

export type SignedIn = { user: User; sessionId: string };

async function sessionFrom(token: string | null | undefined): Promise<SignedIn | null> {
  if (!token || token.length < 20 || token.length > 200) return null;
  const s = await db().session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!s || s.revokedAt || s.expiresAt < new Date() || s.user.disabledAt) return null;
  // touched at most every 5 minutes, so a busy app does not write on every request
  if (Date.now() - s.lastUsedAt.getTime() > 300_000) {
    const now = new Date();
    void db()
      .$transaction([
        db().session.update({ where: { id: s.id }, data: { lastUsedAt: now } }),
        db().user.update({ where: { id: s.userId }, data: { lastSeenAt: now } }),
      ])
      .catch(() => {});
  }
  return { user: s.user, sessionId: s.id };
}

/** The signed-in person: the app's session header, or the site's cookie. A cookie-signed request that changes
 * something must come from this site's own pages (the cookie is SameSite=Lax too). */
export async function currentUser(req: Request): Promise<SignedIn | null> {
  const header = req.headers.get("x-firevoice-session");
  if (header) return sessionFrom(header);
  const cookie = (await cookies()).get(WEB_COOKIE)?.value;
  if (!cookie) return null;
  if (req.method !== "GET" && req.method !== "HEAD") sameOrigin(req);
  return sessionFrom(cookie);
}

/** Signs a person in on this browser: a new web session, its token only in the httpOnly cookie. */
export async function startWebSession(userId: string, c: { ip: string | null; country: string | null; city: string | null; userAgent: string | null }) {
  const token = randomToken();
  await db().$transaction([
    db().session.create({
      data: {
        tokenHash: sha256(token),
        userId,
        kind: "web",
        ip: c.ip,
        country: c.country,
        city: c.city,
        userAgent: c.userAgent,
        expiresAt: new Date(Date.now() + WEB_SESSION_DAYS * 86_400_000),
      },
    }),
    db().user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } }),
  ]);
  (await cookies()).set(WEB_COOKIE, token, {
    httpOnly: true,
    secure: PROD,
    sameSite: "lax", // lax, not strict: coming back from Google's sign-in is a cross-site navigation
    path: "/",
    maxAge: WEB_SESSION_DAYS * 86_400,
  });
}

export async function endWebSession() {
  (await cookies()).delete(WEB_COOKIE);
}

export async function requireUser(req: Request): Promise<SignedIn> {
  const u = await currentUser(req);
  if (!u) throw new HttpError(401, "signed_out", "Sign in first.");
  return u;
}

/** What the app and site get to see about a person. */
export const publicUser = (u: User) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl,
  verified: !!u.emailVerifiedAt,
  hasPassword: !!u.passwordHash,
  google: !!u.googleId,
  createdAt: u.createdAt,
});

// ---------------------------------------------------------------- admin

export function adminPasswordOk(given: string): boolean {
  return safeEqual(given, env().ADMIN_PASSWORD);
}

export async function startAdminSession() {
  const until = Date.now() + ADMIN_HOURS * 3_600_000;
  (await cookies()).set(ADMIN_COOKIE, sign(`admin:${until}`, env().AUTH_SECRET), {
    httpOnly: true,
    secure: PROD,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_HOURS * 3600,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  const value = raw ? unsign(raw, env().AUTH_SECRET) : null;
  const until = value?.startsWith("admin:") ? Number(value.slice(6)) : 0;
  return until > Date.now();
}

/** Admin requests: signed in, and (for anything that changes data) sent by this site's own pages. */
export async function requireAdmin(req: Request) {
  if (!(await isAdmin())) throw new HttpError(401, "unauthorized", "Sign in to the dashboard.");
  if (req.method !== "GET") sameOrigin(req);
}

/** Refuses a cross-site request that changes data (the cookies are SameSite=Strict too; this is the second lock). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) throw new HttpError(403, "forbidden", "Cross-site request refused.");
  try {
    if (new URL(origin).host !== host) throw new Error();
  } catch {
    throw new HttpError(403, "forbidden", "Cross-site request refused.");
  }
}
