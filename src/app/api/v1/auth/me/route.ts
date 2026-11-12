import { db } from "@/lib/server/db";
import { endWebSession, publicUser, requireUser } from "@/lib/server/auth";
import { hashPassword, verifyPassword } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { DeleteMe, UpdateMe } from "@/lib/server/schemas";

/** Who is signed in (app or browser), with how many computers are signed in to the account. */
export const GET = route(async (req) => {
  const { user } = await requireUser(req);
  rateLimit("read", user.id);
  const installs = await db().install.count({ where: { userId: user.id, deletedAt: null } });
  return json({ user: publicUser(user), installs });
});

/** Change the name, or the password (with the current one; an account made with Google sets its first without).
 * A new password signs out every other app and browser. */
export const PATCH = route(async (req) => {
  const { user, sessionId } = await requireUser(req);
  const b = await body(req, UpdateMe, 4 * 1024);
  const data: { name?: string | null; passwordHash?: string } = {};
  if (b.name !== undefined) data.name = b.name || null;
  if (b.newPassword) {
    rateLimit("login", client(req).ip);
    if (user.passwordHash && !(b.currentPassword && (await verifyPassword(b.currentPassword, user.passwordHash))))
      throw new HttpError(401, "wrong_credentials", "The current password is not right.");
    data.passwordHash = await hashPassword(b.newPassword);
  }
  const updated = await db().$transaction(async (tx) => {
    if (data.passwordHash)
      await tx.session.updateMany({ where: { userId: user.id, id: { not: sessionId }, revokedAt: null }, data: { revokedAt: new Date() } });
    return tx.user.update({ where: { id: user.id }, data });
  });
  return json({ user: publicUser(updated) });
});

/** Delete the account: with the password, or (an account made with Google, without one) the email typed out. */
export const DELETE = route(async (req) => {
  const { user } = await requireUser(req);
  rateLimit("login", client(req).ip);
  const b = await body(req, DeleteMe, 4 * 1024);
  const ok = user.passwordHash ? !!b.password && (await verifyPassword(b.password, user.passwordHash)) : b.confirmEmail === user.email;
  if (!ok) throw new HttpError(401, "wrong_credentials", user.passwordHash ? "The password is not right." : "Type your email exactly to confirm.");
  await db().user.delete({ where: { id: user.id } });
  if (!req.headers.get("x-firevoice-session")) await endWebSession();
  return json({ ok: true });
});
