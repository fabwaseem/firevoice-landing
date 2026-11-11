"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const VoiceField = dynamic(() => import("./VoiceField"), { ssr: false });

type Plan = { run: boolean; quality: "high" | "low"; touch: boolean };

function plan(): Plan {
  const no: Plan = { run: false, quality: "low", touch: false };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return no;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return no;
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  if (cores < 4 || mem < 4) return no;
  try {
    const c = document.createElement("canvas");
    if (!c.getContext("webgl2")) return no;
  } catch {
    return no;
  }
  const touch = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
  return { run: true, quality: touch || cores < 8 ? "low" : "high", touch };
}

/**
 * The page's fixed WebGL backdrop. Sections marked `data-stage` are transparent windows onto it; every other section
 * paints its own background over it. It renders frames only while a stage is on screen.
 */
export function FieldStage() {
  const [p, setP] = useState<Plan | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pl = plan();
    if (!pl.run) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      setP(pl);
      setEnabled(true);
    };
    const events = ["pointerdown", "touchstart", "scroll", "keydown", "wheel", "pointermove"] as const;
    const cleanup = () => events.forEach((e) => window.removeEventListener(e, go));
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    let idle = 0;
    if (!pl.touch) {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      idle = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 1800 }) : window.setTimeout(go, 700);
    }
    return () => {
      done = true;
      cleanup();
      if (idle) (window.cancelIdleCallback ?? clearTimeout)(idle);
    };
  }, []);

  useEffect(() => {
    const stages = Array.from(document.querySelectorAll("[data-stage]"));
    if (!stages.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setActive(visible.size > 0);
      },
      { rootMargin: "80px" },
    );
    stages.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, [enabled]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#050507]">
      {/* the horizon glow and a still wave: what shows before (or instead of) the 3D */}
      <div className="absolute inset-x-0 top-[38%] h-[60%] bg-[radial-gradient(60%_55%_at_50%_30%,rgba(255,92,38,0.32),transparent_70%)]" />
      <svg
        className={`absolute inset-x-0 top-[46%] h-[22%] w-full transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fs-g" x1="0" x2="1">
            <stop offset="0" stopColor="#ff4d2e" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ff8a4c" />
            <stop offset="1" stopColor="#ff4d2e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M0 100 ${Array.from({ length: 49 }, (_, k) => {
              const x = k * 25;
              const env = Math.exp(-(((x - 600) / 330) ** 2));
              const y = 100 - Math.sin(k * 0.9 + i * 0.8) * 70 * env * (1 - i * 0.17);
              return `L${x} ${y.toFixed(1)}`;
            }).join(" ")}`}
            fill="none"
            stroke="url(#fs-g)"
            strokeWidth={1.5 - i * 0.2}
            opacity={1 - i * 0.18}
          />
        ))}
      </svg>
      {enabled && p && (
        <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${ready ? "opacity-100" : "opacity-0"}`}>
          <VoiceField active={active} quality={p.quality} />
        </div>
      )}
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(0,0,0,0.75))]" />
    </div>
  );
}
