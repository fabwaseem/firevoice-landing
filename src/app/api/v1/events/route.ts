import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { currentUser, requireInstall } from "@/lib/server/auth";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { bumpDaily, dayOf, geoUpdate } from "@/lib/server/installs";
import { client } from "@/lib/server/request";
import { Events } from "@/lib/server/schemas";

const WEEK = 7 * 86_400_000;
const PROPS_MAX = 4096;

/** A batch of what the app did (up to 200 events). Times come from the computer, so they are kept within the last
 * week and never in the future. Also keeps the install's "last seen", launches, location and daily activity. */
export const POST = route(async (req) => {
  const install = await requireInstall(req);
  rateLimit("events", install.id);
  const b = await body(req, Events, 512 * 1024);
  // sharing turned off: accepted and dropped, so an old app that still sends is not retried forever
  if (!install.consent) return json({ ok: true, stored: 0 }, { status: 202 });

  const c = client(req);
  const who = await currentUser(req);
  const now = Date.now();
  let launches = 0;
  const perDay = new Map<number, { events: number; words: number; seconds: number }>();

  const rows: Prisma.EventCreateManyInput[] = [];
  for (const e of b.events) {
    const at = new Date(Math.min(now, Math.max(now - WEEK, e.at.getTime() || now)));
    let props = e.props ?? undefined;
    if (props && JSON.stringify(props).length > PROPS_MAX) props = { truncated: true };
    rows.push({
      installId: install.id,
      userId: who?.user.id ?? install.userId,
      name: e.name,
      at,
      props: props as Prisma.InputJsonValue | undefined,
      session: e.session ?? null,
      appVersion: install.appVersion,
      ip: c.ip,
      country: c.country ?? install.country,
    });
    if (e.name === "app.launch") launches++;
    const d = dayOf(at);
    const day = perDay.get(d) ?? { events: 0, words: 0, seconds: 0 };
    day.events++;
    const n = (k: string, max: number) => {
      const v = props?.[k];
      return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0;
    };
    if (e.name === "dictation.done") day.words += n("words", 5000);
    if (e.name === "app.heartbeat") day.seconds += n("seconds", 900);
    perDay.set(d, day);
  }

  await db().$transaction(async (tx) => {
    await tx.event.createMany({ data: rows });
    await tx.install.update({
      where: { id: install.id },
      data: {
        lastSeenAt: new Date(),
        ...(launches ? { launches: { increment: launches } } : {}),
        ...(who && who.user.id !== install.userId ? { userId: who.user.id } : {}),
        ...geoUpdate(install, c),
      },
    });
  });
  await bumpDaily(install.id, perDay);
  return json({ ok: true, stored: rows.length }, { status: 202 });
});
