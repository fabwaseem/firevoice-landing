import { z } from "zod";
import { adminPasswordOk, endAdminSession, isAdmin, sameOrigin, startAdminSession } from "@/lib/server/auth";
import { audit } from "@/lib/server/admin";
import { body, HttpError, json, rateLimit, route } from "@/lib/server/http";
import { client } from "@/lib/server/request";

/** Is the dashboard signed in? */
export const GET = route(async () => json({ admin: await isAdmin() }));

/** Sign in to the dashboard with ADMIN_PASSWORD (8 tries per 15 minutes per IP; failures are logged). */
export const POST = route(async (req) => {
  sameOrigin(req);
  const ip = client(req).ip;
  rateLimit("admin", ip);
  const b = await body(req, z.object({ password: z.string().min(1).max(200) }), 1024);
  if (!adminPasswordOk(b.password)) {
    await audit(req, "admin.login_failed");
    throw new HttpError(401, "wrong_password", "That password is not right.");
  }
  await startAdminSession();
  await audit(req, "admin.login");
  return json({ admin: true });
});

export const DELETE = route(async (req) => {
  sameOrigin(req);
  await endAdminSession();
  return json({ admin: false });
});
