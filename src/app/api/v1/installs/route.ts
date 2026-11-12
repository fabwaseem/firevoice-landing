import { db } from "@/lib/server/db";
import { randomToken, sha256 } from "@/lib/server/crypto";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";
import { Register } from "@/lib/server/schemas";

/** An install of the app says hello once: it gets an id and a secret token for everything after. A reinstall on the
 * same computer (same device id) gets its old row back with a new token, so the history stays one install. */
export const POST = route(async (req) => {
  const c = client(req);
  rateLimit("register", c.ip);
  const b = await body(req, Register, 16 * 1024);
  const token = randomToken();
  const { deviceId, consent, ...device } = b;
  const where = { ip: c.ip, country: c.country, region: c.region, city: c.city, latitude: c.latitude, longitude: c.longitude };
  const install = await db().install.upsert({
    where: { deviceId },
    create: {
      deviceId,
      consent,
      tokenHash: sha256(token),
      ...device,
      firstIp: where.ip,
      lastIp: where.ip,
      country: where.country,
      region: where.region,
      city: where.city,
      latitude: where.latitude,
      longitude: where.longitude,
    },
    update: {
      tokenHash: sha256(token),
      consent,
      deletedAt: null,
      ...device,
      lastIp: where.ip,
      ...(where.country ? { country: where.country } : {}),
      ...(where.city ? { region: where.region, city: where.city, latitude: where.latitude, longitude: where.longitude } : {}),
      lastSeenAt: new Date(),
    },
    select: { id: true },
  });
  return json({ installId: install.id, token }, { status: 201 });
});
