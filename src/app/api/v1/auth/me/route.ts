import { db } from "@/lib/server/db";
import { publicUser, requireUser } from "@/lib/server/auth";
import { hashPassword, verifyPassword } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { DeleteMe, UpdateMe } from "@/lib/server/schemas";

/** Who is signed in, with their plan (everyone is on Free while licences are off). */
export const GET = route(async (req) => {
  const { user } = await requireUser(req);
  rateLimit("read", user.id);
  const installs = await db().install.count({ where: { userId: user.id, deletedAt: null } });
  return json({ user: publicUser(user), installs });
});

/** Change the name, or the password (with the current one); a new password signs out every other device. */
export const PATCH = route(async (req) => {
  const { user, sessionId } = await requireUser(req);
  const b = await body(req, UpdateMe, 4 * 1024);
  const data: { name?: string | null; passwordHash?: string } = {};
  if (b.name !== undefined) data.name = b.name || null;
  if (b.newPassword) {
    rateLimit("login", client(req).ip);
    if (!b.currentPassword || !(await verifyPassword(b.currentPassword, user.passwordHash)))
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

/** Delete the account (password required). Installs and feedback stay, no longer linked to the person. */
export const DELETE = route(async (req) => {
  const { user } = await requireUser(req);
  rateLimit("login", client(req).ip);
  const b = await body(req, DeleteMe, 4 * 1024);
  if (!(await verifyPassword(b.password, user.passwordHash))) throw new HttpError(401, "wrong_credentials", "The password is not right.");
  await db().user.delete({ where: { id: user.id } });
  return json({ ok: true });
});
