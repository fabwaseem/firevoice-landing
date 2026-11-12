import { db } from "@/lib/server/db";
import { optionalInstall, publicUser } from "@/lib/server/auth";
import { createSession } from "@/lib/server/accounts";
import { burnPasswordCheck, verifyPassword } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { Login } from "@/lib/server/schemas";

/** Sign in with email and password. The same answer (and the same time) whether the email exists or not. */
export const POST = route(async (req) => {
  const c = client(req);
  rateLimit("login", c.ip);
  const b = await body(req, Login, 4 * 1024);
  rateLimit("login", `email:${b.email}`);
  const user = await db().user.findUnique({ where: { email: b.email } });
  const ok = user ? await verifyPassword(b.password, user.passwordHash) : (await burnPasswordCheck(b.password), false);
  if (!user || !ok) throw new HttpError(401, "wrong_credentials", "That email and password do not match.");
  if (user.disabledAt) throw new HttpError(403, "disabled", "This account is turned off. Contact us if this is a mistake.");
  const install = await optionalInstall(req);
  const token = await createSession(user.id, install?.id ?? null, c);
  return json({ token, user: publicUser(user) });
});
