"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { button, field } from "@/components/PageShell";

export function Reset() {
  const fromUrl = useSearchParams().get("token") ?? "";
  // keep the token, then clear it from the address bar (and so from history)
  const [token] = useState(fromUrl);
  const [state, setState] = useState<{ kind: "idle" | "sending" | "done" } | { kind: "error"; message: string }>({ kind: "idle" });

  useEffect(() => {
    if (fromUrl) window.history.replaceState(null, "", "/account/reset");
  }, [fromUrl]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    if (password !== String(f.get("confirm") ?? "")) return setState({ kind: "error", message: "The two passwords are not the same." });
    setState({ kind: "sending" });
    try {
      const r = await fetch("/api/v1/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      if (r.ok) return setState({ kind: "done" });
      const d = (await r.json().catch(() => ({}))) as { message?: string };
      setState({ kind: "error", message: d.message ?? "That did not work." });
    } catch {
      setState({ kind: "error", message: "No connection. Try again." });
    }
  }

  if (!token)
    return (
      <div>
        <h1 className="text-[30px] font-semibold tracking-tight">This link does not work</h1>
        <p className="mt-3 text-[15.5px] text-ink-2">Ask for a new link on the sign-in page (Forgot?), and use the newest email.</p>
      </div>
    );

  if (state.kind === "done")
    return (
      <div role="status">
        <h1 className="text-[30px] font-semibold tracking-tight">Your password is changed</h1>
        <p className="mt-3 text-[15.5px] text-ink-2">You were signed out everywhere. Sign in again with the new password.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="text-[30px] leading-tight font-semibold tracking-tight">Choose a new password</h1>
      <div>
        <label htmlFor="pw" className="mb-2 block text-[14px] font-medium">
          New password <span className="font-normal text-muted">(at least 10 characters)</span>
        </label>
        <input id="pw" name="password" type="password" required minLength={10} maxLength={200} autoComplete="new-password" className={field} />
      </div>
      <div>
        <label htmlFor="pw2" className="mb-2 block text-[14px] font-medium">
          The same password again
        </label>
        <input id="pw2" name="confirm" type="password" required minLength={10} maxLength={200} autoComplete="new-password" className={field} />
      </div>
      <div aria-live="polite" className="min-h-5 text-[14px] text-fire-ink">
        {state.kind === "error" ? state.message : null}
      </div>
      <button type="submit" className={`${button} w-full`} disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
