"use client";

import { gsap } from "gsap";
import { DownloadButton } from "@/site/ui";
import { useInView, useScene } from "@/site/motion";

// The last word before the footer: a big warm panel of drifting fire light (CSS only), the promise and the download.
// The light drifts only while on screen, sits still with reduced motion, and moves slower than the words as you scroll.

const BLOBS = [
  { c: "#ff5a2d", w: "46%", l: "-8%", t: "-14%", o: 0.75, d: 26, a: "cl-a" },
  { c: "#8a1d0c", w: "58%", l: "52%", t: "-20%", o: 0.9, d: 32, a: "cl-b" },
  { c: "#ff8a4c", w: "40%", l: "66%", t: "52%", o: 0.6, d: 28, a: "cl-a" },
  { c: "#7a2410", w: "62%", l: "-14%", t: "48%", o: 0.95, d: 36, a: "cl-b" },
  { c: "#ff6a3d", w: "30%", l: "34%", t: "70%", o: 0.45, d: 30, a: "cl-c" },
];

const WAVE = Array.from({ length: 88 }, (_, i) => {
  const x = i / 87;
  return 0.18 + 0.82 * Math.abs(Math.sin(x * 9.3) * Math.cos(x * 3.1 + 0.6)) * (0.55 + 0.45 * Math.sin(x * Math.PI));
});

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function Closing() {
  const [viewRef, inView] = useInView<HTMLDivElement>("120px");

  const ref = useScene<HTMLElement>(({ el }) => {
    // the art drifts slower than the words: it lags behind as the panel passes
    gsap.fromTo(".cl-art", { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  return (
    <section ref={ref} id="closing" aria-labelledby="closing-title" className="relative px-3 pt-8 pb-6 sm:px-4 sm:pt-12">
      <style>{`
        @keyframes cl-a { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(8%,6%,0) scale(1.12); } 100% { transform: translate3d(-4%,10%,0) scale(.96); } }
        @keyframes cl-b { 0% { transform: translate3d(0,0,0) scale(1.05); } 50% { transform: translate3d(-9%,8%,0) scale(.94); } 100% { transform: translate3d(5%,-6%,0) scale(1.1); } }
        @keyframes cl-c { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(-14%,-10%,0); } 100% { transform: translate3d(10%,-4%,0); } }
        @keyframes cl-wave { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        #closing .cl-blob { animation-direction: alternate; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
        @media (prefers-reduced-motion: reduce) { #closing .cl-blob, #closing .cl-wave { animation: none !important; } }
      `}</style>
      <div
        ref={viewRef}
        className="sheet-round on-dark relative isolate mx-auto flex min-h-[80vh] max-w-[1440px] items-center justify-center overflow-hidden bg-ember"
        style={{ ["--ps" as string]: inView ? "running" : "paused" }}
      >
        {/* the art */}
        <div className="cl-art pointer-events-none absolute inset-x-0 -top-[14%] -bottom-[14%] -z-10" aria-hidden>
          {BLOBS.map((b, i) => (
            <div
              key={i}
              className="cl-blob absolute aspect-square rounded-full"
              style={{
                width: b.w,
                left: b.l,
                top: b.t,
                opacity: b.o,
                background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, ${b.c}00 68%)`,
                filter: "blur(40px)",
                animationName: b.a,
                animationDuration: `${b.d}s`,
                animationDelay: `${-i * 4}s`,
                animationPlayState: "var(--ps)",
                willChange: "transform",
              }}
            />
          ))}
          {/* a soft dark centre so the words stay readable */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(60% 46% at 50% 50%, rgba(22,17,13,.72) 0%, rgba(22,17,13,.35) 55%, rgba(22,17,13,0) 100%)" }} />
          {/* a faint waveform drifting along the bottom */}
          <div className="absolute inset-x-0 bottom-[17%] h-24 overflow-hidden opacity-[0.13]">
            <div className="cl-wave flex h-full w-[200%]" style={{ animation: "cl-wave 60s linear infinite", animationPlayState: "var(--ps)" }}>
              {[0, 1].map((k) => (
                <div key={k} className="flex h-full w-1/2 items-center justify-between px-1">
                  {WAVE.map((v, i) => (
                    <span key={i} className="w-[3px] rounded-full bg-white" style={{ height: `${Math.round(v * 100)}%` }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
        </div>

        <div className="cl-text relative px-5 py-24 text-center sm:px-10">
          <h2 id="closing-title" className="display display-lg mx-auto max-w-4xl">
            You think faster than you type. <em className="text-[#ffb48f]">Now you can write that fast too.</em>
          </h2>
          <p className="lede mx-auto mt-7 max-w-xl text-[#efe4d8]">FireVoice is free. Download it and say your first sentence in a minute.</p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <DownloadButton />
            <p className="text-[13px] text-[#cbbcae]">Windows and Linux</p>
          </div>
        </div>
      </div>
    </section>
  );
}
