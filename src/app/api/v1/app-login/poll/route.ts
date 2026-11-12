import { db } from "@/lib/server/db";
import { optionalInstall, publicUser } from "@/lib/server/auth";
import { createSession } from "@/lib/server/accounts";
import { sha256 } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { AppLoginPoll } from "@/lib/server/schemas";

/** The app asking "was I approved?" with its poll secret. Once approved, the session is made here and handed over
 * exactly once; a request started by an install can only be collected by that same install. */
export const POST = route(async (req) => {
  const b = await body(req, AppLoginPoll, 1024);
  const pollHash = sha256(b.pollToken);
  rateLimit("poll", pollHash);
  const row = await db().appLogin.findUnique({ where: { pollHash } });
  if (!row) throw new HttpError(404, "unknown", "This sign-in request does not exist.");
  const install = await optionalInstall(req);
  if (row.installId && install?.id !== row.installId) throw new HttpError(403, "forbidden", "This sign-in request belongs to another install.");
  if (row.status === "DENIED") throw new HttpError(410, "denied", "The sign-in was declined in the browser.");
  if (row.status === "USED") throw new HttpError(410, "used", "This sign-in was already completed.");
  if (row.expiresAt < new Date()) throw new HttpError(410, "expired", "The sign-in took too long. Try again.");
  if (row.status === "PENDING") return json({ status: "pending" });

  // APPROVED: only the first poll to flip it to USED gets the session
  const took = await db().appLogin.updateMany({ where: { id: row.id, status: "APPROVED" }, data: { status: "USED" } });
  if (!took.count || !row.userId) throw new HttpError(410, "used", "This sign-in was already completed.");
  const user = await db().user.findUnique({ where: { id: row.userId } });
  if (!user || user.disabledAt) throw new HttpError(403, "disabled", "This account cannot sign in.");
  const token = await createSession(user.id, row.installId ?? install?.id ?? null, client(req));
  return json({ status: "approved", token, user: publicUser(user) });
});
