import { connection } from "next/server";
import { env } from "@/lib/server/env";
import { json, route } from "@/lib/server/http";

/** What the app should do, decided here so it can change without a release: whether licences apply, and how often
 * to send what it collects. */
export const GET = route(async () => {
  await connection(); // read the settings when asked, not when the site was built
  return json(
    {
      licensing: env().LICENSING_ENABLED,
      plan: env().LICENSING_ENABLED ? null : "free",
      telemetry: { flushSeconds: 60, heartbeatSeconds: 300, maxBatch: 200 },
    },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
});
