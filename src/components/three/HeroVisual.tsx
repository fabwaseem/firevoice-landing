"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const OrbScene = dynamic(() => import("./OrbScene"), { ssr: false });

/** Should this device get the WebGL scene? No for reduced motion, data saver, weak hardware, or no WebGL. */
function canRun3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 8) < 4) return false;
  if ((nav.deviceMemory ?? 8) < 4) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** A CSS-only orb: the poster before the 3D loads, and the whole visual on devices that skip WebGL. */
function FallbackOrb({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 grid place-items-center transition-opacity duration-1000 ${hidden ? "opacity-0" : "opacity-100"}`}
    >
      <div className="relative aspect-square w-[46%] animate-float">
        <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffd1a8_0%,#ff8a4c_22%,#ff4d2e_55%,#7a1600_100%)] shadow-[0_0_80px_-10px_rgba(255,90,45,0.7)] dark:bg-[radial-gradient(circle_at_32%_28%,#ffc799_0%,#ff7a45_18%,#c42e0c_50%,#250500_100%)]" />
        <div className="absolute inset-[-18%] rounded-full border border-fire/30" />
        <div className="absolute inset-[-34%] rounded-full border border-dashed border-fire/20" />
      </div>
    </div>
  );
}

export default function HeroVisual() {
  const { resolvedTheme } = useTheme();
  const box = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  // Load the 3D only after the page has settled, so it never competes with the first paint. Desktops start it when
  // the browser is idle; phones and tablets wait for the visitor's first touch, scroll or key, which keeps the initial
  // load light on slower CPUs (the CSS orb shows until then).
  useEffect(() => {
    if (!canRun3D()) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      setEnabled(true);
    };
    const events = ["pointerdown", "touchstart", "scroll", "keydown", "wheel"] as const;
    const cleanup = () => events.forEach((e) => window.removeEventListener(e, go));
    const coarse = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    let idle = 0;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (!coarse) {
      if (w.requestIdleCallback) idle = w.requestIdleCallback(go, { timeout: 2000 });
      else idle = window.setTimeout(go, 800);
    }
    return () => {
      done = true;
      cleanup();
      if (idle) (window.cancelIdleCallback ?? clearTimeout)(idle);
    };
  }, []);

  // stop rendering frames while the hero is off screen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, [enabled]);

  return (
    <div ref={box} className="absolute inset-0">
      <div aria-hidden className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_68%)] blur-2xl" />
      <FallbackOrb hidden={ready} />
      {enabled && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <OrbScene dark={resolvedTheme !== "light"} active={visible} />
        </div>
      )}
    </div>
  );
}
