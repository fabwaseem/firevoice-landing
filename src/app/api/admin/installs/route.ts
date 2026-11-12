import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { adminRoute, list, paging } from "@/lib/server/admin";

/** Installs, most recently seen first; ?q= matches the id, version, place, computer or the person's email. */
export const GET = adminRoute(async (req) => {
  const { page, q, take, skip, params } = paging(req);
  const where: Prisma.InstallWhereInput = { deletedAt: null };
  if (params.get("os")) where.os = params.get("os")!;
  if (q)
    where.OR = [
      { id: q },
      { appVersion: { startsWith: q } },
      { country: { equals: q.toUpperCase() } },
      { city: { contains: q, mode: "insensitive" } },
      { hostname: { contains: q, mode: "insensitive" } },
      { lastIp: { startsWith: q } },
      { user: { email: { contains: q.toLowerCase() } } },
    ];
  const [rows, total] = await Promise.all([
    db().install.findMany({
      where,
      orderBy: { lastSeenAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        appVersion: true,
        os: true,
        osVersion: true,
        country: true,
        city: true,
        lastIp: true,
        hostname: true,
        launches: true,
        consent: true,
        firstSeenAt: true,
        lastSeenAt: true,
        user: { select: { id: true, email: true } },
      },
    }),
    db().install.count({ where }),
  ]);
  return list(rows, total, page);
});
