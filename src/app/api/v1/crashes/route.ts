import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/server/db";
import { requireInstall } from "@/lib/server/auth";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { CrashBody } from "@/lib/server/schemas";

/** Something broke in the app (a panic in the shell, the engine stopping, an error in the window). Kept only for
 * installs that share usage. */
export const POST = route(async (req) => {
  const install = await requireInstall(req);
  rateLimit("crash", install.id);
  const b = await body(req, CrashBody, 64 * 1024);
  if (!install.consent) return json({ ok: true }, { status: 202 });
  await db().crash.create({
    data: {
      installId: install.id,
      appVersion: install.appVersion,
      os: install.os,
      kind: b.kind,
      message: b.message,
      stack: b.stack ?? null,
      context: (b.context ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  return json({ ok: true }, { status: 201 });
});
