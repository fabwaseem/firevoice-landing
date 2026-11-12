"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { post, safeNext, useMe, useProviders } from "@/components/auth/client";
import { ArrowRight, Loader2, MailCheck, Monitor } from "@/components/icons";

const ERRORS: Record<string, string> = {
  google_off: "Signing in with Google is not set up here yet. Use your email for now.",
  google_cancelled: "Google sign-in was cancelled.",
  google_state: "That Google sign-in had expired. Try again.",
  google_failed: "Google sign-in did not work. Try again.",
  google_unverified: "That Google account's email is not verified.",
  disabled: "This account is turned off. Contact us if this is a mistake.",
};

type Step = "start" | "password" | "google" | "signup" | "sent";

const TITLES: Record<Step, [string, string]> = {
  start: ["Welcome to FireVoice", "Sign in, or create your free account."],
  password: ["Welcome back", "Enter your password to sign in."],
  google: ["Continue with Google", "This account signs in with Google."],
  signup: ["Create your account", "Free, and it only takes a moment."],
  sent: ["Check your email", "If there is an account for this email, a link to choose a password is on its way."],
};

/** "Get started": Google first, or an email; then the step that email needs (its password, Google, or a new
 * account). Afterwards back to where the person came from: the app's sign-in request or their account. */
export function SignIn() {
  const params = useSearchParams();
  const router = useRouter();
  const next = safeNext(params.get("next"));
  const fromApp = next.startsWith("/link");
  const providers = useProviders();
  const { me } = useMe();
  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(ERRORS[params.get("error") ?? ""] ?? null);
  const focusRef = useRef<HTMLInputElement>(null);

  // already signed in on this browser: straight on
  useEffect(() => {
    if (me) router.replace(next);
  }, [me, next, router]);
  // each step puts the cursor where the typing goes
  useEffect(() => {
    focusRef.current?.focus();
  }, [step]);

  const go = (s: Step) => {
    setError(null);
    setStep(s);
  };

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const onEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    run(async () => {
      const r = await post<{ next: "password" | "google" | "signup" | "disabled" }>("/api/v1/auth/lookup", { email: v });
      setEmail(v);
      if (r.next === "disabled") throw new Error(ERRORS.disabled);
      setStep(r.next);
    });
  };
  const onPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    run(async () => {
      await post("/api/v1/auth/login", { email, password });
      router.replace(next);
    });
  };
  const onSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(async () => {
      await post("/api/v1/auth/signup", { email, password: String(f.get("password") ?? ""), name: String(f.get("name") ?? "").trim() || null });
      router.replace(next);
    });
  };
  const onForgot = () =>
    run(async () => {
      await post("/api/v1/auth/forgot", { email });
      setStep("sent");
    });

  // Google is always offered; where it is not set up, the server sends the person back here with a clear message
  const google = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
  const googleReady = providers?.google !== false;
  const [title, sub] = TITLES[step];

  return (
    <div key={step} className="animate-[fade-up_0.4s_cubic-bezier(0.25,1,0.5,1)_both]">
      {fromApp && step === "start" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-fire/20 bg-fire-soft px-4 py-3 text-[14px] text-ink-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-fire text-white">
            <Monitor className="size-4" />
          </span>
          Sign in here to finish signing in to the FireVoice app.
        </div>
      )}

      <h1 className="display display-md">{title}</h1>
      <p className="mt-2 text-[15.5px] text-muted">{sub}</p>

      {email && step !== "start" && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-[var(--shadow-sm)]">
          <span className="flex min-w-0 items-center gap-2.5 text-[14.5px]">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-3 text-[12px] font-semibold text-ink-2 uppercase">{email[0]}</span>
            <span className="truncate font-medium">{email}</span>
          </span>
          <button type="button" onClick={() => go("start")} className="shrink-0 text-[13.5px] font-medium text-fire-ink hover:underline">
            Change
          </button>
        </div>
      )}

      <div className="mt-7">
        {step === "start" && (
          <>
            <GoogleButton href={google} muted={!googleReady} />
            <Divider />
            <form onSubmit={onEmail} className="space-y-4">
              <Field ref={focusRef} name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" defaultValue={email} />
              <ErrorText text={error} />
              <Submit busy={busy}>Continue with email</Submit>
            </form>
          </>
        )}

        {step === "password" && (
          <form onSubmit={onPassword} className="space-y-4">
            <Field
              ref={focusRef}
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              aside={
                <button type="button" onClick={onForgot} disabled={busy} className="text-[13px] font-medium text-fire-ink hover:underline">
                  Forgot password?
                </button>
              }
            />
            <ErrorText text={error} />
            <Submit busy={busy}>Sign in</Submit>
          </form>
        )}

        {step === "google" && (
          <div className="space-y-4">
            <GoogleButton href={google} muted={!googleReady} />
            <button type="button" onClick={onForgot} disabled={busy} className="btn btn-line w-full">
              Email me a link to set a password
            </button>
            <ErrorText text={error} />
          </div>
        )}

        {step === "signup" && (
          <form onSubmit={onSignup} className="space-y-4">
            <Field name="name" label="Name" hint="optional" placeholder="Your name" autoComplete="name" maxLength={80} required={false} />
            <Field ref={focusRef} name="password" type="password" label="Password" hint="10+ characters" autoComplete="new-password" minLength={10} />
            <ErrorText text={error} />
            <Submit busy={busy}>Create account</Submit>
          </form>
        )}

        {step === "sent" && (
          <div role="status" className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-sm)]">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                <MailCheck className="size-5" trigger="manual" active />
              </span>
              <p className="text-[14px] text-ink-2">The link works for one hour. Check your spam folder if it does not arrive.</p>
            </div>
            <button type="button" onClick={() => go("password")} className="btn btn-line w-full">
              Back to sign in
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-[12.5px] leading-relaxed text-faint">
        By continuing you agree to how we handle data in the{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-ink">
          privacy policy
        </a>
        . Your voice and words never leave your computer.
      </p>
    </div>
  );
}

