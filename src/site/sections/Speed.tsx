"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Heading, Pill } from "@/site/ui";
import { reducedMotion, useInView, useScene } from "@/site/motion";
import { useTextFlow, useVoiceLevel, useWidth } from "@/site/sections/Hero";

// Speaking is nearly four times faster than typing. Two panels side by side: a keyboard typing at 40 words a minute,
// and FireVoice writing at 150. On wide screens the section pins and, as you scroll, FireVoice takes the whole width
// while the keyboard shrinks to a sliver. The markup is the still, side-by-side layout (what reduced motion and phones
// see); the scene animates away from it.

const TYPED = "Hi Sam, I was thinking we could move the meeting to Thursday.";
const SPOKEN = "Hi Sam, I was thinking we could move the meeting to Thursday. Does two o'clock still work for you? I'll send the notes after.";
const MS_PER_CHAR = 300; // 40 words a minute, at five characters a word

/** Types TYPED one character at a time, waits, clears, and goes again; full text when still. */
function useTyping(running: boolean) {
  const [n, setN] = useState(TYPED.length);
  useEffect(() => {
    if (!running || reducedMotion()) return;
    let i = 0;
    let id = 0;
    const step = () => {
      i += 1;
      setN(Math.min(i, TYPED.length));
      if (i <= TYPED.length) id = window.setTimeout(step, MS_PER_CHAR * (0.7 + Math.random() * 0.6));
      else
        id = window.setTimeout(() => {
          i = 0;
          setN(0);
          id = window.setTimeout(step, 600);
        }, 2200);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setN(0);
    id = window.setTimeout(step, 500);
    return () => window.clearTimeout(id);
  }, [running]);
  return n;
}

function KeyboardPanel({ running }: { running: boolean }) {
  const n = useTyping(running);
  return (
    <div className="kb-panel relative h-[300px] overflow-hidden rounded-[28px] border border-line bg-[rgba(255,245,235,0.05)] md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[30%]">
      <div className="kb-inner flex h-full flex-col p-6 sm:p-7">
        <p className="text-[13px] font-medium text-muted">Keyboard &middot; 40 wpm</p>
        <p className="mt-4 flex items-baseline gap-2">
          <span className="num-kb display text-[64px] leading-none">40</span>
          <span className="text-[14px] text-muted">words a minute</span>
        </p>
        <div className="mt-auto rounded-[18px] border border-line bg-[rgba(0,0,0,0.18)] p-4">
          <p className="h-[6.6em] overflow-hidden text-[15.5px] leading-[1.65] text-ink-2" aria-label={TYPED}>
            <span aria-hidden>{TYPED.slice(0, n)}</span>
            <span className="ml-px inline-block h-[1.15em] w-[2px] translate-y-[0.2em] animate-blink bg-fire-2 motion-reduce:hidden" aria-hidden />
          </p>
        </div>
      </div>
    </div>
  );
}

function VoicePanel({ running }: { running: boolean }) {
  const [boxRef, W] = useWidth<HTMLDivElement>(1100);
  const svgRef = useRef<SVGSVGElement>(null);
  const phone = W < 560;
  const H = phone ? 150 : 220;
  const n = (v: number) => v.toFixed(1);
  const path = phone
    ? `M -20 ${n(H * 0.7)} C ${n(W * 0.3)} ${n(H * 0.2)} ${n(W * 0.6)} ${n(H * 0.85)} ${n(W + 20)} ${n(H * 0.35)}`
    : `M -20 ${n(H * 0.72)} C ${n(W * 0.2)} ${n(H * 0.18)} ${n(W * 0.42)} ${n(H * 0.18)} ${n(W * 0.6)} ${n(H * 0.55)} S ${n(W * 0.88)} ${n(H * 0.9)} ${n(W + 20)} ${n(H * 0.35)}`;
  const size = phone ? 19 : 28;
  const reps = Math.ceil(W / (size * 60 * 0.5)) + 2;
  useTextFlow(svgRef, running, `${W}`);
  const level = useVoiceLevel(running, 0.75);

  return (
    <div
      ref={boxRef}
      className="fv-panel relative isolate h-[420px] overflow-hidden rounded-[28px] md:absolute md:inset-0 md:h-auto md:[clip-path:inset(0%_0%_0%_32%_round_28px)]"
      style={{ background: "linear-gradient(140deg,#ff8a4c 0%,#f0531f 38%,#b6320d 70%,#6e1a07 100%)" }}
    >
      {/* the warm art: soft glowing shapes drifting slowly */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <span className="speed-blob absolute -top-[20%] left-[30%] size-[55%] rounded-full bg-[#ffc27a] opacity-60 blur-[70px]" style={{ animationPlayState: running ? "running" : "paused" }} />
        <span className="speed-blob absolute -bottom-[30%] left-[-5%] size-[60%] rounded-full bg-[#ff4d2e] opacity-70 blur-[80px] [animation-delay:-6s]" style={{ animationPlayState: running ? "running" : "paused" }} />
        <span className="speed-blob absolute top-[25%] right-[-10%] size-[45%] rounded-full bg-[#7a1c06] opacity-70 blur-[70px] [animation-delay:-12s]" style={{ animationPlayState: running ? "running" : "paused" }} />
        <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(40,8,2,0.55),transparent_60%)]" />
      </div>

      {/* labels, pinned to the visible left edge */}
      <div className="fv-full absolute inset-0 md:[transform:translateX(32%)]">
        <div className="p-6 text-white sm:p-7">
          <p className="text-[13px] font-medium text-white/85">FireVoice &middot; 150 wpm</p>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="num-fv display text-[64px] leading-none text-white">150</span>
            <span className="text-[14px] text-white/85">words a minute</span>
          </p>
        </div>
      </div>

      {/* the words flowing on a curve, and the pill, centred in the visible part */}
      <div className="fv-half absolute inset-0 md:[transform:translateX(16%)]" aria-hidden>
        <svg ref={svgRef} className="absolute top-[52%] left-0 w-full -translate-y-1/2 overflow-visible md:top-1/2" style={{ height: H }} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <path id="speed-curve" d={path} />
          </defs>
          <use href="#speed-curve" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.25" strokeDasharray="1 8" strokeLinecap="round" />
          <text data-flow data-reps={reps} data-speed={phone ? 90 : 150} fontSize={size} fill="#fff" fontWeight={500} dominantBaseline="central" style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.015em" }}>
            <textPath href="#speed-curve" startOffset="0">
              {Array.from({ length: reps }, () => `${SPOKEN} `).join("")}
            </textPath>
          </text>
        </svg>
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 sm:bottom-9">
          <Pill state="listening" level={level} size={phone ? "md" : "lg"} />
        </div>
      </div>
      <p className="sr-only">{SPOKEN}</p>
    </div>
  );
}

