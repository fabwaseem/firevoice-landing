"use client";

import { useEffect, useState } from "react";
import { Mail } from "@/components/icons";
import { DownloadButton, Pill, type PillState } from "@/site/ui";
import { Reveal, reducedMotion, useInView } from "@/site/motion";

// The last word before the footer: a compact fire-gradient card. On the left the promise and the download; on the
// right a little email being dictated, the pill looping listening, writing, tick while the card is on screen.

const SENTENCE = "Thanks Sam, the draft looks great. Let's send it to the team on Friday.";
const STEPS: { s: PillState; ms: number }[] = [
  { s: "listening", ms: 2600 },
  { s: "writing", ms: 1300 },
  { s: "done", ms: 2400 },
];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function Demo({ run }: { run: boolean }) {
  // the finished state is the default (and what reduced motion keeps)
  const [step, setStep] = useState(2);
  const [level, setLevel] = useState(0.6);
  const state = STEPS[step].s;

  useEffect(() => {
    if (!run || reducedMotion()) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEPS[step].ms);
    return () => window.clearTimeout(t);
  }, [run, step]);

  useEffect(() => {
    if (!run || state !== "listening") return;
    let k = 0;
    const id = window.setInterval(() => {
      k += 1;
      setLevel(0.35 + 0.6 * Math.abs(Math.sin(k * 0.9) * Math.cos(k * 0.37)));
    }, 130);
    return () => window.clearInterval(id);
  }, [run, state]);

  return (
    <div className="relative mx-auto w-full max-w-[420px]" aria-hidden>
      <div className="rounded-[20px] border border-white/30 bg-white/[0.94] p-4 text-[#111318] shadow-[0_30px_60px_-30px_rgba(90,10,20,.7)] sm:p-5">
        <div className="flex items-center gap-2 border-b border-black/[0.07] pb-3 text-[12.5px] text-[#676d7b]">
          <span className="grid size-7 place-items-center rounded-full bg-[#fff1eb] text-[#d9431a]">
            <Mail className="size-3.5" />
          </span>
          <span>
            To: <span className="font-medium text-[#3a3f4b]">Sam</span>
          </span>
          <span className="ml-auto">Re: Launch draft</span>
        </div>
        <p className="mt-3 min-h-[3.2em] text-[15.5px] leading-snug sm:text-[16.5px]">
          {state === "done" ? (
            <span key={step} className="cl-type">
              {SENTENCE}
            </span>
          ) : state === "writing" ? (
            <span className="text-[#979dab]">Writing…</span>
          ) : (
            <span className="text-[#979dab]">Listening…</span>
          )}
          <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-blink bg-[#ff5a2d]" />
        </p>
      </div>
      <div className="mt-5 flex h-14 justify-center">
        <Pill state={state} level={level} size="lg" label={state === "listening" ? "Listening" : undefined} />
      </div>
    </div>
  );
}

export function Closing() {
  const [viewRef, inView] = useInView<HTMLDivElement>("0px");
  return (
    <section id="closing" aria-labelledby="closing-title" className="relative pt-6 pb-16 sm:pb-24">
      <style>{`
        @keyframes cl-drift { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(6%,8%,0) scale(1.12); } 100% { transform: translate3d(-5%,3%,0) scale(.95); } }
        @keyframes cl-type { from { opacity: 0; transform: translate3d(0,4px,0); } to { opacity: 1; transform: none; } }
        #closing .cl-glow { animation: cl-drift 18s ease-in-out infinite alternate; animation-play-state: var(--ps, paused); }
        #closing .cl-type { display: inline; animation: cl-type .5s cubic-bezier(0.25,1,0.5,1) both; }
        #closing .cl-em { background: none; -webkit-background-clip: border-box; background-clip: border-box; color: #fff; }
        @media (prefers-reduced-motion: reduce) { #closing .cl-glow, #closing .cl-type { animation: none !important; } }
      `}</style>
      <div className="container-x">
        <Reveal>
          <div
            ref={viewRef}
            className="relative isolate overflow-hidden rounded-[28px] text-white shadow-[0_40px_80px_-40px_rgba(226,50,92,.6)]"
            style={{ background: "linear-gradient(115deg, #e2325c 0%, #ff5a2d 52%, #ff8a4c 100%)", ["--ps" as string]: inView ? "running" : "paused" }}
          >
            {/* light: two soft glows drifting, a darker side behind the words, and fine grain */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
              <div className="cl-glow absolute -top-1/3 right-[-10%] aspect-square w-[60%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,214,150,.55), rgba(255,214,150,0) 65%)" }} />
              <div className="cl-glow absolute -bottom-1/2 left-[20%] aspect-square w-[50%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,120,80,.45), rgba(255,120,80,0) 65%)", animationDelay: "-9s" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(70,6,24,.34) 0%, rgba(70,6,24,.14) 45%, rgba(70,6,24,0) 70%)" }} />
              <div className="absolute inset-0 opacity-[0.16] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
            </div>

            <div className="grid items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:px-14">
              <div>
                <h2 id="closing-title" className="display display-lg text-white">
                  Your next email is <em className="cl-em">one sentence away.</em>
                </h2>
                <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/90">FireVoice is free. Install it, press the shortcut, and talk.</p>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <DownloadButton tone="line" className="!border-white !bg-white !text-[#111318] hover:!bg-white/90" />
                  <p className="text-[14px] font-medium text-white/90">Windows, macOS and Linux · Free</p>
                </div>
              </div>
              <Demo run={inView} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
