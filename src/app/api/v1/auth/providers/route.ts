import { connection } from "next/server";
import { json, route } from "@/lib/server/http";
import { googleOn } from "@/lib/server/google";

/** Which ways to sign in are on (the sign-in page shows "Continue with Google" only when it is set up). */
export const GET = route(async () => {
  await connection();
  return json({ google: googleOn(), password: true });
});
