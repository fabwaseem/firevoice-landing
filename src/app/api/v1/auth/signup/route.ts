import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { publicUser, sameOrigin, startWebSession } from "@/lib/server/auth";
import { mailToken } from "@/lib/server/accounts";
import { hashPassword } from "@/lib/server/crypto";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { Signup } from "@/lib/server/schemas";

/** A new account, made on the website (signed in on this browser straight away); a confirmation email goes out. */
export const POST = route(async (req) => {
  sameOrigin(req);
  const c = client(req);
  rateLimit("signup", c.ip);
  const b = await body(req, Signup, 8 * 1024);
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
  await startWebSession(user.id, c);
  await mailToken(user.id, user.email, "VERIFY");
  return json({ user: publicUser(user) }, { status: 201 });
});
