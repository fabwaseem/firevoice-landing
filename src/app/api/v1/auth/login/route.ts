import { db } from "@/lib/server/db";
import { publicUser, sameOrigin, startWebSession } from "@/lib/server/auth";
import { burnPasswordCheck, verifyPassword } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { Login } from "@/lib/server/schemas";

/** Sign in on the website with email and password. The same answer (and the same time) whether the email is unknown,
 * the account has no password (made with Google), or the password is wrong. */
export const POST = route(async (req) => {
  sameOrigin(req);
  const c = client(req);
  rateLimit("login", c.ip);
  const b = await body(req, Login, 4 * 1024);
  rateLimit("login", `email:${b.email}`);
  const user = await db().user.findUnique({ where: { email: b.email } });
  const ok = user?.passwordHash ? await verifyPassword(b.password, user.passwordHash) : (await burnPasswordCheck(b.password), false);
  if (!user || !ok) throw new HttpError(401, "wrong_credentials", "That email and password do not match.");
  if (user.disabledAt) throw new HttpError(403, "disabled", "This account is turned off. Contact us if this is a mistake.");
  await startWebSession(user.id, c);
  return json({ user: publicUser(user) });
});
