import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { WaitlistBody } from "@/lib/server/schemas";

/** "Get notified": an email and what it is for (the macOS version, Pro features, news). Signing up twice is fine. */
export const POST = route(async (req) => {
  const c = client(req);
  rateLimit("waitlist", c.ip);
  const b = await body(req, WaitlistBody, 4 * 1024);
  if (b.website) return json({ ok: true });
  try {
    await db().waitlistEntry.create({
      data: {
        email: b.email,
        interest: b.interest,
        source: b.source,
        ip: c.ip,
        country: c.country,
        city: c.city,
        userAgent: c.userAgent,
        referrer: c.referrer,
      },
    });
    return json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return json({ ok: true, already: true });
    throw e;
  }
});
