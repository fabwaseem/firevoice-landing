import { z } from "zod";
import { db } from "@/lib/server/db";
import { adminRoute, audit } from "@/lib/server/admin";
import { body, json } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

/** Revoke a licence (or restore it). Revoking frees its seats. */
export const PATCH = adminRoute(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const b = await body(req, z.object({ status: z.enum(["ACTIVE", "REVOKED"]) }), 256);
  await db().$transaction([
    db().license.update({ where: { id }, data: { status: b.status } }),
    ...(b.status === "REVOKED" ? [db().activation.deleteMany({ where: { licenseId: id } })] : []),
  ]);
  await audit(req, `license.${b.status.toLowerCase()}`, id);
  return json({ ok: true });
});
