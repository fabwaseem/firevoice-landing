"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { Heading, Pill, type PillState } from "@/site/ui";
import { Reveal, useScene } from "@/site/motion";

// How it works: one dictation in three steps. On a wide screen the scene is pinned and scrubbed by scroll (speak,
// tidy, insert); on phones and with reduced motion the three steps are stacked, each card in its finished state.

type Phase = "speak" | "tidy" | "done";

/** The spoken words, as said; `f` marks what the tidy-up removes. */
const WORDS: { w: string; f?: boolean }[] = [
  { w: "hey", f: true },
  { w: "so", f: true },
  { w: "um", f: true },
  { w: "can" },
  { w: "you" },
  { w: "tell" },
  { w: "the" },
  { w: "team" },
  { w: "the", f: true },
  { w: "the" },
  { w: "launch" },
  { w: "is" },
  { w: "moving" },
  { w: "to" },
  { w: "uh", f: true },
  { w: "Monday" },
];
const CLEAN = "Can you tell the team the launch is moving to Monday?";

const STEPS: { label: string; title: string; text: string; phase: Phase; pill: PillState }[] = [
  {
    label: "Speak",
    title: "Speak naturally",
    text: "Press your shortcut or say “Hey FireVoice”, then talk the way you would to a friend. Ums and restarts are fine.",
    phase: "speak",
    pill: "listening",
  },
  {
    label: "Tidy",
    title: "It tidies as you go",
    text: "Filler words, repeats and false starts drop out, and the punctuation and capitals go in, right on your computer.",
    phase: "tidy",
    pill: "writing",
  },
  {
    label: "Insert",
    title: "It goes in anywhere",
    text: "The finished sentence lands where your cursor is, in any app, and the pill turns into a green tick.",
    phase: "done",
    pill: "done",
  },
];

/** The mock: warm art, a chat window with a message box, the spoken words above the pill. `phase` is the resting
 * look (the stacked cards); the pinned scene starts from "speak" and moves the layers itself. */
