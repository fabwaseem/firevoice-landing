"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { api, ghost, input } from "./kit";
import { Overview } from "./views/Overview";
import { Installs } from "./views/Installs";
import { Users } from "./views/Users";
import { Events } from "./views/Events";
import { Feedback } from "./views/Feedback";
import { Waitlist } from "./views/Waitlist";
import { Crashes } from "./views/Crashes";
import { Licenses } from "./views/Licenses";

const TABS = [
  { id: "overview", label: "Overview", view: Overview },
  { id: "installs", label: "Installs", view: Installs },
  { id: "users", label: "Accounts", view: Users },
  { id: "events", label: "Events", view: Events },
  { id: "feedback", label: "Feedback", view: Feedback },
  { id: "waitlist", label: "Waitlist", view: Waitlist },
  { id: "crashes", label: "Crashes", view: Crashes },
  { id: "licenses", label: "Licences", view: Licenses },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function Dashboard() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  // the tab from the address (#installs), so a reload or a shared link opens the same one
  const [tab, setTab] = useState<Tab>(() => {
    const h = typeof window === "undefined" ? "" : window.location.hash.slice(1);
    return TABS.find((t) => t.id === h)?.id ?? "overview";
  });

  useEffect(() => {
    api<{ admin: boolean }>("/api/admin/session").then((d) => setSignedIn(d.admin), () => setSignedIn(false));
    const out = () => setSignedIn(false);
    window.addEventListener("fv-admin-signed-out", out);
    return () => window.removeEventListener("fv-admin-signed-out", out);
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    window.history.replaceState(null, "", `#${t}`);
  };

  if (signedIn === null) return <div className="min-h-dvh bg-bg" />;
  if (!signedIn) return <SignIn onDone={() => setSignedIn(true)} />;

  const View = TABS.find((t) => t.id === tab)!.view;
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-[14.5px] font-semibold">
            <Logo size={22} />
            <span className="hidden sm:inline">FireVoice</span>
          </Link>
          <nav aria-label="Dashboard" className="-mx-1 flex min-w-0 flex-1 gap-0.5 overflow-x-auto px-1 [scrollbar-width:none]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className="h-8 shrink-0 rounded-lg px-3 text-[13.5px] font-medium text-muted transition hover:text-ink aria-[current=page]:bg-surface-3 aria-[current=page]:text-ink"
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button
            className={ghost}
            onClick={async () => {
              await api("/api/admin/session", { method: "DELETE" }).catch(() => {});
              setSignedIn(false);
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <View />
      </main>
    </div>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/session", { method: "POST", body: { password: String(new FormData(e.currentTarget).get("password") ?? "") } });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 text-ink">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-lg)]">
        <Logo size={32} />
        <h1 className="mt-4 text-[22px] font-semibold tracking-tight">FireVoice dashboard</h1>
        <p className="mt-1 text-[14px] text-muted">Private. Sign in with the dashboard password.</p>
        <label htmlFor="admin-pw" className="mt-5 mb-1.5 block text-[13px] font-medium">
          Password
        </label>
        <input id="admin-pw" name="password" type="password" required autoFocus autoComplete="current-password" className={`${input} h-10`} />
        <p aria-live="polite" className="mt-2 min-h-5 text-[13px] text-fire-ink">
          {error}
        </p>
        <button disabled={busy} className="mt-2 h-10 w-full rounded-lg bg-fire text-[14px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
