"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { Pill } from "./ui";

const COLUMNS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Get FireVoice",
    links: [
      { href: site.downloadWindows, label: "Windows installer" },
      { href: "/download/windows-msi", label: "Windows MSI" },
      { href: site.downloadLinux, label: "Linux AppImage" },
      { href: "/download/linux-deb", label: "Linux .deb" },
      { href: "/download/linux-rpm", label: "Linux .rpm" },
      { href: site.releases, label: "Every release", external: true },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/#features", label: "Features" },
      { href: "/#voices", label: "Voices" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signin", label: "Sign in" },
      { href: "/signin?mode=signup", label: "Create an account" },
      { href: "/account", label: "Your account" },
    ],
  },
  {
    title: "FireVoice",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/feedback", label: "Send feedback" },
    ],
  },
];

/** The footer: the two products, the links, "get notified", and the name, very large. */
export function Footer() {
  return (
    <footer className="relative bg-bg pt-20 pb-8">
      <div className="container-x">
        <p className="eyebrow mb-4">One app, two things</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/#how" className="group flex items-center gap-5 rounded-[24px] bg-surface-2 p-3 pr-6 transition-colors hover:bg-surface-3">
            <div className="grid h-24 w-28 shrink-0 place-items-center rounded-[18px] bg-fire-soft">
              <Pill state="listening" level={0.5} size="sm" />
            </div>
            <div>
              <div className="text-[16px] font-semibold">Dictation</div>
              <p className="mt-1 text-[14px] text-ink-2">Speak in any program; clean, finished text goes in.</p>
              <span className="mt-2 inline-block text-[14px] font-medium text-fire-ink transition-transform group-hover:translate-x-0.5">See how &rarr;</span>
            </div>
          </Link>
          <Link href="/#voices" className="group flex items-center gap-5 rounded-[24px] bg-surface-2 p-3 pr-6 transition-colors hover:bg-surface-3">
            <div className="grid h-24 w-28 shrink-0 place-items-center rounded-[18px] bg-ember">
              <div className="flex h-8 items-center gap-[3px]" aria-hidden>
                {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.45, 0.65].map((b, i) => (
                  <span key={i} className="w-[3px] rounded-full bg-fire-2" style={{ height: `${b * 100}%` }} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[16px] font-semibold">Voice studio</div>
              <p className="mt-1 text-[14px] text-ink-2">Natural voices, cloning, dubbing and transcription.</p>
              <span className="mt-2 inline-block text-[14px] font-medium text-fire-ink transition-transform group-hover:translate-x-0.5">Hear them &rarr;</span>
            </div>
          </Link>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.4fr)]">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow mb-4">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className="text-[14.5px] text-ink-2 hover:text-ink">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-[14.5px] text-ink-2 hover:text-ink">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Notify />
        </div>

        {/* the name, as big as the page is wide */}
        <div aria-hidden className="mt-20 flex select-none items-center gap-[2.5vw] overflow-hidden">
          <svg viewBox="0 0 120 100" className="h-[clamp(64px,13vw,180px)] w-auto shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round">
            <line x1="12" y1="42" x2="12" y2="58" />
            <line x1="36" y1="26" x2="36" y2="74" />
            <line x1="60" y1="10" x2="60" y2="90" />
            <line x1="84" y1="26" x2="84" y2="74" />
            <line x1="108" y1="42" x2="108" y2="58" />
          </svg>
          <span className="font-serif leading-none tracking-[-0.04em] text-ink" style={{ fontSize: "clamp(72px,16.5vw,240px)" }}>
            FireVoice
          </span>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; FireVoice. Made to run on your own computer.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/feedback" className="hover:text-ink">
              Feedback
            </Link>
            <a href={site.releases} target="_blank" rel="noreferrer" className="hover:text-ink">
              Releases
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** "Get notified": the macOS version, Pro features or news, by email. */
function Notify() {
  const [interest, setInterest] = useState<"mac" | "pro" | "news">("mac");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "done" | "error"; text?: string }>({ kind: "idle" });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ kind: "busy" });
    try {
      const r = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(f.get("email") ?? ""), interest, source: "footer", website: String(f.get("website") ?? "") }),
      });
      const d = (await r.json().catch(() => ({}))) as { already?: boolean; message?: string; error?: string };
      if (r.ok) setState({ kind: "done", text: d.already ? "You were already on the list." : "You're on the list." });
      else setState({ kind: "error", text: d.error === "rate_limited" ? "Too many tries. Try again later." : (d.message ?? "That did not work.") });
    } catch {
      setState({ kind: "error", text: "No connection. Try again." });
    }
  }
  return (
    <div className="sm:col-span-2 lg:col-span-1">
      <p className="eyebrow mb-4">Get notified</p>
      <p className="text-[14.5px] text-ink-2">Hear when FireVoice comes to macOS, or what is new.</p>
      {state.kind === "done" ? (
        <p role="status" className="mt-4 rounded-2xl bg-fire-soft px-4 py-3 text-[14px] font-medium text-ink">
          {state.text}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4">
          <div className="mb-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tell me about">
            {(
              [
                ["mac", "macOS"],
                ["pro", "Pro features"],
                ["news", "News"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={interest === v}
                onClick={() => setInterest(v)}
                className={`rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors ${interest === v ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-2 hover:bg-surface-2"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label htmlFor="notify-email" className="sr-only">
              Email
            </label>
            <input
              id="notify-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10 min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4 text-[14px] outline-none placeholder:text-faint focus:border-fire"
            />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="honeypot" />
            <button className="btn btn-fire btn-sm" disabled={state.kind === "busy"}>
              {state.kind === "busy" ? "…" : "Notify me"}
            </button>
          </div>
          <p aria-live="polite" className="mt-2 min-h-5 text-[12.5px] text-fire-ink">
            {state.kind === "error" ? state.text : null}
          </p>
        </form>
      )}
    </div>
  );
}
