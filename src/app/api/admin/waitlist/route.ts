import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { adminRoute, csv, paging } from "@/lib/server/admin";
import { json } from "@/lib/server/http";

/** The waitlist, newest first; ?interest= narrows it, ?format=csv downloads all of it. */
export const GET = adminRoute(async (req) => {
  const { page, q, take, skip, params } = paging(req);
  const where: Prisma.WaitlistEntryWhereInput = {};
  if (params.get("interest")) where.interest = params.get("interest")!;
  if (q) where.email = { contains: q.toLowerCase() };
  if (params.get("format") === "csv") {
    const all = await db().waitlistEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { email: true, interest: true, source: true, country: true, city: true, createdAt: true },
    });
    return csv(all, `firevoice-waitlist-${new Date().toISOString().slice(0, 10)}.csv`);
  }
  const [rows, total, interests] = await Promise.all([
    db().waitlistEntry.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db().waitlistEntry.count({ where }),
    db().waitlistEntry.groupBy({ by: ["interest"], _count: { _all: true } }),
  ]);
  return json({ rows, total, page, pages: Math.max(1, Math.ceil(total / 50)), interests: interests.map((i) => ({ label: i.interest, n: i._count._all })) });
});
