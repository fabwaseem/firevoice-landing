"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
} from "lucide-react";
import { Captions } from "../Captions";
import { Bars, Logo } from "../ui";
import { clips, currentTime, getServerSnapshot, getSnapshot, onFrame, play, subscribe, type Clip } from "@/lib/audio-engine";

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

/* each delivery style in the mockup plays the matching real render */
const styleClips: { label: string; slug: string }[] = [
  { label: "Documentary", slug: "documentary" },
  { label: "Trailer", slug: "trailer" },
  { label: "Bedtime", slug: "bedtime" },
  { label: "Dramatic", slug: "villain" },
  { label: "Excited", slug: "radio" },
  { label: "Whisper", slug: "whisper" },
  { label: "Deadpan", slug: "deadpan" },
  { label: "Sports", slug: "sports" },
];
const bySlug = Object.fromEntries(clips.map((c) => [c.slug, c])) as Record<string, Clip>;

function Progress({ clip, on }: { clip: Clip; on: boolean }) {
  const fill = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!on) {
      if (fill.current) fill.current.style.clipPath = "inset(0 100% 0 0)";
      if (time.current) time.current.textContent = `0:${String(Math.round(clip.duration)).padStart(2, "0")}`;
      return;
    }
    return onFrame(() => {
      const t = currentTime();
      const p = Math.min(1, t / clip.duration);
      if (fill.current) fill.current.style.clipPath = `inset(0 ${(100 - p * 100).toFixed(2)}% 0 0)`;
      if (time.current) time.current.textContent = `0:${String(Math.floor(t)).padStart(2, "0")}`;
    });
  }, [on, clip]);
  const bars = (cls: string) => (
    <div className={`flex h-full items-center gap-[2px] ${cls}`}>
      {clip.peaks.map((v, i) => (
        <span key={i} className="w-full rounded-full bg-current" style={{ height: `${Math.max(10, Math.round(v * 100))}%` }} />
      ))}
    </div>
  );
  return (
    <>
      <div className="relative h-9 flex-1">
        {bars("text-ink/15")}
        <div ref={fill} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
          {bars("text-fire")}
        </div>
      </div>
      <span ref={time} className="w-10 shrink-0 text-right font-mono text-[12px] text-muted">
        0:{String(Math.round(clip.duration)).padStart(2, "0")}
      </span>
    </>
  );
}

/** A faithful stand-in for the app's Speak screen, playing real FireVoice renders. */
export function AppWindow() {
  const [slug, setSlug] = useState("documentary");
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const clip = bySlug[slug];
  const on = s.playing && s.clip?.slug === slug;

  const choose = (next: string) => {
    setSlug(next);
    play(bySlug[next]);
  };

  return (
    <div className="overflow-hidden rounded-[18px] border border-line-strong bg-bg-elev shadow-lg sm:rounded-[22px]">
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

      <div className="grid min-h-[440px] grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[210px_1fr_250px]">
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
            <p className="text-[11px] text-muted">Engine</p>
            <p className="mt-0.5 text-[13px] font-medium text-ink">Inferno · on GPU</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-[52%] rounded-full fire-gradient" />
            </div>
            <p className="mt-1.5 text-[11px] text-muted">48 kHz · 30 languages</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col p-4 sm:p-6">
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-[13px] text-ink self-start">
            <Image src={`/avatars/${clip.voice}.webp`} alt="" width={26} height={26} className="rounded-full" />
            {clip.name} · {clip.role.toLowerCase()}
            <ChevronDown className="size-3.5 text-muted" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Delivery style (plays a real render)">
            {styleClips.map((c) => (
              <button
                key={c.slug}
                role="radio"
                aria-checked={slug === c.slug}
                onClick={() => choose(c.slug)}
                className={`rounded-full px-2.5 py-1 text-[12px] transition-colors ${
                  slug === c.slug ? "bg-fire-soft text-fire-ink ring-1 ring-fire/30" : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex-1 rounded-2xl border border-line bg-surface p-4 text-left sm:p-5">
            {on ? (
              <Captions
                clip={clip}
                playing={on}
                className="text-[17px] leading-relaxed text-ink [&_[data-w]]:!blur-0 [&_[data-w]]:!translate-y-0 [&_[data-w]]:opacity-30"
              />
            ) : (
              <p className="text-[17px] leading-relaxed text-ink-2">
                {clip.text}
                <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-blink bg-fire" aria-hidden />
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 pl-3">
            <button
              onClick={() => play(clip)}
              className="grid size-10 shrink-0 place-items-center rounded-full fire-gradient text-white shadow-[0_8px_20px_-8px_rgba(255,77,46,.8)]"
              aria-label={on ? `Pause ${clip.name}` : `Play ${clip.name}`}
            >
              {on ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4 fill-current" />}
            </button>
            <Progress clip={clip} on={on} />
          </div>
        </div>

        <aside className="hidden border-l border-line p-4 lg:block">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Recent renders</p>
          <ul className="mt-3 space-y-2">
            {clips.slice(2, 5).map((r) => (
              <li key={r.slug} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center gap-2">
                  <Image src={`/avatars/${r.voice}.webp`} alt="" width={22} height={22} className="rounded-full" />
                  <p className="truncate text-[13px] font-medium text-ink">{r.role}</p>
                </div>
                <Bars heights={r.peaks.filter((_, i) => i % 3 === 0)} className="mt-2 h-4 text-fire/70" />
                <p className="mt-1.5 text-[11px] text-muted">
                  {r.name} · 0:{String(Math.round(r.duration)).padStart(2, "0")}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export function ProductShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 32, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.86, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 80, 0]);
  const beam = useTransform(scrollYProgress, [0.2, 1], [0, 1]);

  return (
    <section aria-labelledby="app-title" className="relative overflow-x-clip bg-bg pb-24 pt-28 sm:pt-36">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">The app</p>
          <h2 id="app-title" className="h-section mt-4 text-balance">
            Write a line. <span className="accent">Pick a voice.</span> Press play.
          </h2>
          <p className="mt-5 text-pretty text-lg text-muted">
            This is FireVoice&apos;s Speak screen, and these are real renders. Tap a delivery style to hear it.
          </p>
        </div>
        <div className="relative mt-16 [perspective:1600px]">
          <motion.div
            aria-hidden
            style={{ opacity: beam }}
            className="pointer-events-none absolute -top-24 left-1/2 h-[140%] w-[70%] -translate-x-1/2 bg-[radial-gradient(50%_45%_at_50%_30%,rgba(255,98,41,0.35),transparent_70%)] blur-2xl"
          />
          <motion.div ref={ref} style={{ rotateX, scale, y, transformOrigin: "50% 0%" }} className="relative">
            <AppWindow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
