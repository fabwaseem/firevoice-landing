import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { adminRoute } from "@/lib/server/admin";
import { json } from "@/lib/server/http";

/** The event stream, newest first, by cursor (?before=<id>) so it stays fast however long it gets; ?name= and
 * ?install= narrow it. */
export const GET = adminRoute(async (req) => {
  const s = new URL(req.url).searchParams;
  const where: Prisma.EventWhereInput = {};
  const name = s.get("name")?.trim();
  if (name) where.name = name.endsWith("*") ? { startsWith: name.slice(0, -1) } : name;
  if (s.get("install")) where.installId = s.get("install")!;
  const before = s.get("before");
  if (before && /^\d+$/.test(before)) where.id = { lt: BigInt(before) };
  const rows = await db().event.findMany({
    where,
    orderBy: { id: "desc" },
    take: 100,
    select: { id: true, name: true, at: true, props: true, installId: true, country: true, appVersion: true, user: { select: { email: true } } },
  });
  return json({ rows, next: rows.length === 100 ? rows[rows.length - 1].id : null });
});
