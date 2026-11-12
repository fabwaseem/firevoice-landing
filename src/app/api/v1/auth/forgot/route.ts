import { after } from "next/server";
import { db } from "@/lib/server/db";
import { mailToken } from "@/lib/server/accounts";
import { sameOrigin } from "@/lib/server/auth";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { EmailOnly } from "@/lib/server/schemas";

/** "Forgot password": always the same answer, so it cannot be used to find out who has an account. The mail goes
 * out after the response, so the timing does not tell either. */
export const POST = route(async (req) => {
  sameOrigin(req);
  rateLimit("mail", client(req).ip);
  const b = await body(req, EmailOnly, 2 * 1024);
  rateLimit("mail", `email:${b.email}`);
  after(async () => {
    const user = await db().user.findUnique({ where: { email: b.email } });
    if (user && !user.disabledAt) await mailToken(user.id, user.email, "RESET");
  });
  return json({ ok: true });
});
