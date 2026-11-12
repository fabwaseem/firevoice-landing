"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DownloadButton, Wordmark } from "./ui";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#voices", label: "Voices" },
  { href: "#privacy", label: "Privacy" },
  { href: "#faq", label: "FAQ" },
];

/** The thin bar above the menu: what is new. */
export function Announcement() {
  return (
    <div className="relative z-40 bg-ember text-center text-[13px] text-[#f6efe6]">
      <a href="#features" className="group mx-auto flex h-10 max-w-[1180px] items-center justify-center gap-2 px-4">
        <span className="rounded-full bg-fire px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-white uppercase">New</span>
        <span>Start dictating by saying &ldquo;Hey FireVoice&rdquo;</span>
        <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
          &rarr;
        </span>
      </a>
    </div>
  );
}

/** The floating menu: a rounded bar that stays at the top as the page scrolls, a little more solid once it has. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3">
      <nav
        aria-label="Main"
        className={`pointer-events-auto mx-auto flex h-[58px] max-w-[880px] items-center gap-2 rounded-[20px] border pr-2 pl-4 transition-[background,box-shadow,border-color] duration-300 ${
          scrolled ? "border-line bg-bg-elev/85 shadow-[0_12px_32px_-16px_rgba(23,19,15,0.25)] backdrop-blur-xl" : "border-line/60 bg-bg-elev/60 backdrop-blur-md"
        }`}
      >
        <Link href="/" aria-label="FireVoice home" className="mr-2 shrink-0 rounded-lg">
          <Wordmark />
        </Link>
        <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3 py-2 text-[14px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <Link href="/signin" className="hidden rounded-full px-3 py-2 text-[14px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink sm:block">
            Sign in
          </Link>
          <DownloadButton size="sm" className="hidden sm:inline-flex" />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink hover:bg-surface-2 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="pointer-events-auto mx-auto mt-2 max-w-[880px] rounded-[20px] border border-line bg-bg-elev p-3 shadow-[var(--shadow-lg)] lg:hidden">
          <ul className="grid">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-[16px] font-medium text-ink hover:bg-surface-2">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/signin" className="block rounded-xl px-3 py-3 text-[16px] font-medium text-ink hover:bg-surface-2">
                Sign in
              </Link>
            </li>
          </ul>
          <DownloadButton className="mt-2 w-full" />
        </div>
      )}
    </header>
  );
}
