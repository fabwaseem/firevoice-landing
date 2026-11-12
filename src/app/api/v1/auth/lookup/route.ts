import { db } from "@/lib/server/db";
import { sameOrigin } from "@/lib/server/auth";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { EmailOnly } from "@/lib/server/schemas";

/** "Continue with email": which step comes next for this address: the password, Google (an account made with Google
 * and no password), or making a new account. Like most email-first sign-ins this says whether an account exists, so it
 * is kept to the site's own pages and to 20 lookups per 15 minutes per address of origin. */
export const POST = route(async (req) => {
  sameOrigin(req);
  rateLimit("lookup", client(req).ip);
  const b = await body(req, EmailOnly, 1024);
  const user = await db().user.findUnique({ where: { email: b.email }, select: { passwordHash: true, googleId: true, disabledAt: true } });
  if (!user) return json({ next: "signup" });
  if (user.disabledAt) return json({ next: "disabled" });
  return json({ next: user.passwordHash ? "password" : "google", google: !!user.googleId });
});
