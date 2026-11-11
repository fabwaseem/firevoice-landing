"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noop = () => () => {};
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Logo, WindowsIcon } from "./ui";
import { nav, site } from "@/lib/site";
import { armMusic, getServerSnapshot, getSnapshot, subscribe, toggleMusic } from "@/lib/audio-engine";

/** Background music on/off. The score also starts on the visitor's first click or key press, unless they turned it off. */
function SoundToggle() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => armMusic(), []);
  const on = s.music;
  return (
    <button
      type="button"
      data-sound-toggle
      onClick={toggleMusic}
      aria-pressed={on}
      className="flex h-9 items-center gap-2 rounded-full px-3 text-[13px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] rounded-full bg-current ${on ? "animate-eq" : ""}`}
            style={{ height: on ? undefined : [5, 9, 12, 7][i], animationDelay: `${i * 0.18}s`, opacity: on ? 1 : 0.6 }}
          />
        ))}
      </span>
      <span className="sr-only sm:not-sr-only">Sound</span>
    </button>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const dark = resolvedTheme !== "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-3 hover:text-ink"
      aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Switch theme"}
    >
      {mounted ? dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" /> : <span className="size-[18px]" />}
    </button>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="stage fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-[background,border-color,backdrop-filter] duration-300 ${
          scrolled || open ? "border-b border-white/10 bg-[#07070a]/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between" aria-label="Main">
          <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight text-ink" aria-label="FireVoice home">
            <Logo size={28} />
            <span className="text-[17px]">FireVoice</span>
          </a>
          <ul className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-ink">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5">
            <SoundToggle />
            <ThemeToggle />
            <a href={site.download} className="btn-fire hidden !h-9 !px-4 !text-sm sm:inline-flex">
              <WindowsIcon className="size-3.5" /> Download
            </a>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full text-ink md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
            >
              <ul className="container-x flex flex-col gap-1 pb-5">
                {nav.map((n) => (
                  <li key={n.href}>
                    <a
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-3 text-lg text-ink-2 hover:bg-surface-2"
                    >
                      {n.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2">
                  <a href={site.download} className="btn-fire w-full">
                    <WindowsIcon className="size-4" /> Download for Windows
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
