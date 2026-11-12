"use client";

import { useState, type FormEvent } from "react";
import { button, field } from "@/components/PageShell";

const KINDS = [
  { value: "bug", label: "Something is broken" },
  { value: "idea", label: "An idea" },
  { value: "praise", label: "Something I like" },
  { value: "other", label: "Something else" },
] as const;

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function FeedbackForm() {
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("idea");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const r = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message: String(f.get("message") ?? ""), email: String(f.get("email") ?? ""), website: String(f.get("website") ?? "") }),
      });
      if (r.ok) return setState({ kind: "sent" });
      const d = (await r.json().catch(() => ({}))) as { message?: string; error?: string };
      setState({ kind: "error", message: d.error === "rate_limited" ? "That is a lot of messages. Try again in a while." : (d.message ?? "That did not go through.") });
    } catch {
      setState({ kind: "error", message: "No connection. Check your internet and try again." });
    }
  }

  if (state.kind === "sent")
    return (
      <div role="status" className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-[var(--edge)]">
        <p className="text-[17px] font-semibold">Thank you. It is with us.</p>
        <p className="mt-1 text-[15px] text-ink-2">If you left your email, we may write back.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <fieldset>
        <legend className="mb-2 text-[14px] font-medium">What is it about?</legend>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <label
              key={k.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line-strong bg-surface px-3.5 py-3 text-[14.5px] transition has-[:checked]:border-fire has-[:checked]:bg-fire-soft has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-fire-soft"
            >
              <input type="radio" name="kind" value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} className="accent-[var(--fire)]" />
              {k.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="fb-message" className="mb-2 block text-[14px] font-medium">
          Your message
        </label>
        <textarea id="fb-message" name="message" required minLength={3} maxLength={5000} rows={6} className={field} placeholder="What happened, or what would you like?" />
      </div>
      <div>
        <label htmlFor="fb-email" className="mb-2 block text-[14px] font-medium">
          Email <span className="font-normal text-muted">(optional, if you would like a reply)</span>
        </label>
        <input id="fb-email" name="email" type="email" autoComplete="email" maxLength={254} className={field} placeholder="you@example.com" />
      </div>
      {/* bots fill this in; people never see it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <div aria-live="polite" className="min-h-5 text-[14px] text-fire-ink">
        {state.kind === "error" ? state.message : null}
      </div>
      <button type="submit" className={button} disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
