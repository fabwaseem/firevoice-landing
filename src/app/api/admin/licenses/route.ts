import { z } from "zod";
import { db } from "@/lib/server/db";
import { adminRoute, audit, list, paging } from "@/lib/server/admin";
import { licenseKey, sha256 } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { body, json } from "@/lib/server/http";
import { Email } from "@/lib/server/schemas";

/** Licences, newest first, and whether licensing is on. */
export const GET = adminRoute(async (req) => {
  const { page, take, skip } = paging(req);
  const [rows, total] = await Promise.all([
    db().license.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
      omit: { keyHash: true },
      include: { user: { select: { email: true } }, _count: { select: { activations: true } } },
    }),
    db().license.count(),
  ]);
  const res = await list(rows, total, page).json();
  return json({ ...res, licensing: env().LICENSING_ENABLED });
});

/** Makes a key. It is in this response only: the database keeps its hash. */
export const POST = adminRoute(async (req) => {
  const b = await body(
    req,
    z.object({
      plan: z.enum(["PRO", "TEAM"]).default("PRO"),
      seats: z.number().int().min(1).max(1000).default(1),
      days: z.number().int().min(1).max(3650).optional().nullable(),
      email: Email.optional().nullable(),
      note: z.string().trim().max(200).optional().nullable(),
    }),
    2048,
  );
  const key = licenseKey();
  const user = b.email ? await db().user.findUnique({ where: { email: b.email }, select: { id: true } }) : null;
  const license = await db().license.create({
    data: {
      keyHash: sha256(key),
      keyLast4: key.slice(-4),
      plan: b.plan,
      seats: b.seats,
      note: b.note ?? null,
      userId: user?.id ?? null,
      expiresAt: b.days ? new Date(Date.now() + b.days * 86_400_000) : null,
    },
    omit: { keyHash: true },
  });
  await audit(req, "license.create", license.id, { plan: b.plan, seats: b.seats });
  return json({ license, key }, { status: 201 });
});
