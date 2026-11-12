import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { currentUser, optionalInstall } from "@/lib/server/auth";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { FeedbackBody } from "@/lib/server/schemas";

const KIND = { bug: "BUG", idea: "IDEA", praise: "PRAISE", other: "OTHER" } as const;

/** Feedback from inside the app (with its install and, when signed in, the person) or from the site's form. */
export const POST = route(async (req) => {
  const c = client(req);
  rateLimit("feedback", c.ip);
  const b = await body(req, FeedbackBody, 32 * 1024);
  // the honeypot was filled in: say thanks and keep nothing
  if (b.website) return json({ ok: true }, { status: 201 });
  const install = await optionalInstall(req);
  const who = install ? await currentUser(req) : null;
  await db().feedback.create({
    data: {
      kind: KIND[b.kind],
      message: b.message,
      email: b.email ?? who?.user.email ?? null,
      rating: b.rating ?? null,
      source: install ? "app" : "web",
      userId: who?.user.id ?? install?.userId ?? null,
      installId: install?.id ?? null,
      appVersion: install?.appVersion ?? null,
      os: install?.os ?? null,
      context: (b.context ?? undefined) as Prisma.InputJsonValue | undefined,
      ip: c.ip,
      country: c.country,
      city: c.city,
      userAgent: c.userAgent,
    },
  });
  return json({ ok: true }, { status: 201 });
});
