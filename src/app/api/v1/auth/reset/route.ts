import { db } from "@/lib/server/db";
import { consumeMailToken } from "@/lib/server/accounts";
import { hashPassword } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { ResetBody } from "@/lib/server/schemas";

/** A new password from the reset link. Every device is signed out, and the email counts as confirmed. */
export const POST = route(async (req) => {
  rateLimit("mail", client(req).ip);
  const b = await body(req, ResetBody, 4 * 1024);
  const userId = await consumeMailToken(b.token, "RESET");
  if (!userId) throw new HttpError(400, "bad_link", "This link has expired or was already used. Ask for a new one.");
  const passwordHash = await hashPassword(b.password);
  await db().$transaction([
    db().user.update({ where: { id: userId }, data: { passwordHash, emailVerifiedAt: new Date() } }),
    db().session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  return json({ ok: true });
});
