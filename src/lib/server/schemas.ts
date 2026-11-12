import "server-only";
import { z } from "zod";

// What the API accepts. Strings are trimmed and capped; anything unexpected is refused rather than stored.
const str = (max: number) => z.string().trim().max(max);
const opt = (max: number) => str(max).optional().nullable();

export const Email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: "Enter a valid email address" }));

export const Password = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200, "That password is too long");

/** The computer and app, sent when an install registers and whenever something changes. */
export const Device = z.object({
  appVersion: z.string().trim().regex(/^\d+\.\d+\.\d+([-+][\w.]+)?$/, "not a version"),
  channel: opt(20),
  os: z.enum(["windows", "linux", "macos"]),
  osVersion: opt(80),
  arch: opt(20),
  cpu: opt(120),
  cores: z.number().int().min(1).max(1024).optional().nullable(),
  ramGb: z.number().min(0).max(65536).optional().nullable(),
  gpu: opt(160),
  locale: opt(35),
  timezone: opt(64),
  screen: opt(40),
  hostname: opt(120),
});

export const Register = Device.extend({
  // the app hashes the machine's id; a 64-char hex string
  deviceId: z.string().regex(/^[a-f0-9]{64}$/, "not a device id"),
  consent: z.boolean().default(true),
});

export const UpdateInstall = Device.partial().extend({ consent: z.boolean().optional() });

const EventName = z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+){0,3}$/, "not an event name").max(64);
const Props = z
  .record(z.string().max(40), z.union([z.string().max(500), z.number(), z.boolean(), z.null()]))
  .refine((p) => Object.keys(p).length <= 30, "too many properties")
  .optional();

export const Events = z.object({
  events: z
    .array(
      z.object({
        name: EventName,
        at: z.coerce.date(),
        props: Props,
        session: opt(40),
      }),
    )
    .min(1)
    .max(200),
});

export const CrashBody = z.object({
  kind: z.enum(["panic", "backend", "ui"]),
  message: str(2000).min(1),
  stack: opt(20_000),
  context: Props,
});

export const FeedbackBody = z.object({
  kind: z.enum(["bug", "idea", "praise", "other"]),
  message: str(5000).min(3, "Write a little more"),
  email: Email.optional().nullable().or(z.literal("").transform(() => null)),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  context: Props,
  // a field people cannot see: bots fill it in
  website: z.string().max(200).optional(),
});

export const WaitlistBody = z.object({
  email: Email,
  interest: z.enum(["mac", "pro", "news"]).default("news"),
  source: str(40).default("landing"),
  website: z.string().max(200).optional(),
});

export const Signup = z.object({
  email: Email,
  password: Password,
  name: opt(80),
});

export const Login = z.object({ email: Email, password: z.string().min(1).max(200) });
export const TokenBody = z.object({ token: z.string().min(20).max(200) });
export const ResetBody = z.object({ token: z.string().min(20).max(200), password: Password });
export const EmailOnly = z.object({ email: Email });
export const UpdateMe = z.object({
  name: opt(80),
  currentPassword: z.string().max(200).optional(),
  newPassword: Password.optional(),
});
/** Deleting the account: the password, or (an account made with Google, without one) the email typed out. */
export const DeleteMe = z.object({ password: z.string().max(200).optional(), confirmEmail: z.string().trim().toLowerCase().max(254).optional() });
export const AppLoginStart = z.object({ device: z.string().trim().max(120).optional().nullable() });
export const AppLoginPoll = z.object({ pollToken: z.string().min(20).max(200) });
export const AppLoginCode = z.object({ code: z.string().trim().toUpperCase().regex(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/, "not a code") });
export const AppLoginDecide = AppLoginCode.extend({ approve: z.boolean() });
export const ActivateBody = z.object({ key: z.string().trim().toUpperCase().regex(/^FV(-[2-9A-HJ-NP-Z]{5}){4}$/, "not a licence key") });
