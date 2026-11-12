"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { button, field } from "@/components/PageShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { post, safeNext, useMe, useProviders } from "@/components/auth/client";

const ERRORS: Record<string, string> = {
  google_off: "Signing in with Google is not available right now.",
  google_cancelled: "Google sign-in was cancelled.",
  google_state: "That Google sign-in had expired. Try again.",
  google_failed: "Google sign-in did not work. Try again.",
  google_unverified: "That Google account's email is not verified.",
  disabled: "This account is turned off. Contact us if this is a mistake.",
};

type Mode = "signin" | "signup" | "forgot";

/** Sign in or create an account (email and password, or Google), then back to where the person came from: the app's
 * sign-in request (/link?code=...) or their account. */
export function SignIn() {
  const params = useSearchParams();
  const router = useRouter();
  const next = safeNext(params.get("next"));
  const fromApp = next.startsWith("/link");
  const providers = useProviders();
  const { me } = useMe();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(ERRORS[params.get("error") ?? ""] ?? null);
  const [sent, setSent] = useState(false);

  // already signed in on this browser: straight on
  useEffect(() => {
    if (me) router.replace(next);
  }, [me, next, router]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    setBusy(true);
    setError(null);
    try {
      if (mode === "forgot") {
        await post("/api/v1/auth/forgot", { email });
        setSent(true);
      } else {
        await post(mode === "signup" ? "/api/v1/auth/signup" : "/api/v1/auth/login", {
          email,
          password: String(f.get("password") ?? ""),
          ...(mode === "signup" ? { name: String(f.get("name") ?? "").trim() || null } : {}),
        });
        router.replace(next);
      }
    } catch (er) {
      setError((er as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signup" ? "Create your FireVoice account" : mode === "forgot" ? "Reset your password" : "Sign in to FireVoice";
  return (
    <div>
      {fromApp && (
        <p className="mb-5 rounded-xl bg-fire-soft px-4 py-3 text-[14px] text-ink-2">Sign in here to finish signing in to the FireVoice app.</p>
      )}
      <h1 className="text-[30px] leading-tight font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        {mode === "forgot" ? "We will email you a link to choose a new password." : "Free, and optional: FireVoice works the same without one."}
      </p>

      {mode !== "forgot" && providers?.google && (
        <div className="mt-7 space-y-5">
          <GoogleButton next={next} />
          <div className="flex items-center gap-3 text-[12.5px] text-faint">
            <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

      {mode === "forgot" && sent ? (
        <div role="status" className="mt-7 space-y-4">
          <p className="text-[15px] text-ink-2">If there is an account for that email, a link is on its way. It works for one hour.</p>
          <button className="text-[14px] text-fire-ink underline underline-offset-4" onClick={() => (setMode("signin"), setSent(false))}>
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className={`${providers?.google && mode !== "forgot" ? "mt-5" : "mt-7"} space-y-4`}>
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[14px] font-medium">
                Name <span className="font-normal text-muted">(optional)</span>
              </label>
              <input id="name" name="name" autoComplete="name" maxLength={80} className={field} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[14px] font-medium">
              Email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} className={field} />
          </div>
          {mode !== "forgot" && (
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="password" className="block text-[14px] font-medium">
                  Password {mode === "signup" && <span className="font-normal text-muted">(at least 10 characters)</span>}
                </label>
                {mode === "signin" && (
                  <button type="button" className="text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline" onClick={() => (setMode("forgot"), setError(null))}>
                    Forgot?
                  </button>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={mode === "signup" ? 10 : 1}
                maxLength={200}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className={field}
              />
            </div>
          )}
          <p aria-live="polite" className="min-h-5 text-[14px] text-fire-ink">
            {error}
          </p>
          <button type="submit" className={`${button} w-full`} disabled={busy}>
            {busy ? "One moment…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send link" : "Sign in"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-[14px] text-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button className="font-medium text-fire-ink hover:underline" onClick={() => (setMode("signin"), setError(null))}>
              Sign in
            </button>
          </>
        ) : mode === "signin" ? (
          <>
            New to FireVoice?{" "}
            <button className="font-medium text-fire-ink hover:underline" onClick={() => (setMode("signup"), setError(null))}>
              Create an account
            </button>
          </>
        ) : (
          <button className="font-medium text-fire-ink hover:underline" onClick={() => (setMode("signin"), setError(null))}>
            Back to sign in
          </button>
        )}
      </p>
      <p className="mt-8 text-center text-[12.5px] text-faint">
        By continuing you agree to how we handle data in the{" "}
        <a className="underline underline-offset-4" href="/privacy">
          privacy policy
        </a>
        .
      </p>
    </div>
  );
}
