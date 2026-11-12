import { db } from "@/lib/server/db";
import { optionalInstall } from "@/lib/server/auth";
import { randomToken, sha256 } from "@/lib/server/crypto";
import { body, json, rateLimit, route } from "@/lib/server/http";
import { APP_LOGIN_MINUTES, appCode } from "@/lib/server/applogin";
import { client } from "@/lib/server/request";
import { AppLoginStart } from "@/lib/server/schemas";

/** The app wants to sign in: a code for the browser (the app opens /link?code=...) and a poll secret only the app
 * keeps. Both are stored as hashes; the request lasts ten minutes. */
export const POST = route(async (req) => {
  const c = client(req);
  rateLimit("applogin", c.ip);
  const b = await body(req, AppLoginStart, 1024);
  const install = await optionalInstall(req);
  const code = appCode();
  const pollToken = randomToken();
  await db().appLogin.create({
    data: {
      codeHash: sha256(code),
      pollHash: sha256(pollToken),
      installId: install?.id ?? null,
      device: b.device ?? install?.hostname ?? null,
      ip: c.ip,
      country: c.country,
      city: c.city,
      expiresAt: new Date(Date.now() + APP_LOGIN_MINUTES * 60_000),
    },
  });
  // old requests are cleared now and then, so the table stays small
  if (Math.random() < 0.05) void db().appLogin.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 86_400_000) } } }).catch(() => {});
  return json({ code, pollToken, expiresIn: APP_LOGIN_MINUTES * 60, interval: 2 }, { status: 201 });
});
