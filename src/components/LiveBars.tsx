"use client";

import { useEffect, useRef } from "react";
import { getLevel, onFrame } from "@/lib/audio-engine";

/** Audio bars that move with the shared voice level. Static when the visitor prefers reduced motion. */
export function LiveBars({ n = 28, className = "", gain = 1 }: { n?: number; className?: string; gain?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bars = Array.from(el.children) as HTMLElement[];
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const off = onFrame((t) => {
      const level = getLevel();
      if (!visible) return;
      for (let i = 0; i < bars.length; i++) {
        const w = 0.5 + 0.5 * Math.sin(i * 0.9 + t * 7) * Math.sin(i * 0.37 - t * 3.1);
        const h = 0.14 + Math.min(1, level * gain * (0.5 + w)) * 0.86;
        bars[i].style.transform = `scaleY(${h.toFixed(3)})`;
      }
    });
    return () => {
      off();
      io.disconnect();
    };
  }, [gain]);
  return (
    <div ref={ref} className={`flex min-w-0 items-center gap-[3px] overflow-hidden ${className}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-center rounded-full bg-current will-change-transform"
          style={{ transform: `scaleY(${(0.2 + Math.abs(Math.sin(i * 1.3)) * 0.5).toFixed(2)})` }}
        />
      ))}
    </div>
  );
}
