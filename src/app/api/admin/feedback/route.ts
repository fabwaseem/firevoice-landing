import type { FeedbackStatus, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { adminRoute, list, paging } from "@/lib/server/admin";

const STATUS = ["NEW", "SEEN", "DONE"];

/** Feedback, newest first; ?status= and ?q= narrow it. */
export const GET = adminRoute(async (req) => {
  const { page, q, take, skip, params } = paging(req);
  const where: Prisma.FeedbackWhereInput = {};
  const status = params.get("status")?.toUpperCase();
  if (status && STATUS.includes(status)) where.status = status as FeedbackStatus;
  if (q) where.OR = [{ message: { contains: q, mode: "insensitive" } }, { email: { contains: q.toLowerCase() } }];
  const [rows, total] = await Promise.all([
    db().feedback.findMany({ where, orderBy: { createdAt: "desc" }, take, skip, include: { user: { select: { email: true } } } }),
    db().feedback.count({ where }),
  ]);
  return list(rows, total, page);
});
