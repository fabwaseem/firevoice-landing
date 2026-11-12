import "server-only";
import type { EmailTokenKind } from "@/generated/prisma/client";
import { db } from "./db";
import { randomToken, sha256 } from "./crypto";
import { SESSION_DAYS } from "./auth";
import type { Client } from "./request";
import { sendReset, sendVerify } from "./mail";

/** Signs a person in on this install: a new session token (returned once; only its hash is kept). */
export async function createSession(userId: string, installId: string | null, c: Client) {
  const token = randomToken();
  await db().$transaction([
    db().session.create({
      data: {
        tokenHash: sha256(token),
        userId,
        installId,
        ip: c.ip,
        country: c.country,
        city: c.city,
        userAgent: c.userAgent,
        expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000),
      },
    }),
    db().user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } }),
    ...(installId ? [db().install.update({ where: { id: installId }, data: { userId } })] : []),
  ]);
  return token;
}

const TTL: Record<EmailTokenKind, number> = { VERIFY: 3 * 86_400_000, RESET: 3_600_000 };

/** A one-time link for the email: earlier unused links of the same kind stop working. */
export async function mailToken(userId: string, email: string, kind: EmailTokenKind) {
  const token = randomToken();
  await db().$transaction([
    db().emailToken.updateMany({ where: { userId, kind, usedAt: null }, data: { usedAt: new Date() } }),
    db().emailToken.create({ data: { userId, kind, tokenHash: sha256(token), expiresAt: new Date(Date.now() + TTL[kind]) } }),
  ]);
  await (kind === "VERIFY" ? sendVerify(email, token) : sendReset(email, token));
}

/** Uses up a link from an email: the person it belongs to, or null when it is wrong, used or expired. */
export async function consumeMailToken(token: string, kind: EmailTokenKind) {
  const row = await db().emailToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.kind !== kind || row.usedAt || row.expiresAt < new Date()) return null;
  // only the first of two simultaneous uses wins
  const used = await db().emailToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  return used.count ? row.userId : null;
}
