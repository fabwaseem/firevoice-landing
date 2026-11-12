import { currentUser, optionalInstall } from "@/lib/server/auth";
import { json, rateLimit, route } from "@/lib/server/http";
import { entitlement } from "@/lib/server/licensing";
import { client } from "@/lib/server/request";

/** The plan this install is on. While FireVoice is free, always { licensing: false, plan: "free" }. */
export const GET = route(async (req) => {
  rateLimit("read", client(req).ip);
  const install = await optionalInstall(req);
  const who = install ? await currentUser(req) : null;
  return json(await entitlement(install, who?.user.id ?? install?.userId ?? null));
});