export function Speed() {
  const [viewRef, inView] = useInView<HTMLDivElement>("60px");
  const ref = useScene<HTMLElement>(({ el, mm }) => {
    // the numbers count up as the panels arrive (any width)
    mm.add("(min-width: 0px)", () => {
      const nums = [
        { node: el.querySelector<HTMLElement>(".num-kb"), to: 40 },
        { node: el.querySelector<HTMLElement>(".num-fv"), to: 150 },
      ];
      nums.forEach((x) => x.node && (x.node.textContent = "0"));
      const counter = { v: 0 };
      const tween = gsap.to(counter, {
        v: 1,
        duration: 1.6,
        ease: "power3.out",
        paused: true,
        onUpdate: () => nums.forEach((x) => x.node && (x.node.textContent = String(Math.round(x.to * counter.v)))),
      });
      gsap.timeline({ scrollTrigger: { trigger: ".speed-box", start: "top 75%", once: true, onEnter: () => void tween.play() } });
      return () => nums.forEach((x) => x.node && (x.node.textContent = String(x.to)));
    });

    // wide screens: pin the panels and let FireVoice take the room
    mm.add("(min-width: 768px)", () => {
      const r = "round 28px";
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".speed-stage", start: "center center", end: "+=160%", pin: true, scrub: 0.6, anticipatePin: 1 },
      });
      tl.fromTo(".fv-panel", { clipPath: `inset(0% 0% 0% 32% ${r})` }, { clipPath: `inset(0% 0% 0% 4% ${r})`, duration: 0.6 }, 0.05)
        .fromTo(".fv-full", { x: 0, xPercent: 32 }, { xPercent: 4, duration: 0.6 }, 0.05)
        .fromTo(".fv-half", { x: 0, xPercent: 16 }, { xPercent: 2, duration: 0.6 }, 0.05)
        .fromTo(".kb-panel", { clipPath: `inset(0% 0% 0% 0% ${r})` }, { clipPath: `inset(0% 92% 0% 0% ${r})`, duration: 0.6 }, 0.05)
        .to(".kb-inner", { opacity: 0, duration: 0.25 }, 0.12)
        .to(".kb-panel", { opacity: 0, x: -16, duration: 0.25 }, 0.68)
        .to(".fv-panel", { clipPath: `inset(0% 0% 0% 0% ${r})`, duration: 0.3 }, 0.7)
        .to(".fv-full", { xPercent: 0, duration: 0.3 }, 0.7)
        .to(".fv-half", { xPercent: 0, duration: 0.3 }, 0.7)
        .to({}, { duration: 0.1 });
    });

    // phones: the panels simply rise in
    mm.add("(max-width: 767px)", () => {
      gsap.from([".kb-panel", ".fv-panel"], { y: 36, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: ".speed-box", start: "top 82%", once: true } });
    });
  });

  return (
    <section
      ref={ref}
      id="speed"
      aria-labelledby="speed-title"
      className="on-dark relative z-[3] -mt-[var(--sheet-r)] rounded-[var(--sheet-r)] bg-deep pt-24 pb-24 sm:pt-32 sm:pb-32"
    >
      <style>{`
        @keyframes speed-drift {
          0% { transform: translate3d(0,0,0) scale(1); }
          33% { transform: translate3d(8%,6%,0) scale(1.08); }
          66% { transform: translate3d(-6%,4%,0) scale(0.95); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        .speed-blob { animation: speed-drift 18s ease-in-out infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .speed-blob { animation: none; } }
      `}</style>
      <div className="container-x">
        <Heading lede="Most people type about 40 words a minute and speak about 150. FireVoice keeps up, so you can write at the speed you think.">
          <span id="speed-title">
            Nearly 4&times; faster <em>than typing</em>
          </span>
        </Heading>
        <div className="speed-stage mt-14 sm:mt-16">
          <div ref={viewRef} className="speed-box relative flex flex-col gap-4 md:block md:h-[clamp(420px,62vh,560px)]">
            <KeyboardPanel running={inView} />
            <VoicePanel running={inView} />
          </div>
        </div>
      </div>
    </section>
  );
}
