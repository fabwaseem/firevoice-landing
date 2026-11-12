import { db } from "@/lib/server/db";
import { adminRoute, list, paging } from "@/lib/server/admin";

/** Crash reports, newest first; ?q= matches the message or version. */
export const GET = adminRoute(async (req) => {
  const { page, q, take, skip } = paging(req);
  const where = q ? { OR: [{ message: { contains: q, mode: "insensitive" as const } }, { appVersion: { startsWith: q } }] } : {};
  const [rows, total] = await Promise.all([
    db().crash.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
    db().crash.count({ where }),
  ]);
  return list(rows, total, page);
});