function DemoCard({ phase, pill, level = 0.6, className = "" }: { phase: Phase; pill: PillState; level?: number; className?: string }) {
  const done = phase === "done";
  const struck = phase === "tidy";
  return (
    <div aria-hidden className={`relative overflow-hidden rounded-[28px] border border-line bg-[#f6e4d3] shadow-lg ${className}`}>
      {/* warm blurred art */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-20 size-64 rounded-full bg-[#ffb07f] opacity-80 blur-3xl" />
        <div className="absolute -right-24 bottom-6 size-72 rounded-full bg-[#ff6a3d] opacity-55 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 size-40 rounded-full bg-[#ffe2b8] opacity-90 blur-2xl" />
      </div>

      {/* chat window */}
      <div className="relative m-4 overflow-hidden rounded-[18px] bg-white/92 shadow-[0_18px_40px_-22px_rgba(80,30,10,.45)]">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2.5">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[11.5px] font-semibold text-ink-2"># launch</span>
        </div>
        <div className="flex gap-2 px-3 pt-3">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#ffd6c2] text-[10px] font-semibold text-fire-ink">M</span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ink">Maya</p>
            <p className="text-[12px] leading-snug text-ink-2">Is the launch still Friday?</p>
          </div>
        </div>
        <div className="relative m-3 h-[58px] rounded-[12px] border border-line-strong px-3 py-2 text-[12.5px] leading-snug">
          <span className="js-ph absolute top-2 left-3 text-muted" style={{ opacity: done ? 0 : 1 }}>
            Message #launch
          </span>
          <span className="js-final absolute inset-x-3 top-2 text-ink" style={{ opacity: done ? 1 : 0 }}>
            {CLEAN}
            <span className="ml-px inline-block h-[13px] w-px translate-y-[2px] bg-fire" />
          </span>
        </div>
      </div>

      {/* what was said */}
      <div className="relative mx-5 h-[92px]">
        <p className="js-raw absolute inset-x-0 bottom-0 rounded-2xl bg-white/70 px-3.5 py-2.5 text-center text-[13.5px] leading-[1.55] text-ink shadow-[0_8px_24px_-16px_rgba(80,30,10,.5)] backdrop-blur" style={{ opacity: done ? 0 : 1 }}>
          {WORDS.map(({ w, f }, i) => (
            <span key={i}>
              {f ? (
                <span className={`js-f relative inline-block ${struck ? "text-muted" : ""}`}>
                  <span className="js-hl absolute -inset-x-[3px] inset-y-[1px] origin-left rounded-[5px] bg-fire-soft" style={{ transform: `scaleX(${struck ? 1 : 0})` }} />
                  <span className="js-w relative inline-block">{w}</span>
                  <span className="js-st absolute inset-x-0 top-[55%] h-[1.5px] origin-left bg-fire-ink" style={{ transform: `scaleX(${struck ? 1 : 0})` }} />
                </span>
              ) : (
                <span className="js-w inline-block">{w}</span>
              )}{" "}
            </span>
          ))}
        </p>
        <p className="js-clean absolute inset-x-0 bottom-0 rounded-2xl bg-white/80 px-3.5 py-2.5 text-center text-[13.5px] leading-[1.55] font-medium text-ink" style={{ opacity: 0 }}>
          {CLEAN}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex h-9 justify-center">
        <Pill state={pill} level={level} size="sm" />
      </div>
    </div>
  );
}

/** Wide screens with motion: pinned, one step per third of the scroll. */
function Scene() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(0.55);
  const last = useRef({ step: 0, level: 0.55 });

  const ref = useScene<HTMLDivElement>(({ el, mm }) => {
    mm.add("(min-width: 768px)", () => {
      const q = gsap.utils.selector(el);
      const words = q(".js-w");
      gsap.set(words, { opacity: 0, y: 6 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            const s = Math.min(2, Math.floor(p * 3));
            if (s !== last.current.step) {
              last.current.step = s;
              setStep(s);
            }
            if (s === 0) {
              const l = Math.round((0.3 + 0.65 * Math.abs(Math.sin(p * 3 * Math.PI * 7))) * 10) / 10;
              if (l !== last.current.level) {
                last.current.level = l;
                setLevel(l);
              }
            }
          },
        },
      });
      // 1: the words come in as they are said
      tl.to(words, { opacity: 1, y: 0, duration: 0.12, stagger: 0.75 / words.length }, 0.05);
      // 2: filler and repeats are marked, struck, dropped; the tidy sentence takes their place
      tl.to(q(".js-hl"), { scaleX: 1, duration: 0.2, stagger: 0.04 }, 1.05);
      tl.to(q(".js-st"), { scaleX: 1, duration: 0.2, stagger: 0.04 }, 1.2);
      tl.to(q(".js-f"), { opacity: 0, duration: 0.2 }, 1.5);
      tl.to(q(".js-raw"), { opacity: 0, y: -6, duration: 0.2 }, 1.72);
      tl.fromTo(q(".js-clean"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2 }, 1.78);
      // 3: it lands in the message box
      tl.to(q(".js-clean"), { opacity: 0, y: -40, scale: 0.96, duration: 0.25 }, 2.08);
      tl.to(q(".js-ph"), { opacity: 0, duration: 0.15 }, 2.12);
      tl.fromTo(q(".js-final"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 }, 2.2);
      tl.to({}, { duration: 0.01 }, 2.99);
    });
  }, []);

  const cur = STEPS[step];
  return (
    <div ref={ref} className="hidden h-screen items-center md:flex md:motion-reduce:hidden">
      <div className="container-x grid grid-cols-[150px_auto_minmax(0,1fr)] items-center gap-10 lg:grid-cols-[190px_auto_minmax(0,1fr)] lg:gap-16">
        <ol className="space-y-5" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex items-center gap-3" aria-current={i === step ? "step" : undefined}>
              <span className="h-7 w-[3px] overflow-hidden rounded-full bg-line-strong">
                <span className="block h-full w-full origin-top bg-fire transition-transform duration-500" style={{ transform: `scaleY(${i === step ? 1 : 0})` }} />
              </span>
              <span className={`text-[14px] font-medium transition-colors duration-500 ${i === step ? "text-ink" : "text-faint"}`}>
                <span className="mr-2 font-mono text-[11.5px]">0{i + 1}</span>
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        <DemoCard phase="speak" pill={cur.pill} level={level} className="h-[400px] w-[320px]" />

        <div className="relative h-[220px]" aria-live="polite">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="absolute inset-x-0 top-1/2 max-w-md transition-[opacity,transform] duration-500 ease-out-quart"
              style={{ opacity: i === step ? 1 : 0, transform: `translateY(calc(-50% + ${i === step ? 0 : i < step ? -14 : 14}px))` }}
              aria-hidden={i !== step}
            >
              <h3 className="display display-sm">{s.title}</h3>
              <p className="mt-4 text-[16.5px] leading-relaxed text-ink-2">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="relative pt-32 pb-10 md:pt-44 md:pb-0">
      <div className="container-x">
        <Reveal>
          <Heading eyebrow="How it works">
            <span id="how-title">
              Speak the way you think, <em>write in every app.</em>
            </span>
          </Heading>
        </Reveal>
      </div>

      <Scene />

      {/* phones, and wide screens with reduced motion: the three steps, stacked */}
      <ol className="container-x mt-14 grid gap-14 md:hidden md:motion-reduce:mt-20 md:motion-reduce:grid lg:motion-reduce:grid-cols-3 md:motion-reduce:gap-8 md:motion-reduce:pb-32">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.title} className="mx-auto w-full max-w-[340px]">
            <DemoCard phase={s.phase} pill={s.pill} className="h-[400px] w-full" />
            <p className="mt-6 font-mono text-[12px] text-fire-ink">0{i + 1}</p>
            <h3 className="display display-sm mt-1">{s.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{s.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
