"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DownloadButton, Wordmark } from "./ui";
import { ArrowRight, Menu, X } from "@/components/icons";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#studio", label: "Voice studio" },
  { href: "#privacy", label: "Privacy" },
  { href: "#faq", label: "FAQ" },
];

/** The thin bar above the menu: what is new. */
export function Announcement() {
  return (
    <div className="relative z-40 bg-night text-center text-[13px] text-[#f4f5f8]">
      <a href="#features" className="group mx-auto flex h-10 max-w-[1180px] items-center justify-center gap-2 px-4">
        <span className="rounded-full bg-fire px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-white uppercase">New</span>
        <span>Start dictating by saying &ldquo;Hey FireVoice&rdquo;</span>
        <ArrowRight className="size-3.5" />
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
  // while the menu is open: Escape closes it, the page behind does not scroll, and widening to desktop closes it
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", esc);
    wide.addEventListener("change", onWide);
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      wide.removeEventListener("change", onWide);
      root.style.overflow = before;
    };
  }, [open]);

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3">
      <nav
        aria-label="Main"
        className={`pointer-events-auto mx-auto flex h-[60px] max-w-[1200px] items-center gap-2 rounded-[18px] border pr-2 pl-4 transition-[background,box-shadow,border-color] duration-300 ${
          scrolled ? "border-line bg-surface/85 shadow-[var(--shadow-md)] backdrop-blur-xl" : "border-transparent bg-transparent"
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
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <>
          {/* the page behind dims; a tap on it closes the menu */}
          <div aria-hidden className="pointer-events-auto fixed inset-0 -z-10 animate-[fade-in_0.2s_ease-out] bg-ink/25 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />
          {/* floats over the page (out of its flow), so opening it never moves anything */}
          <div
            id="mobile-menu"
            className="pointer-events-auto absolute inset-x-3 top-full mt-2 max-h-[calc(100dvh-96px)] origin-top animate-[menu-in_0.22s_cubic-bezier(0.32,0.72,0,1)] overflow-y-auto rounded-[20px] border border-line bg-surface p-2 shadow-[var(--shadow-lg)] lg:hidden"
          >
            <ul className="grid">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="flex h-12 items-center rounded-xl px-3 text-[16px] font-medium text-ink hover:bg-surface-2">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid gap-2 border-t border-line p-1 pt-3">
              <DownloadButton className="w-full" />
              <Link href="/signin" onClick={() => setOpen(false)} className="btn btn-line w-full">
                Sign in
              </Link>
            </div>
          </div>
          <style>{`@keyframes menu-in{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}@keyframes fade-in{from{opacity:0}to{opacity:1}}`}</style>
        </>
      )}
    </header>
  );
}
