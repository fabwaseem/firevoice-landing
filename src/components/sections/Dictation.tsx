"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Check, Keyboard, Mic, ShieldCheck, Sparkles, Wand2, Zap } from "@/components/icons";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui";

const SENTENCE =
  "Hi Sam, thanks for the notes. I moved the launch to Thursday so the team has time to test the installer. Talk soon!";

type Phase = "idle" | "heard" | "listening" | "writing" | "done";

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

const BARS = 16;

/**
 * The dictation pill, as in the app: frosted glass with a glow that follows the voice, a shimmer while it writes,
 * and a green tick once the text is in. Always dark (a "stage"), whatever the theme.
 */
function Pill({ phase }: { phase: Phase }) {
  const glow = useRef<HTMLSpanElement>(null);
  const bars = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const listening = phase === "listening";

  // a made-up voice level (the demo has no microphone): it drives the bars and the glow while "listening"
  useEffect(() => {
    const g = glow.current;
    const b = bars.current;
    if (!g || !b) return;
    const kids = Array.from(b.children) as HTMLElement[];
    const set = (lvl: number, t: number) => {
      g.style.opacity = (0.28 + lvl * 0.62).toFixed(3);
      g.style.transform = `scale(${(0.92 + lvl * 0.2).toFixed(3)})`;
      for (let i = 0; i < kids.length; i++) {
        const w = 0.5 + 0.5 * Math.sin(i * 0.9 + t * 9) * Math.sin(i * 0.37 - t * 4.1);
        kids[i].style.transform = `scaleY(${(0.16 + Math.min(1, lvl * (0.45 + w)) * 0.84).toFixed(3)})`;
      }
    };
    if (!listening || reduce) {
      set(listening ? 0.55 : 0.15, 1);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      // syllables over words over breaths
      const lvl = Math.max(0, 0.35 + 0.35 * Math.sin(t * 11) * Math.sin(t * 2.3) + 0.25 * Math.sin(t * 5.7 + 1));
      set(Math.min(1, lvl), t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [listening, reduce]);

  const done = phase === "done";
  const width = { idle: 48, heard: 186, listening: 240, writing: 148, done: 48 }[phase];
  return (
    <div
      aria-hidden
      className={`stage pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 transition-[opacity,transform] duration-500 ${
        phase === "idle" ? "translate-y-2 opacity-0" : "opacity-100"
      }`}
    >
      <span
        ref={glow}
        className={`absolute -inset-3 rounded-full blur-xl transition-[background] duration-500 ${
          done
            ? "bg-[radial-gradient(closest-side,rgba(61,208,143,0.75),transparent)]"
            : "bg-[radial-gradient(closest-side,rgba(255,98,41,0.85),rgba(255,46,99,0.35)_60%,transparent)]"
        }`}
      />
      <div
        className={`relative flex h-12 items-center overflow-hidden rounded-full border shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-[width,background-color,border-color] duration-500 ease-[cubic-bezier(.25,1,.5,1)] ${
          done ? "border-[#3dd08f]/50 bg-[#123a29]/90" : "border-white/15 bg-[#0d0e13]/80"
        }`}
        style={{ width }}
      >
        {/* tick */}
        <span
          className={`absolute inset-0 grid place-items-center text-[#5ff0ac] transition-[opacity,transform] duration-300 ${
            done ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <Check className="size-5" strokeWidth={2.4} trigger="manual" active={done} />
        </span>
        {/* heard the name */}
        <span
          className={`absolute inset-y-0 left-0 flex items-center gap-2.5 whitespace-nowrap pl-2 pr-4 transition-opacity duration-300 ${
            phase === "heard" ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="grid size-8 place-items-center rounded-full fire-gradient text-white">
            <Mic className="size-4" trigger="manual" active={phase === "heard"} />
          </span>
          <span className="text-[13px] font-medium text-white">Hey FireVoice</span>
        </span>
        {/* listening */}
        <span
          className={`absolute inset-y-0 left-0 flex items-center gap-3 whitespace-nowrap pl-2 pr-4 transition-opacity duration-300 ${
            listening ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="relative grid size-8 place-items-center rounded-full fire-gradient">
            <span className="size-2 rounded-full bg-white" />
          </span>
          <span ref={bars} className="flex h-6 items-center gap-[3px] text-[#ff8a5c]">
            {Array.from({ length: BARS }, (_, i) => (
              <span key={i} className="h-full w-[3px] origin-center rounded-full bg-current will-change-transform" />
            ))}
          </span>
          <span className="text-[13px] font-medium text-white/80">Listening</span>
        </span>
        {/* writing */}
        <span
          className={`absolute inset-y-0 left-0 flex items-center gap-2.5 whitespace-nowrap pl-2 pr-4 transition-opacity duration-300 ${
            phase === "writing" ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="grid size-8 place-items-center rounded-full bg-white/10 text-white">
            <Sparkles className="size-4" trigger="manual" active={phase === "writing"} />
          </span>
          <span className="shimmer-text text-[13px] font-medium">Writing</span>
        </span>
      </div>
    </div>
  );
}

/** A mail being dictated. `wake` starts it with "Hey FireVoice"; `shortcut` with the keys. */
export function DictationDemo({ mode = "shortcut" }: { mode?: "shortcut" | "wake" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? SENTENCE.length : 0);
  const [phase, setPhase] = useState<Phase>(reduce ? "done" : "idle");

  useEffect(() => {
    if (!inView || reduce) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => !cancelled && fn(), ms));
    const run = () => {
      setTyped(0);
      const listenAt = mode === "wake" ? 1300 : 0;
      if (mode === "wake") setPhase("heard");
      at(listenAt, () => setPhase("listening"));
      at(listenAt + 2400, () => {
        setPhase("writing");
        let i = 0;
        const step = () => {
          if (cancelled) return;
          i = Math.min(SENTENCE.length, i + 2 + Math.floor(Math.random() * 3));
          setTyped(i);
          if (i < SENTENCE.length) at(28, step);
          else {
            setPhase("done");
            at(1600, () => setPhase("idle"));
            at(3200, run);
          }
        };
        step();
      });
    };
    at(400, run);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce, mode]);

  const listening = phase === "listening";
  const writing = phase === "writing";
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
            <p className="min-h-[120px] text-[15px] leading-relaxed text-ink sm:min-h-[96px]" aria-live="off">
              {SENTENCE.slice(0, typed)}
              {phase !== "done" && (
                <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-blink bg-fire" aria-hidden />
              )}
            </p>
          </div>
        </div>
        <Pill phase={phase} />
      </div>
      {mode === "shortcut" ? (
        <div className="mt-14 flex items-center justify-center gap-2" aria-label="Default shortcut: Ctrl + Alt + Space">
          <Key down={listening}>Ctrl</Key>
          <span className="text-faint">+</span>
          <Key down={listening}>Alt</Key>
          <span className="text-faint">+</span>
          <Key down={listening}>
            <span className="px-4">Space</span>
          </Key>
        </div>
      ) : (
        <p className="mx-auto mt-14 flex min-h-11 max-w-md items-center justify-center gap-2.5 text-center text-[15px] text-muted">
          <Mic className="size-4 shrink-0 text-fire" trigger="manual" active={phase === "heard" || listening} />
          <span>
            You say:{" "}
            <span className={`font-medium transition-colors duration-300 ${phase === "heard" ? "text-fire-ink" : "text-ink"}`}>
              &ldquo;Hey FireVoice,
            </span>{" "}
            <span className={`transition-colors duration-300 ${listening || writing ? "text-ink" : ""}`}>
              hi Sam, thanks for the notes&hellip;&rdquo;
            </span>
          </span>
        </p>
      )}
    </div>
  );
}

const points = [
  {
    icon: Mic,
    t: "“Hey FireVoice”, in any program",
    d: "Say it and keep talking. It understands accents, and Teach it your voice learns how you say it. Optional, and listening for it stays on your computer.",
  },
  {
    icon: Sparkles,
    t: "A pill that listens back",
    d: "A glowing pill follows your voice and turns into a green tick when the text goes in. Your first dictation gets a guided spotlight.",
  },
  {
    icon: Zap,
    t: "Snippets",
    d: "Say a short cue like “my address” or “sign off” and the whole text appears.",
  },
  {
    icon: Wand2,
    t: "A writing assistant",
    d: "Tidies what you said into clean sentences, without the um and uh. Still your words.",
  },
  {
    icon: Keyboard,
    t: "Or use the shortcut",
    d: "Hold Ctrl + Alt + Space while you speak, or tap it once to start and once to stop.",
  },
  {
    icon: ShieldCheck,
    t: "Private by design",
    d: "Speech becomes text on your own computer. No audio ever leaves it.",
  },
];

export function Dictation() {
  return (
    <section id="dictation" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--line-strong),transparent)]" />
      <div className="container-x">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
          <SectionHeader
            align="left"
            eyebrow="Dictation"
            title={
              <>
                Just say <span className="accent">&ldquo;Hey FireVoice.&rdquo;</span>
              </>
            }
          >
            Say it in any program and keep talking. FireVoice writes what follows wherever your cursor is, and stops
            when you stop. No key to hold, nothing to click.
          </SectionHeader>
          <Reveal>
            <DictationDemo mode="wake" />
          </Reveal>
        </div>
        <ul className="mt-20 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {points.map(({ icon: Icon, t, d }, i) => (
            <Reveal as="li" key={t} delay={(i % 3) * 0.06} className="mi-trigger border-t border-line pt-6">
              <Icon className="size-5 text-fire" />
              <p className="mt-3 font-medium text-ink">{t}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{d}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
