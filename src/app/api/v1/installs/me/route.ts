import { db } from "@/lib/server/db";
import { requireInstall } from "@/lib/server/auth";
import { body, json, route } from "@/lib/server/http";
import { geoUpdate } from "@/lib/server/installs";
import { client } from "@/lib/server/request";
import { UpdateInstall } from "@/lib/server/schemas";

/** The app's details changed (an update, a new graphics card) or the person turned sharing on or off. Turning it off
 * keeps only the install row, so the app can be told apart; its events stop arriving. */
export const PATCH = route(async (req) => {
  const install = await requireInstall(req);
  const b = await body(req, UpdateInstall, 16 * 1024);
  await db().install.update({
    where: { id: install.id },
    data: { ...b, ...geoUpdate(install, client(req)), lastSeenAt: new Date() },
  });
  return json({ ok: true });
});

/** Erase everything this install sent (events, daily activity, crashes); the row is kept only as deleted, so the
 * token stops working and a later registration starts clean. */
export const DELETE = route(async (req) => {
  const install = await requireInstall(req);
  await db().$transaction([
    db().event.deleteMany({ where: { installId: install.id } }),
    db().dailyActive.deleteMany({ where: { installId: install.id } }),
    db().crash.deleteMany({ where: { installId: install.id } }),
    db().session.updateMany({ where: { installId: install.id }, data: { revokedAt: new Date() } }),
    db().install.update({
      where: { id: install.id },
      data: {
        deletedAt: new Date(),
        consent: false,
        userId: null,
        firstIp: null,
        lastIp: null,
        country: null,
        region: null,
        city: null,
        latitude: null,
        longitude: null,
        hostname: null,
        cpu: null,
        gpu: null,
        screen: null,
        launches: 0,
      },
    }),
  ]);
  return json({ ok: true });
});
