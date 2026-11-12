import { z } from "zod";
import { db } from "@/lib/server/db";
import { adminRoute, audit } from "@/lib/server/admin";
import { body, HttpError, json } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

/** One account: its installs, sign-ins and feedback. */
export const GET = adminRoute(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const user = await db().user.findUnique({
    where: { id },
    omit: { passwordHash: true },
    include: {
      installs: { select: { id: true, os: true, appVersion: true, country: true, city: true, lastSeenAt: true }, orderBy: { lastSeenAt: "desc" } },
      sessions: { select: { id: true, ip: true, country: true, city: true, userAgent: true, createdAt: true, lastUsedAt: true, revokedAt: true, expiresAt: true }, orderBy: { lastUsedAt: "desc" }, take: 30 },
      feedback: { orderBy: { createdAt: "desc" }, take: 30 },
      licenses: { select: { id: true, keyLast4: true, plan: true, status: true, expiresAt: true } },
    },
  });
  if (!user) throw new HttpError(404, "not_found", "No such account.");
  return json({ user });
});

/** Turn an account off (signs it out everywhere) or back on. */
export const PATCH = adminRoute(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const b = await body(req, z.object({ disabled: z.boolean() }), 256);
  await db().$transaction([
    db().user.update({ where: { id }, data: { disabledAt: b.disabled ? new Date() : null } }),
    ...(b.disabled ? [db().session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })] : []),
  ]);
  await audit(req, b.disabled ? "user.disable" : "user.enable", id);
  return json({ ok: true });
});
