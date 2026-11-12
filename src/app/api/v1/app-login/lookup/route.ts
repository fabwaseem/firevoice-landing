import { db } from "@/lib/server/db";
import { requireUser } from "@/lib/server/auth";
import { sha256 } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { AppLoginCode } from "@/lib/server/schemas";

/** The browser (signed in) shows what is asking to sign in: which computer, from where, when. */
export const POST = route(async (req) => {
  const { user } = await requireUser(req);
  rateLimit("approve", user.id);
  const b = await body(req, AppLoginCode, 512);
  const row = await db().appLogin.findUnique({ where: { codeHash: sha256(b.code) } });
  if (!row || row.status !== "PENDING" || row.expiresAt < new Date())
    throw new HttpError(404, "bad_code", "This sign-in request has expired or was already used. Start again from FireVoice.");
  return json({ device: row.device, country: row.country, city: row.city, createdAt: row.createdAt, expiresAt: row.expiresAt });
});
