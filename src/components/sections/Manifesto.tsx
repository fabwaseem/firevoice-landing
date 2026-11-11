"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LINES = [
  ["Every", "script", "you", "write."],
  ["Every", "voice", "you", "clone."],
  ["Every", "word", "you", "dictate."],
  ["It", "all", "stays", "on", "your", "computer."],
];
const TAIL = ["No cloud.", "No credits.", "No one listening."];

/** A pinned paragraph that lights up word by word as you scroll through it. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-mw]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => (w.style.opacity = "1"));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress * 1.15;
        words.forEach((w, i) => {
          const at = i / words.length;
          const o = Math.min(1, Math.max(0.4, (p - at) * words.length * 0.35 + 0.4));
          w.style.opacity = o.toFixed(3);
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={root} data-stage aria-label="Private by design" className="stage relative h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="absolute inset-0 bg-[#050507]/70 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" aria-hidden />
        <div className="container-x relative">
          <p className="eyebrow mb-8 !text-[#ff9c6e]">Private by design</p>
          <p className="max-w-5xl text-[clamp(2rem,5.4vw,4.6rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-white">
            {LINES.map((line, li) => (
              <span key={li} className="block">
                {line.map((w, wi) => (
                  <span key={wi} data-mw className="inline-block opacity-40 will-change-[opacity]">
                    {w}&nbsp;
                  </span>
                ))}
              </span>
            ))}
            <span className="mt-4 block">
              {TAIL.map((w) => (
                <span key={w} data-mw className="accent mr-[0.35em] inline-block opacity-40">
                  {w}
                </span>
              ))}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
