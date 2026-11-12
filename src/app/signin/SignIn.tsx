"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { post, safeNext, useMe, useProviders } from "@/components/auth/client";
import { Pill } from "@/site/ui";

const ERRORS: Record<string, string> = {
  google_off: "Signing in with Google is not available right now.",
  google_cancelled: "Google sign-in was cancelled.",
  google_state: "That Google sign-in had expired. Try again.",
  google_failed: "Google sign-in did not work. Try again.",
  google_unverified: "That Google account's email is not verified.",
  disabled: "This account is turned off. Contact us if this is a mistake.",
};

type Step = "start" | "password" | "google" | "signup" | "forgot" | "sent";

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

  const google = providers?.google ? `/api/auth/google/start?next=${encodeURIComponent(next)}` : null;

  return (
    <div className="relative">
      {/* the pill, perched on the card's corner */}
      <div aria-hidden className="pointer-events-none absolute -top-5 -right-3 z-10 rotate-[8deg] sm:-right-6">
        <Pill state={step === "sent" ? "done" : "listening"} level={0.55} size="md" />
      </div>
      <div className="rounded-[28px] bg-surface px-6 pt-10 pb-8 shadow-[0_30px_60px_-30px_rgba(23,19,15,0.35)] sm:px-9">
        {fromApp && step === "start" && (
          <p className="mb-5 rounded-2xl bg-fire-soft px-4 py-3 text-center text-[14px] text-ink-2">Sign in to finish signing in to the FireVoice app.</p>
        )}

        {step === "start" && (
          <Panel title="Get started">
            {google && (
              <>
                <OAuthButton href={google} label="Continue with Google" icon={<GoogleIcon />} />
                <div className="my-6 text-center text-[13px] text-muted">or</div>
              </>
            )}
            <form onSubmit={onEmail} className="space-y-5">
              <UnderlineInput ref={focusRef} name="email" type="email" label="Email" placeholder="Enter your email" autoComplete="email" defaultValue={email} />
              <ErrorText text={error} />
              <Submit busy={busy}>Continue</Submit>
            </form>
          </Panel>
        )}

        {step === "password" && (
          <Panel title="Welcome back" email={email} onChange={() => go("start")}>
            <form onSubmit={onPassword} className="space-y-5">
              <UnderlineInput ref={focusRef} name="password" type="password" label="Password" placeholder="Your password" autoComplete="current-password" />
              <ErrorText text={error} />
              <Submit busy={busy}>Sign in</Submit>
              <button type="button" onClick={onForgot} disabled={busy} className="mx-auto block text-[13.5px] text-muted underline-offset-4 hover:text-ink hover:underline">
                Forgot your password?
              </button>
            </form>
          </Panel>
        )}

        {step === "google" && (
          <Panel title="Continue with Google" email={email} onChange={() => go("start")}>
            <p className="mb-5 text-center text-[14.5px] text-ink-2">This account signs in with Google.</p>
            {google ? <OAuthButton href={google} label="Continue with Google" icon={<GoogleIcon />} /> : <ErrorText text="Google sign-in is not available right now." />}
            <button type="button" onClick={onForgot} disabled={busy} className="mx-auto mt-5 block text-[13.5px] text-muted underline-offset-4 hover:text-ink hover:underline">
              Email me a link to set a password instead
            </button>
            <ErrorText text={error} />
          </Panel>
        )}

        {step === "signup" && (
          <Panel title="Create your account" email={email} onChange={() => go("start")}>
            <form onSubmit={onSignup} className="space-y-5">
              <UnderlineInput name="name" label="Name (optional)" placeholder="Your name" autoComplete="name" maxLength={80} />
              <UnderlineInput ref={focusRef} name="password" type="password" label="Password" placeholder="At least 10 characters" autoComplete="new-password" minLength={10} />
              <ErrorText text={error} />
              <Submit busy={busy}>Create account</Submit>
              <p className="text-center text-[12.5px] text-muted">
                By continuing you agree to how we handle data in the{" "}
                <a href="/privacy" className="underline underline-offset-4">
                  privacy policy
                </a>
                .
              </p>
            </form>
          </Panel>
        )}

        {step === "sent" && (
          <Panel title="Check your email" email={email} onChange={() => go("start")}>
            <p role="status" className="text-center text-[15px] leading-relaxed text-ink-2">
              If there is an account for this email, a link to choose a password is on its way. It works for one hour.
            </p>
            <button type="button" onClick={() => go("password")} className="btn btn-line mt-6 w-full">
              Back to sign in
            </button>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Panel({ title, email, onChange, children }: { title: string; email?: string; onChange?: () => void; children: ReactNode }) {
  return (
    <div className="animate-[fade-up_0.45s_cubic-bezier(0.25,1,0.5,1)_both]">
      <h1 className="display mb-6 text-center text-[40px]">{title}</h1>
      {email && (
        <div className="mb-6 flex items-center justify-center gap-2 text-[14px] text-ink-2">
          <span className="truncate font-medium">{email}</span>
          <button type="button" onClick={onChange} className="shrink-0 text-fire-ink underline-offset-4 hover:underline">
            Change
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

function OAuthButton({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-[14px] border-[1.5px] border-ink/85 bg-surface text-[15px] font-medium text-ink transition-colors hover:bg-surface-2"
    >
      {icon}
      {label}
    </a>
  );
}

const UnderlineInput = function UnderlineInput({
  ref,
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; ref?: React.Ref<HTMLInputElement> }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        ref={ref}
        required={rest.name !== "name"}
        maxLength={rest.maxLength ?? (rest.type === "email" ? 254 : 200)}
        className="h-12 w-full border-0 border-b-[1.5px] border-ink/80 bg-transparent px-0.5 text-[16px] text-ink outline-none placeholder:text-faint focus:border-fire"
        {...rest}
      />
    </label>
  );
};

function Submit({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={busy} className="btn btn-fire w-full disabled:opacity-60">
      {busy ? "One moment…" : children}
    </button>
  );
}

function ErrorText({ text }: { text: string | null }) {
  return (
    <p aria-live="polite" className="min-h-5 text-center text-[13.5px] text-fire-ink">
      {text}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
