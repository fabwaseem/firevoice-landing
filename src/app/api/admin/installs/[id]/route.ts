import { db } from "@/lib/server/db";
import { adminRoute } from "@/lib/server/admin";
import { HttpError, json } from "@/lib/server/http";

/** One install: its computer, place, person, last 100 events, last 60 days of activity, crashes and feedback. */
export const GET = adminRoute(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const install = await db().install.findUnique({
    where: { id },
    omit: { tokenHash: true },
    include: {
      user: { select: { id: true, email: true, name: true } },
      events: { orderBy: { at: "desc" }, take: 100, select: { id: true, name: true, at: true, props: true, session: true, country: true, ip: true } },
      daily: { orderBy: { day: "desc" }, take: 60 },
      crashes: { orderBy: { createdAt: "desc" }, take: 20 },
      feedback: { orderBy: { createdAt: "desc" }, take: 20 },
      activations: { include: { license: { select: { keyLast4: true, plan: true, status: true } } } },
    },
  });
  if (!install) throw new HttpError(404, "not_found", "No such install.");
  const totals = await db().event.groupBy({ by: ["name"], where: { installId: id }, _count: { _all: true }, orderBy: { _count: { name: "desc" } }, take: 20 });
  return json({ install, totals: totals.map((t) => ({ label: t.name, n: t._count._all })) });
});
