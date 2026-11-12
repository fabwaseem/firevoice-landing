import "server-only";
import type { Install } from "@/generated/prisma/client";
import { db } from "./db";
import type { Client } from "./request";

/** Where the install is now: kept up to date from each request (only when something changed, to save writes). */
export function geoUpdate(install: Pick<Install, "lastIp" | "country" | "city">, c: Client) {
  const data: Partial<Install> = {};
  if (c.ip && c.ip !== install.lastIp) data.lastIp = c.ip;
  if (c.country && c.country !== install.country) data.country = c.country;
  if (c.city && c.city !== install.city) {
    data.city = c.city;
    data.region = c.region;
    data.latitude = c.latitude;
    data.longitude = c.longitude;
  }
  return data;
}

const DAY = 86_400_000;
const today = (d = new Date()) => new Date(Math.floor(d.getTime() / DAY) * DAY);

/** Adds to the install's row for each day it was used (events, words dictated, seconds in use). */
export async function bumpDaily(installId: string, perDay: Map<number, { events: number; words: number; seconds: number }>) {
  if (!perDay.size) return;
  const rows = [...perDay].map(([day, v]) => ({ day: new Date(day), ...v }));
  // one statement: INSERT ... ON CONFLICT DO UPDATE for every day in the batch
  const values = rows.map((_, i) => `($${i * 4 + 2}::date, $1, $${i * 4 + 3}, $${i * 4 + 4}, $${i * 4 + 5})`).join(", ");
  const params: unknown[] = [installId];
  for (const r of rows) params.push(r.day, r.events, r.words, r.seconds);
  await db().$executeRawUnsafe(
    `INSERT INTO "DailyActive" ("day", "installId", "events", "words", "seconds") VALUES ${values}
     ON CONFLICT ("day", "installId") DO UPDATE SET
       "events" = "DailyActive"."events" + EXCLUDED."events",
       "words" = "DailyActive"."words" + EXCLUDED."words",
       "seconds" = "DailyActive"."seconds" + EXCLUDED."seconds"`,
    ...params,
  );
}

export const dayOf = (d: Date) => today(d).getTime();
