import { db } from "@/lib/server/db";
import { requireUser } from "@/lib/server/auth";
import { sha256 } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { AppLoginDecide } from "@/lib/server/schemas";

/** The person approves (or declines) signing the app in as them. Only a pending, unexpired request changes, once. */
export const POST = route(async (req) => {
  const { user } = await requireUser(req);
  rateLimit("approve", user.id);
  const b = await body(req, AppLoginDecide, 512);
  const r = await db().appLogin.updateMany({
    where: { codeHash: sha256(b.code), status: "PENDING", expiresAt: { gt: new Date() } },
    data: b.approve ? { status: "APPROVED", userId: user.id, approvedAt: new Date() } : { status: "DENIED" },
  });
  if (!r.count) throw new HttpError(404, "bad_code", "This sign-in request has expired or was already used. Start again from FireVoice.");
  return json({ ok: true, approved: b.approve });
});
