"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { button } from "@/components/PageShell";
import { Logo } from "@/components/ui";
import { post, useMe } from "@/components/auth/client";

type Info = { device: string | null; country: string | null; city: string | null; createdAt: string };
const CODE = /^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/;

/** The app opened this page to sign in: sign in here (if needed), check it is your computer, and approve. */
export function Link() {
  const router = useRouter();
  const code = (useSearchParams().get("code") ?? "").toUpperCase();
  const valid = CODE.test(code);
  const { me } = useMe();
  const [info, setInfo] = useState<Info | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "approved" | "declined">("idle");
  const [error, setError] = useState<string | null>(valid ? null : "This link is not complete. Start signing in again from FireVoice.");

  useEffect(() => {
    if (me === null && valid) router.replace(`/signin?next=${encodeURIComponent(`/link?code=${code}`)}`);
  }, [me, valid, code, router]);

  useEffect(() => {
    if (!me || !valid) return;
    post<Info>("/api/v1/app-login/lookup", { code }).then(setInfo, (e: Error) => setError(e.message));
  }, [me, valid, code]);

  const decide = async (approve: boolean) => {
    setState("busy");
    try {
      await post("/api/v1/app-login/decide", { code, approve });
      setState(approve ? "approved" : "declined");
    } catch (e) {
      setError((e as Error).message);
      setState("idle");
    }
  };

  if (state === "approved")
    return (
      <div role="status" className="text-center">
        <div className="mx-auto w-fit">
          <Logo size={44} />
        </div>
        <h1 className="mt-5 text-[28px] font-semibold tracking-tight">You are signed in</h1>
        <p className="mt-2 text-[15px] text-ink-2">Go back to FireVoice: it has signed in as {me?.user.email}. You can close this tab.</p>
      </div>
    );
  if (state === "declined")
    return (
      <div role="status" className="text-center">
        <h1 className="text-[28px] font-semibold tracking-tight">Not signed in</h1>
        <p className="mt-2 text-[15px] text-ink-2">The request was declined. Nothing changed.</p>
      </div>
    );

  return (
    <div>
      <div className="w-fit">
        <Logo size={40} />
      </div>
      <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-tight">Sign in to the FireVoice app?</h1>
      {error ? (
        <p className="mt-4 rounded-xl bg-fire-soft px-4 py-3 text-[14.5px] text-ink-2">{error}</p>
      ) : !me || !info ? (
        <p className="mt-4 text-[15px] text-muted">Checking the request…</p>
      ) : (
        <>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            The app on this computer asked to sign in as <b className="text-ink">{me.user.email}</b>. Approve only if you just
            chose Sign in in FireVoice.
          </p>
          <dl className="mt-5 space-y-2 rounded-2xl border border-line bg-surface p-4 text-[14px] shadow-[var(--edge)]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Code</dt>
              <dd className="font-mono font-semibold tracking-wider">{code}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Computer</dt>
              <dd className="truncate">{info.device ?? "Unknown"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">From</dt>
              <dd className="truncate">{[info.city, info.country].filter(Boolean).join(", ") || "Unknown"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[13px] text-muted">The same code is shown in FireVoice. Check that they match.</p>
          <div className="mt-6 flex gap-3">
            <button className={`${button} flex-1`} disabled={state === "busy"} onClick={() => void decide(true)}>
              Sign in the app
            </button>
            <button
              className="h-11 rounded-xl border border-line-strong px-5 text-[15px] font-medium text-ink-2 transition hover:bg-surface-2 disabled:opacity-60"
              disabled={state === "busy"}
              onClick={() => void decide(false)}
            >
              Decline
            </button>
          </div>
        </>
      )}
    </div>
  );
}
