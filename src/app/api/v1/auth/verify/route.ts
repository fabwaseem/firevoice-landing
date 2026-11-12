import { db } from "@/lib/server/db";
import { consumeMailToken } from "@/lib/server/accounts";
import { sameOrigin } from "@/lib/server/auth";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { TokenBody } from "@/lib/server/schemas";

/** The link in the confirmation email (the /account/verify page posts its token here). */
export const POST = route(async (req) => {
  sameOrigin(req);
  rateLimit("mail", client(req).ip);
  const b = await body(req, TokenBody, 2 * 1024);
  const userId = await consumeMailToken(b.token, "VERIFY");
  if (!userId) throw new HttpError(400, "bad_link", "This link has expired or was already used.");
  await db().user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  return json({ ok: true });
});
