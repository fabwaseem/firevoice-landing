import "server-only";
import { z } from "zod";

// The server's settings, checked once on first use: a missing or weak secret fails loudly instead of quietly
// running insecure.
const Schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is not set"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  ADMIN_PASSWORD: z.string().min(12, "ADMIN_PASSWORD must be at least 12 characters"),
  LICENSING_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  SMTP_URL: z.string().optional(),
  // Sign in with Google (optional: without both, the button is not shown)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MAIL_FROM: z.string().default("FireVoice <hello@firevoice.fabwaseem.com>"),
  NEXT_PUBLIC_SITE_URL: z.string().default("https://firevoice.fabwaseem.com"),
});

export type Env = z.infer<typeof Schema>;
let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const r = Schema.safeParse(process.env);
  if (!r.success) throw new Error(`Server settings: ${r.error.issues.map((i) => i.message).join("; ")}`);
  return (cached = r.data);
}
