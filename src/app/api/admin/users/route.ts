import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { adminRoute, list, paging } from "@/lib/server/admin";

/** Accounts, newest first; ?q= matches email or name. */
export const GET = adminRoute(async (req) => {
  const { page, q, take, skip } = paging(req);
  const where: Prisma.UserWhereInput = q
    ? { OR: [{ email: { contains: q.toLowerCase() } }, { name: { contains: q, mode: "insensitive" } }, { id: q }] }
    : {};
  const [rows, total] = await Promise.all([
    db().user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
        disabledAt: true,
        createdAt: true,
        lastSeenAt: true,
        signupCountry: true,
        signupCity: true,
        signupIp: true,
        _count: { select: { installs: true, feedback: true, sessions: true } },
      },
    }),
    db().user.count({ where }),
  ]);
  return list(rows, total, page);
});
