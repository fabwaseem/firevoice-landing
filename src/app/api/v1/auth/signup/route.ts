import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { optionalInstall, publicUser } from "@/lib/server/auth";
import { createSession, mailToken } from "@/lib/server/accounts";
import { hashPassword } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { Signup } from "@/lib/server/schemas";

/** A new account, signed in on this install straight away; a confirmation email goes out. */
export const POST = route(async (req) => {
  const c = client(req);
  rateLimit("signup", c.ip);
  const b = await body(req, Signup, 8 * 1024);
  const install = await optionalInstall(req);
  let user;
  try {
    user = await db().user.create({
      data: {
        email: b.email,
        name: b.name || null,
        passwordHash: await hashPassword(b.password),
        signupIp: c.ip,
        signupCountry: c.country,
        signupCity: c.city,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      throw new HttpError(409, "email_taken", "There is already an account with this email. Sign in instead.");
    throw e;
  }
  const token = await createSession(user.id, install?.id ?? null, c);
  await mailToken(user.id, user.email, "VERIFY");
  return json({ token, user: publicUser(user) }, { status: 201 });
});
