"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  AudioLines,
  BookOpen,
  ChevronDown,
  Home,
  Languages,
  Library,
  MessagesSquare,
  Mic,
  Music,
  Pause,
  Play,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { LiveBars } from "../LiveBars";
import { Bars, Logo } from "../ui";
import { playDemo } from "@/lib/voice-level";

const sidebar = [
  { icon: Home, label: "Home" },
  { icon: AudioLines, label: "Speak", active: true },
  { icon: Library, label: "Voices" },
  { icon: Mic, label: "Dictation" },
  { icon: MessagesSquare, label: "Dialogue" },
  { icon: Languages, label: "Dubbing" },
  { icon: ScrollText, label: "Transcribe" },
  { icon: Music, label: "Sound & music" },
  { icon: BookOpen, label: "Projects" },
];

const styles = ["Conversational", "Storyteller", "Documentary", "Calm", "Excited", "Trailer"];

const recent = [
  { title: "Chapter 3: The lighthouse", voice: "Mara", len: "4:12" },
  { title: "Product intro, take 2", voice: "Theo", len: "0:38" },
  { title: "Bedtime story", voice: "June", len: "6:05" },
];

/** A faithful, interactive stand-in for the app's Speak screen. */
export function AppWindow() {
  const [style, setStyle] = useState("Storyteller");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const render = () => {
    if (playing) return;
    setPlaying(true);
    playDemo(4.2);
    const start = performance.now();
    const step = () => {
      const p = Math.min(1, (performance.now() - start) / 4200);
      setProgress(p);
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(() => (setPlaying(false), setProgress(0)), 400);
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="overflow-hidden rounded-[18px] border border-line-strong bg-bg-elev shadow-lg sm:rounded-[22px]">
      {/* title bar */}
      <div className="flex h-10 items-center justify-between border-b border-line bg-surface-2/70 px-4">
        <div className="flex items-center gap-2">
          <Logo size={16} />
          <span className="text-[12px] font-medium text-muted">FireVoice</span>
        </div>
        <div className="flex gap-4 text-faint" aria-hidden>
          <span className="h-px w-3 translate-y-[6px] bg-current" />
          <span className="size-3 rounded-[2px] border border-current" />
          <span className="relative size-3 before:absolute before:inset-0 before:m-auto before:h-px before:w-4 before:rotate-45 before:bg-current after:absolute after:inset-0 after:m-auto after:h-px after:w-4 after:-rotate-45 after:bg-current" />
        </div>
      </div>

      <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[210px_1fr_260px]">
        {/* sidebar */}
        <aside className="hidden border-r border-line bg-surface-2/40 p-3 md:block">
          <ul className="space-y-0.5">
            {sidebar.map(({ icon: Icon, label, active }) => (
              <li
                key={label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${
                  active ? "bg-surface text-ink shadow-[var(--edge)] ring-1 ring-line" : "text-muted"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-fire" : ""}`} />
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-line bg-surface p-3">
            <p className="text-[11px] text-faint">Engine</p>
            <p className="mt-0.5 text-[13px] font-medium text-ink">Ember · on GPU</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-[38%] rounded-full fire-gradient" />
            </div>
            <p className="mt-1.5 text-[11px] text-faint">VRAM 3.1 GB</p>
          </div>
        </aside>

        {/* main */}
        <div className="flex flex-col p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-[13px]" tabIndex={-1}>
              <span className="grid size-6 place-items-center rounded-full bg-[linear-gradient(135deg,#ffb38a,#ff5a2d)] text-[11px] font-semibold text-white">
                M
              </span>
              Mara · warm narrator
              <ChevronDown className="size-3.5 text-faint" />
            </button>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Delivery style">
              {styles.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={style === s}
                  onClick={() => setStyle(s)}
                  className={`rounded-full px-2.5 py-1 text-[12px] transition-colors ${
                    style === s ? "bg-fire-soft text-fire-ink ring-1 ring-fire/30" : "text-muted hover:bg-surface-2"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex-1 rounded-2xl border border-line bg-surface p-4 text-left text-[15px] leading-relaxed text-ink-2 sm:p-5 sm:text-base">
            The storm came in low over the harbour. <span className="rounded bg-fire-soft px-1 font-mono text-[12px] text-fire-ink">[pause 400ms]</span>{" "}
            Mara pulled her coat tighter, counted the lights along the pier, and smiled. One of them was still burning
            <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-blink bg-fire" aria-hidden />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 pl-3">
            <button
              onClick={render}
              className="grid size-10 shrink-0 place-items-center rounded-full fire-gradient text-white shadow-[0_8px_20px_-8px_rgba(255,77,46,.8)]"
              aria-label={playing ? "Rendering demo" : "Play a demo render"}
            >
              {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
            </button>
            <div className="relative h-9 flex-1 overflow-hidden text-fire">
              <LiveBars n={48} className="h-full w-full justify-between" gain={playing ? 1.4 : 0.9} />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 bg-surface/70"
                style={{ width: `${100 - progress * 100}%`, display: playing ? "block" : "none" }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-[12px] text-faint">
              0:{String(Math.round(progress * 9)).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* right column */}
        <aside className="hidden border-l border-line p-4 lg:block">
          <p className="text-[11px] font-medium uppercase tracking-wider text-faint">Recent renders</p>
          <ul className="mt-3 space-y-2">
            {recent.map((r, i) => (
              <li key={r.title} className="rounded-xl border border-line bg-surface p-3">
                <p className="truncate text-[13px] font-medium text-ink">{r.title}</p>
                <div className="mt-2 flex items-center gap-2 text-fire/80">
                  <Play className="size-3 shrink-0 text-muted" />
                  <Bars
                    className="h-4 w-full flex-1"
                    heights={Array.from({ length: 30 }, (_, j) => 0.25 + Math.abs(Math.sin(j * 1.1 + i * 2)) * 0.75)}
                  />
                  <span className="font-mono text-[11px] text-faint">{r.len}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-faint">{r.voice}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-dashed border-line-strong p-3 text-[12px] text-muted">
            <Sparkles className="mb-1 size-4 text-fire" />
            21 delivery styles, from calm to trailer voice.
          </div>
        </aside>
      </div>
    </div>
  );
}

export function ProductShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.9, 1]);

  return (
    <section aria-label="The FireVoice app" className="relative overflow-x-clip pb-8 pt-10 sm:pt-16">
      <div className="container-x [perspective:1400px]">
        <motion.div ref={ref} style={{ rotateX, scale, transformOrigin: "50% 0%" }} className="relative">
          <div aria-hidden className="absolute -inset-x-10 -top-10 bottom-1/3 -z-10 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] blur-3xl" />
          <AppWindow />
        </motion.div>
        <p className="mt-4 text-center text-[13px] text-faint">The Speak screen. Press play to watch a render, or pick a delivery style.</p>
      </div>
    </section>
  );
}
