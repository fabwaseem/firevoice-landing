import { db } from "@/lib/server/db";
import { requireInstall } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";

/** Frees this computer's seat (every licence on this install). */
export const POST = route(async (req) => {
  const install = await requireInstall(req);
  const r = await db().activation.deleteMany({ where: { installId: install.id } });
  return json({ ok: true, removed: r.count });
});
