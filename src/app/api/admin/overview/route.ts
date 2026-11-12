import { db } from "@/lib/server/db";
import { adminRoute } from "@/lib/server/admin";
import { json } from "@/lib/server/http";

const DAY = 86_400_000;
const n = (v: unknown) => Number(v ?? 0);

/** Everything on the dashboard's first screen for the last ?days= (7 to 365), in parallel queries that each use an
 * index: totals, actives, a day-by-day series and the top versions, systems, places and events. */
export const GET = adminRoute(async (req) => {
  const days = Math.max(7, Math.min(365, Number(new URL(req.url).searchParams.get("days")) || 30));
  const now = new Date();
  const since = new Date(now.getTime() - days * DAY);
  const d1 = new Date(now.getTime() - DAY);
  const d7 = new Date(now.getTime() - 7 * DAY);
  const d30 = new Date(now.getTime() - 30 * DAY);
  const p = db();
  const live = { deletedAt: null };

  const [
    installs,
    newInstalls,
    dau,
    wau,
    mau,
    users,
    newUsers,
    events,
    feedbackNew,
    waitlist,
    crashes,
    series,
    versions,
    systems,
    countries,
    cities,
    topEvents,
    words,
    recent,
    points,
  ] = await Promise.all([
    p.install.count({ where: live }),
    p.install.count({ where: { ...live, firstSeenAt: { gte: since } } }),
    p.install.count({ where: { ...live, lastSeenAt: { gte: d1 } } }),
    p.install.count({ where: { ...live, lastSeenAt: { gte: d7 } } }),
    p.install.count({ where: { ...live, lastSeenAt: { gte: d30 } } }),
    p.user.count(),
    p.user.count({ where: { createdAt: { gte: since } } }),
    p.event.count({ where: { at: { gte: since } } }),
    p.feedback.count({ where: { status: "NEW" } }),
    p.waitlistEntry.count(),
    p.crash.count({ where: { createdAt: { gte: since } } }),
    p.$queryRaw<{ day: Date; active: bigint; events: bigint; words: bigint; seconds: bigint }[]>`
      SELECT "day", COUNT(*) AS active, SUM("events") AS events, SUM("words") AS words, SUM("seconds") AS seconds
      FROM "DailyActive" WHERE "day" >= ${since}::date GROUP BY "day" ORDER BY "day"`,
    p.install.groupBy({ by: ["appVersion"], where: live, _count: { _all: true }, orderBy: { _count: { appVersion: "desc" } }, take: 10 }),
    p.install.groupBy({ by: ["os"], where: live, _count: { _all: true }, orderBy: { _count: { os: "desc" } } }),
    p.install.groupBy({ by: ["country"], where: live, _count: { _all: true }, orderBy: { _count: { country: "desc" } }, take: 15 }),
    p.install.groupBy({
      by: ["city", "country"],
      where: { ...live, city: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 15,
    }),
    p.event.groupBy({ by: ["name"], where: { at: { gte: since } }, _count: { _all: true }, orderBy: { _count: { name: "desc" } }, take: 15 }),
    p.dailyActive.aggregate({ where: { day: { gte: since } }, _sum: { words: true, seconds: true } }),
    p.install.findMany({
      where: live,
      orderBy: { firstSeenAt: "desc" },
      take: 8,
      select: { id: true, os: true, appVersion: true, country: true, city: true, firstSeenAt: true, user: { select: { email: true } } },
    }),
    p.install.findMany({
      where: { ...live, latitude: { not: null }, lastSeenAt: { gte: since } },
      select: { latitude: true, longitude: true },
      take: 2000,
    }),
  ]);

  // a full run of days, with the quiet ones as zero
  const byDay = new Map(series.map((r) => [new Date(r.day).toISOString().slice(0, 10), r]));
  const newByDay = await p.$queryRaw<{ day: Date; n: bigint }[]>`
    SELECT date_trunc('day', "firstSeenAt")::date AS day, COUNT(*) AS n FROM "Install"
    WHERE "firstSeenAt" >= ${since} AND "deletedAt" IS NULL GROUP BY 1`;
  const newMap = new Map(newByDay.map((r) => [new Date(r.day).toISOString().slice(0, 10), n(r.n)]));
  const daily = [];
  for (let t = Math.floor(since.getTime() / DAY) * DAY + DAY; t <= now.getTime(); t += DAY) {
    const k = new Date(t).toISOString().slice(0, 10);
    const r = byDay.get(k);
    daily.push({ day: k, active: n(r?.active), events: n(r?.events), words: n(r?.words), minutes: Math.round(n(r?.seconds) / 60), new: newMap.get(k) ?? 0 });
  }

  return json({
    days,
    totals: {
      installs,
      newInstalls,
      dau,
      wau,
      mau,
      users,
      newUsers,
      events,
      words: n(words._sum.words),
      hours: Math.round(n(words._sum.seconds) / 3600),
      feedbackNew,
      waitlist,
      crashes,
    },
    daily,
    versions: versions.map((r) => ({ label: r.appVersion, n: r._count._all })),
    systems: systems.map((r) => ({ label: r.os, n: r._count._all })),
    countries: countries.map((r) => ({ label: r.country ?? "Unknown", n: r._count._all })),
    cities: cities.map((r) => ({ label: `${r.city}${r.country ? `, ${r.country}` : ""}`, n: r._count._all })),
    events: topEvents.map((r) => ({ label: r.name, n: r._count._all })),
    recent,
    points,
  });
});
