"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowRight, Bell, CheckCircle2, Loader2 } from "@/components/icons";

type Interest = "mac" | "pro" | "news";
type State =
  | { s: "idle" }
  | { s: "loading" }
  | { s: "done"; already: boolean }
  | { s: "error"; message: string; field?: boolean };

const interests: { v: Interest; label: string }[] = [
  { v: "mac", label: "macOS version" },
  { v: "pro", label: "Pro features" },
  { v: "news", label: "Product news" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Get notified": an email, an optional interest, and a honeypot. Posts to the site's own waitlist route. */
export function Waitlist() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<Interest | null>(null);
  const [state, setState] = useState<State>({ s: "idle" });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.s === "loading") return;
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setState({ s: "error", message: "Please enter a valid email address.", field: true });
      return;
    }
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    setState({ s: "loading" });
    try {
      const res = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, interest: interest ?? "news", source: "landing", website }),
      });
      const data: { ok?: boolean; already?: boolean; error?: string; message?: string } = await res
        .json()
        .catch(() => ({}));
      if (res.ok && data.ok) return setState({ s: "done", already: Boolean(data.already) });
      if (res.status === 429 || data.error === "rate_limited")
        return setState({ s: "error", message: "Too many tries for now. Please wait a minute and try again." });
      if (res.status === 400 || data.error === "invalid")
        return setState({ s: "error", message: data.message || "That email doesn't look right.", field: true });
      setState({ s: "error", message: "Something went wrong on our side. Please try again in a moment." });
    } catch {
      setState({ s: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  }

  const loading = state.s === "loading";
  const done = state.s === "done";
  const fieldError = state.s === "error" && state.field;

  return (
    <section id="notify" aria-labelledby={`${id}-title`} className="relative z-10 pb-10 pt-4 sm:pb-16">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0f]/70 p-6 shadow-lg backdrop-blur-xl sm:p-10 lg:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_0%,rgba(255,98,41,0.22),transparent_60%),radial-gradient(50%_70%_at_0%_100%,rgba(255,46,99,0.1),transparent_60%)]"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center [&>*]:min-w-0">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <Bell className="size-3.5" /> Get notified
              </p>
              <h2 id={`${id}-title`} className="h-section mt-4 text-balance !text-[clamp(1.9rem,3.6vw,3rem)]">
                Be the first <span className="accent">to hear.</span>
              </h2>
              <p className="mt-4 max-w-md text-pretty text-[16px] leading-relaxed text-muted">
                Leave your email and we&apos;ll write when FireVoice comes to macOS, when Pro features arrive, or when
                there&apos;s news worth sharing.
              </p>
            </div>

            <form onSubmit={submit} noValidate className="relative" aria-describedby={`${id}-status`}>
              {/* honeypot: people never see or reach it; bots that fill every field give themselves away */}
              <div className="honeypot" aria-hidden>
                <label htmlFor={`${id}-website`}>Website</label>
                <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>

              <fieldset disabled={loading || done} className="min-w-0">
                <legend className="text-[13px] text-white/60">
                  What should we tell you about? <span className="text-white/40">(optional)</span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interests.map((o) => {
                    const on = interest === o.v;
                    return (
                      <label
                        key={o.v}
                        className={`relative flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--fire)] ${
                          on
                            ? "border-[#ff6b3d]/60 bg-[#ff6b3d]/15 text-white"
                            : "border-white/12 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="interest"
                          value={o.v}
                          checked={on}
                          onChange={() => setInterest(o.v)}
                          onClick={() => on && setInterest(null)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className={`size-1.5 rounded-full transition-colors ${on ? "bg-[#ff8a5c]" : "bg-white/25"}`}
                        />
                        {o.label}
                      </label>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                  <label htmlFor={`${id}-email`} className="sr-only">
                    Email address
                  </label>
                  <input
                    id={`${id}-email`}
                    type="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (state.s === "error") setState({ s: "idle" });
                    }}
                    aria-invalid={fieldError || undefined}
                    aria-describedby={`${id}-status`}
                    className={`h-12 min-w-0 flex-1 rounded-full border bg-white/[0.04] px-5 text-[15px] text-white placeholder:text-white/35 transition-colors focus:border-[#ff6b3d]/70 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fire)] disabled:opacity-60 ${
                      fieldError ? "border-[#ff5d6c]/70" : "border-white/12"
                    }`}
                  />
                  <button type="submit" className="btn-fire !h-12 shrink-0 sm:min-w-[150px] disabled:cursor-default disabled:opacity-80" aria-busy={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" trigger="none" /> Adding you
                      </>
                    ) : done ? (
                      <>
                        <CheckCircle2 className="size-4" trigger="manual" active /> Done
                      </>
                    ) : (
                      <>
                        Notify me <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </fieldset>

              <p
                id={`${id}-status`}
                role="status"
                aria-live="polite"
                className={`mt-3 min-h-6 text-[14px] ${
                  state.s === "error" ? "text-[#ff8a95]" : done ? "text-[#5ff0ac]" : "text-white/45"
                }`}
              >
                {state.s === "error"
                  ? state.message
                  : done
                    ? state.already
                      ? "You were already on the list. We'll be in touch."
                      : "You're on the list. We'll be in touch."
                    : loading
                      ? "Adding you to the list…"
                      : "No spam. We only write about what you pick."}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