function GoogleButton({ href, muted }: { href: string; muted: boolean }) {
  return (
    <a
      href={href}
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-surface text-[15px] font-semibold text-ink shadow-[var(--shadow-sm)] transition hover:bg-surface-2 hover:shadow-[var(--shadow-md)] ${muted ? "opacity-80" : ""}`}
    >
      <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      Continue with Google
      <ArrowRight className="size-4 text-muted" />
    </a>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-[12.5px] font-medium text-faint" aria-hidden>
      <span className="h-px flex-1 bg-line-strong" />
      or with email
      <span className="h-px flex-1 bg-line-strong" />
    </div>
  );
}

function Field({
  ref,
  label,
  hint,
  aside,
  required = true,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; aside?: ReactNode; ref?: React.Ref<HTMLInputElement> }) {
  const id = `f-${rest.name}`;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13.5px] font-semibold text-ink-2">
          {label} {hint && <span className="font-normal text-faint">({hint})</span>}
        </label>
        {aside}
      </div>
      <input
        id={id}
        ref={ref}
        required={required}
        maxLength={rest.maxLength ?? (rest.type === "email" ? 254 : 200)}
        className="h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[15.5px] text-ink shadow-[var(--shadow-sm)] outline-none transition placeholder:text-faint focus:border-fire focus:ring-4 focus:ring-fire-soft"
        {...rest}
      />
    </div>
  );
}

function Submit({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="btn btn-fire btn-lg w-full disabled:opacity-60">
      {busy ? (
        <Loader2 className="size-4 animate-spin" aria-label="Working" />
      ) : (
        children
      )}
    </button>
  );
}

function ErrorText({ text }: { text: string | null }) {
  return (
    <p aria-live="polite" className={`text-[13.5px] text-[#dc4444] ${text ? "min-h-5" : "min-h-0"}`}>
      {text}
    </p>
  );
}
