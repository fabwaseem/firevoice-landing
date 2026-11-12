import { db } from "@/lib/server/db";
import { currentUser, requireInstall } from "@/lib/server/auth";
import { sha256 } from "@/lib/server/crypto";
import { env } from "@/lib/server/env";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { entitlement } from "@/lib/server/licensing";
import { ActivateBody } from "@/lib/server/schemas";

/** Puts a licence key on this install (within its seats). Refused while licensing is off. */
export const POST = route(async (req) => {
  const install = await requireInstall(req);
  rateLimit("login", `license:${install.id}`); // guessing keys is throttled like guessing passwords
  if (!env().LICENSING_ENABLED) throw new HttpError(409, "licensing_off", "FireVoice is free for everyone right now: no key needed.");
  const b = await body(req, ActivateBody, 1024);
  const license = await db().license.findUnique({ where: { keyHash: sha256(b.key) }, include: { activations: true } });
  if (!license || license.status !== "ACTIVE" || (license.expiresAt && license.expiresAt < new Date()))
    throw new HttpError(404, "bad_key", "This key is not valid or has expired.");
  const already = license.activations.some((a) => a.installId === install.id);
  if (!already && license.activations.length >= license.seats)
    throw new HttpError(409, "no_seats", `This key is already used on ${license.seats} computer${license.seats === 1 ? "" : "s"}. Remove one first.`);
  const who = await currentUser(req);
  await db().$transaction([
    db().activation.upsert({
      where: { licenseId_installId: { licenseId: license.id, installId: install.id } },
      create: { licenseId: license.id, installId: install.id },
      update: { lastCheckAt: new Date() },
    }),
    ...(who && !license.userId ? [db().license.update({ where: { id: license.id }, data: { userId: who.user.id } })] : []),
  ]);
  return json(await entitlement(install, who?.user.id ?? null));
});
