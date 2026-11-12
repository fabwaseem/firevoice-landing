import { z } from "zod";
import { db } from "@/lib/server/db";
import { adminRoute, audit } from "@/lib/server/admin";
import { body, json } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

/** Mark feedback seen or done. */
export const PATCH = adminRoute(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const b = await body(req, z.object({ status: z.enum(["NEW", "SEEN", "DONE"]) }), 256);
  await db().feedback.update({ where: { id }, data: { status: b.status } });
  await audit(req, "feedback.status", id, { status: b.status });
  return json({ ok: true });
});

export const DELETE = adminRoute(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  await db().feedback.delete({ where: { id } });
  await audit(req, "feedback.delete", id);
  return json({ ok: true });
});
