import "server-only";
import type { Install } from "@/generated/prisma/client";
import { db } from "./db";
import { env } from "./env";

/** What this install may use. While licensing is off (LICENSING_ENABLED=false) everyone gets everything, free. */
export async function entitlement(install: Install | null, userId: string | null) {
  if (!env().LICENSING_ENABLED) return { licensing: false, plan: "free" as const, status: "active" as const, license: null };
  const now = new Date();
  const activation = install
    ? await db().activation.findFirst({
        where: { installId: install.id, license: { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } },
        include: { license: true },
        orderBy: { createdAt: "desc" },
      })
    : null;
  const license =
    activation?.license ??
    (userId
      ? await db().license.findFirst({
          where: { userId, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          orderBy: { createdAt: "desc" },
        })
      : null);
  if (activation) void db().activation.update({ where: { id: activation.id }, data: { lastCheckAt: now } }).catch(() => {});
  return {
    licensing: true,
    plan: (license?.plan.toLowerCase() ?? "free") as "free" | "pro" | "team",
    status: license ? ("active" as const) : ("none" as const),
    license: license ? { last4: license.keyLast4, plan: license.plan.toLowerCase(), expiresAt: license.expiresAt, seats: license.seats } : null,
  };
}
