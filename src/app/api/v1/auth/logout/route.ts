import { db } from "@/lib/server/db";
import { currentUser, endWebSession } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";

/** Signs this app or browser out (the session stops working at once). */
export const POST = route(async (req) => {
  const who = await currentUser(req);
  if (who) await db().session.update({ where: { id: who.sessionId }, data: { revokedAt: new Date() } });
  if (!req.headers.get("x-firevoice-session")) await endWebSession();
  return json({ ok: true });
});
