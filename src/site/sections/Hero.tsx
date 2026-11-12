"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { DownloadButton, Pill } from "@/site/ui";
import { reducedMotion, useInView } from "@/site/motion";

// The opening: the promise in one line, the download, and the signature drawing under it. Spoken words (with their
// ums and repeats) drift in from the left along a curve into the FireVoice pill; finished writing rides out to the right
// on a dark ink band.

/** Moves every `<text data-flow>` inside `svg` along its textPath, continuously, while `running`. Each lane's text is
 * one phrase repeated `data-reps` times; startOffset slides by one phrase length and wraps, so the flow never ends.
 * `data-speed` is in px a second. Without motion (or paused) the lanes stay where they are; the first frame is set at
 * once so the drawing is never empty. */
export function useTextFlow(svgRef: RefObject<SVGSVGElement | null>, running: boolean, key: unknown) {
  const elapsed = useRef(7.5); // seconds of flow so far; starting mid-way puts words under the pill at once
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const lanes = Array.from(svg.querySelectorAll<SVGTextElement>("text[data-flow]")).map((t) => ({
      t,
      tp: t.querySelector("textPath"),
      reps: Number(t.dataset.reps) || 1,
      speed: Number(t.dataset.speed) || 60,
      len: 0,
    }));
    const measure = () => {
      for (const l of lanes) l.len = l.t.getComputedTextLength() / l.reps;
    };
    const place = () => {
      for (const l of lanes) {
        if (!l.tp || !l.len) continue;
        const p = (elapsed.current * l.speed) % l.len;
        l.tp.setAttribute("startOffset", (p - l.len).toFixed(2));
      }
    };
    measure();
    place();
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      measure();
      place();
    });
    if (!running || reducedMotion()) return () => void (alive = false);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsed.current += Math.min(0.05, (now - last) / 1000);
      last = now;
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [svgRef, running, key]);
}

/** A voice-like level (0..1) for the pill: syllables on top of a slow phrase swell, with short breaths. */
export function useVoiceLevel(running: boolean, rest = 0.6) {
  const [level, setLevel] = useState(rest);
  useEffect(() => {
    if (!running || reducedMotion()) return;
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const t = (performance.now() - t0) / 1000;
      const phrase = 0.55 + 0.45 * Math.sin(t * 0.9);
      const syllable = Math.abs(Math.sin(t * 7.3)) * 0.6 + Math.abs(Math.sin(t * 11.1 + 1)) * 0.4;
      const breath = Math.sin(t * 0.55) > 0.86 ? 0.15 : 1;
      setLevel(Math.max(0.08, Math.min(1, (0.2 + 0.8 * phrase * syllable) * breath)));
    }, 110);
    return () => window.clearInterval(id);
  }, [running]);
  return level;
}

/** The width of an element, kept up to date. */
export function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const RAW: { w: string; filler?: boolean }[] = [
  { w: "um", filler: true },
  { w: "so I was thinking we could" },
  { w: "uh", filler: true },
  { w: "move the" },
  { w: "the", filler: true },
  { w: "meeting to" },
  { w: "like", filler: true },
  { w: "Thursday..." },
];
const CLEAN = "I was thinking we could move the meeting to Thursday.";

