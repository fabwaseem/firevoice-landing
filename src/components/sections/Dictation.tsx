"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { LiveBars } from "../LiveBars";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui";
import { playDemo } from "@/lib/voice-level";

const SENTENCE =
  "Hi Sam, thanks for the notes. I moved the launch to Thursday so the team has time to test the installer. Talk soon!";

function Key({ children, down }: { children: React.ReactNode; down: boolean }) {
  return (
    <kbd
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 font-sans text-[14px] font-medium transition-all duration-200 ${
        down
          ? "translate-y-[2px] border-fire/50 bg-fire-soft text-fire-ink shadow-none"
          : "border-line-strong bg-surface text-ink-2 shadow-[0_3px_0_0_var(--line-strong)]"
      }`}
    >
      {children}
    </kbd>
  );
}

function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? SENTENCE.length : 0);
  const [phase, setPhase] = useState<"idle" | "listening" | "typing" | "done">(reduce ? "done" : "idle");

  useEffect(() => {
    if (!inView || reduce) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      if (cancelled) return;
      setTyped(0);
      setPhase("listening");
      playDemo(2.6);
      timers.push(
        setTimeout(() => {
          setPhase("typing");
          let i = 0;
          const step = () => {
            if (cancelled) return;
            i = Math.min(SENTENCE.length, i + 2 + Math.floor(Math.random() * 3));
            setTyped(i);
            if (i < SENTENCE.length) timers.push(setTimeout(step, 28));
            else {
              setPhase("done");
              timers.push(setTimeout(run, 3800));
            }
          };
          step();
        }, 2600),
      );
    };
    timers.push(setTimeout(run, 400));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce]);

  const listening = phase === "listening";
  return (
    <div ref={ref}>
      <div className="relative">
      <div className="card overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="ml-3 text-[12px] text-faint">Mail · New message</span>
        </div>
        <div className="space-y-3 p-5 text-[14px]">
          <div className="flex gap-3 border-b border-line pb-3">
            <span className="w-14 text-faint">To</span>
            <span className="text-ink-2">Sam Rivera</span>
          </div>
          <div className="flex gap-3 border-b border-line pb-3">
            <span className="w-14 text-faint">Subject</span>
            <span className="text-ink-2">Launch date</span>
          </div>
          <p className="min-h-[96px] text-[15px] leading-relaxed text-ink" aria-live="off">
            {SENTENCE.slice(0, typed)}
            {phase !== "done" && <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-blink bg-fire" aria-hidden />}
          </p>
        </div>
      </div>

      {/* the floating dictation pill, like the app's overlay */}
      <div
        className={`absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line-strong bg-surface/90 py-2 pl-2 pr-4 shadow-lg backdrop-blur transition-all duration-500 ${
          phase === "idle" ? "translate-y-2 opacity-0" : "opacity-100"
        }`}
      >
        <span className="grid size-8 place-items-center rounded-full fire-gradient text-white">
          {phase === "done" ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-white" />}
        </span>
        <LiveBars n={18} className={`h-6 ${listening ? "text-fire" : "text-faint"}`} gain={listening ? 1.5 : 0.2} />
        <span className="w-[86px] text-[13px] font-medium text-ink-2">
          {listening ? "Listening" : phase === "typing" ? "Typing" : "Done"}
        </span>
      </div>
      </div>
      <div className="mt-14 flex items-center justify-center gap-2" aria-label="Default shortcut: Ctrl + Alt + Space">
        <Key down={listening}>Ctrl</Key>
        <span className="text-faint">+</span>
        <Key down={listening}>Alt</Key>
        <span className="text-faint">+</span>
        <Key down={listening}>
          <span className="px-4">Space</span>
        </Key>
      </div>
    </div>
  );
}

const points = [
  { t: "Works in every program", d: "Mail, chat, documents, code editors: if there is a cursor, FireVoice can type there." },
  { t: "Hold to talk, or press to toggle", d: "Hold the shortcut while you speak, or tap it once to start and once to stop." },
  { t: "Clean words, your words", d: "Leaves out um and uh, and spells names and terms the way your dictionary says." },
  { t: "Private by design", d: "Speech is turned into text on your GPU. No audio leaves the computer." },
];

export function Dictation() {
  return (
    <section id="dictation" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--line-strong),transparent)]" />
      <div className="container-x grid items-center gap-16 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Dictation"
            title={<>Speak in any program. <span className="accent">It types.</span></>}
          >
            Hold a shortcut, say what you mean, let go. FireVoice writes it where your cursor is, faster
            than you could type it.
          </SectionHeader>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {points.map((p, i) => (
              <Reveal as="li" key={p.t} delay={i * 0.06}>
                <p className="font-medium text-ink">{p.t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{p.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal>
          <Demo />
        </Reveal>
      </div>
    </section>
  );
}
