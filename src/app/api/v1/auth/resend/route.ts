import { requireUser } from "@/lib/server/auth";
import { mailToken } from "@/lib/server/accounts";
import { json, rateLimit, route } from "@/lib/server/http";

/** Sends the confirmation email again. */
export const POST = route(async (req) => {
  const { user } = await requireUser(req);
  rateLimit("mail", `user:${user.id}`);
  if (!user.emailVerifiedAt) await mailToken(user.id, user.email, "VERIFY");
  return json({ ok: true });
});