function Scene() {
  const [boxRef, W] = useWidth<HTMLDivElement>(1440);
  const [viewRef, inView] = useInView<HTMLDivElement>("80px");
  const svgRef = useRef<SVGSVGElement>(null);
  const phone = W < 640;
  const H = phone ? 170 : W < 1100 ? 230 : 260;
  const cy = H / 2;
  const a = phone ? H * 0.17 : H * 0.25;
  const n = (v: number) => v.toFixed(1);
  // an S across the screen: up on the left, into the pill level, down on the right, out
  const left = `M -24 ${n(cy + a * 0.55)} C ${n(W * 0.07)} ${n(cy + a * 0.55)} ${n(W * 0.12)} ${n(cy - a)} ${n(W * 0.24)} ${n(cy - a)} C ${n(W * 0.36)} ${n(cy - a)} ${n(W * 0.4)} ${n(cy)} ${n(W * 0.5)} ${n(cy)}`;
  const right = `M ${n(W * 0.5)} ${n(cy)} C ${n(W * 0.6)} ${n(cy)} ${n(W * 0.64)} ${n(cy + a)} ${n(W * 0.76)} ${n(cy + a)} C ${n(W * 0.88)} ${n(cy + a)} ${n(W * 0.93)} ${n(cy - a * 0.55)} ${n(W + 24)} ${n(cy - a * 0.55)}`;
  const rawSize = phone ? 14.5 : 19;
  const cleanSize = phone ? 13.5 : 17;
  const band = phone ? 32 : 46;
  // enough copies to fill a lane plus one phrase of slack (a phrase is ~ 28 characters wide at 0.5em each, at least)
  const rawReps = Math.ceil(W / (rawSize * 28 * 0.5)) + 2;
  const cleanReps = Math.ceil(W / (cleanSize * 30 * 0.5)) + 2;

  useTextFlow(svgRef, inView, `${W}`);
  const level = useVoiceLevel(inView);

  return (
    <div ref={viewRef} className="enter relative w-full" style={{ "--i": 5 } as CSSProperties} aria-hidden>
      <div ref={boxRef} className="relative h-[170px] w-full sm:h-[230px] min-[1100px]:h-[260px]">
        <svg ref={svgRef} className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <path id="hero-in" d={left} />
            <path id="hero-out" d={right} />
            <linearGradient id="hero-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W * 0.5} y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset={phone ? 0.22 : 0.18} stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="1" />
            </linearGradient>
            <mask id="hero-mask" maskUnits="userSpaceOnUse" x="-40" y="-40" width={W + 80} height={H + 80}>
              <rect x="-40" y="-40" width={W * 0.5 + 40} height={H + 80} fill="url(#hero-fade)" />
            </mask>
            <linearGradient id="hero-band" gradientUnits="userSpaceOnUse" x1={W * 0.5} y1="0" x2={W} y2="0">
              <stop offset="0" stopColor="#2a1d14" />
              <stop offset="0.25" stopColor="#17130f" />
              <stop offset="1" stopColor="#17130f" />
            </linearGradient>
          </defs>

          {/* spoken: a faint guide and the raw words drifting in */}
          <g mask="url(#hero-mask)">
            <use href="#hero-in" fill="none" stroke="var(--line-strong)" strokeWidth="1.25" strokeDasharray="1 7" strokeLinecap="round" />
            <text data-flow data-reps={rawReps} data-speed={phone ? 34 : 52} fontSize={rawSize} fill="var(--muted)" dominantBaseline="central" style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.01em" }}>
              <textPath href="#hero-in" startOffset="0">
                {Array.from({ length: rawReps }, (_, r) =>
                  RAW.map((p, i) => (
                    <tspan key={`${r}-${i}`} fill={p.filler ? "var(--faint)" : undefined} fontStyle={p.filler ? "italic" : undefined} opacity={p.filler ? 0.75 : undefined}>
                      {p.w}{" "}
                    </tspan>
                  )),
                )}
                {" "}
              </textPath>
            </text>
          </g>

          {/* written: the ink band and the clean sentence riding out */}
          <use href="#hero-out" fill="none" stroke="url(#hero-band)" strokeWidth={band} strokeLinecap="round" />
          <use href="#hero-out" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={band - 2} strokeLinecap="round" transform="translate(0,-1)" />
          <text data-flow data-reps={cleanReps} data-speed={phone ? 30 : 46} fontSize={cleanSize} fill="#f6efe6" fontWeight={500} dominantBaseline="central" style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.005em" }}>
            <textPath href="#hero-out" startOffset="0">
              {Array.from({ length: cleanReps }, () => `${CLEAN}  `).join("")}
            </textPath>
          </text>
        </svg>

        {/* the pill, where speech turns into writing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,51,0.22),transparent)] blur-md" />
          <Pill state="listening" level={level} size={phone ? "sm" : "lg"} className="relative" />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative z-[1] flex min-h-[calc(100svh-70px)] flex-col justify-center overflow-hidden bg-bg pt-10 pb-[calc(var(--sheet-r)+56px)] sm:pt-16">
      <div className="container-x text-center">
        <p className="eyebrow enter" style={{ "--i": 0 } as CSSProperties}>
          FireVoice dictation
        </p>
        <h1 className="display display-xl enter mt-5" style={{ "--i": 1 } as CSSProperties}>
          Say it. <em>It&rsquo;s written.</em>
        </h1>
        <p className="lede enter mx-auto mt-6 max-w-[34rem]" style={{ "--i": 2 } as CSSProperties}>
          Speak in any app and clean, finished writing appears where your cursor is. Free, and it runs on your own computer.
        </p>
        <div className="enter mt-9 flex flex-col items-center gap-3.5" style={{ "--i": 3 } as CSSProperties}>
          <DownloadButton />
          <p className="text-[13px] text-muted">Windows and Linux &middot; Free &middot; No account needed</p>
        </div>
      </div>
      <div className="mt-8 sm:mt-10">
        <Scene />
      </div>
    </section>
  );
}
