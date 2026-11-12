"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import clipsData from "@/data/clips.json";
import enginesData from "@/data/engines.json";
import { Heading, Mark } from "@/site/ui";
import { ArrowDown, ArrowLeft, ArrowRight, AudioLines, Captions, Check, ChevronDown, Cpu, Download, Languages, Lock, MessagesSquare, Mic, Pause, Play, Repeat2, Sparkles, Upload, Wand2, Waves, UserPlus, type Icon } from "@/components/icons";
import { Reveal, reducedMotion, useInView } from "@/site/motion";

// The voice studio, in the app's dark theme: the studio's tools as a sidebar on the left, a FireVoice window on the
// right showing a light mock of the chosen tool (it moves on by itself, slowly, until someone picks one), and below it
// every real voice clip as a compact card that plays, one at a time, with its waveform filling as it goes.

type Clip = { slug: string; name: string; voice: string; role: string; style: string; text: string; duration: number; peaks: number[] };
const clips = clipsData as Clip[];
type Engine = { brand: string; quality: string; clone: boolean; design: boolean };
const engines = enginesData as Engine[];
const inferno = engines.find((e) => e.brand === "Inferno") ?? engines[0];
const forge = engines.find((e) => e.brand === "Forge") ?? engines[0];
const byVoice = (slug: string) => clips.find((c) => c.slug === slug) ?? clips[0];

const CYCLE_MS = 6500;

/* ---------- icons: Kineticons (they move when their button or row is pointed at) ---------- */

const I = {
  tts: AudioLines,
  clone: UserPlus,
  design: Wand2,
  dialogue: MessagesSquare,
  dub: Languages,
  changer: Repeat2,
  sound: Waves,
  captions: Captions,
  mic: Mic,
  chevron: ChevronDown,
  check: Check,
  arrowR: ArrowRight,
  arrowL: ArrowLeft,
  arrowD: ArrowDown,
  upload: Upload,
  download: Download,
  chip: Cpu,
  lock: Lock,
  sparkles: Sparkles,
};

function PlayGlyph({ playing, className = "size-4" }: { playing: boolean; className?: string }) {
  return playing ? <Pause fill="currentColor" className={className} /> : <Play fill="currentColor" className={`${className} translate-x-[1px]`} />;
}

/* ---------- mock parts ---------- */

/** A made-up but steady waveform (the same on the server and in the browser). */
function wave(n: number, seed: number) {
  return Array.from({ length: n }, (_, i) => {
    const x = i / (n - 1);
    const v = Math.abs(Math.sin(x * (9 + seed) + seed) * Math.cos(x * (2.3 + seed * 0.4) + seed * 1.7));
    return Math.round((0.16 + 0.84 * v * (0.45 + 0.55 * Math.sin(x * Math.PI))) * 100);
  });
}

/** Waveform bars that grow in, one after another, when the panel opens. */
function Bars({ data, color, className = "h-10", delay = 0, step = 10 }: { data: number[]; color: string; className?: string; delay?: number; step?: number }) {
  return (
    <div className={`flex items-center gap-[2px] ${className}`}>
      {data.map((v, i) => (
        <span key={i} className="st-bar min-w-[2px] flex-1 rounded-full" style={{ height: `${Math.max(8, v)}%`, background: color, ["--d" as string]: delay + i * step }} />
      ))}
    </div>
  );
}

/** Animated in after `d` ms (opacity and a small lift). */
function A({ d = 0, className = "", children, pop = false }: { d?: number; className?: string; children: ReactNode; pop?: boolean }) {
  return (
    <div className={`${pop ? "st-pop" : "st-a"} ${className}`} style={{ ["--d" as string]: d }}>
      {children}
    </div>
  );
}

function Avatar({ voice, size = 28, className = "" }: { voice: string; size?: number; className?: string }) {
  return <Image src={`/avatars/${voice}.webp`} alt="" width={size} height={size} loading="lazy" className={`shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "fire" | "ok" | "violet" | "info" }) {
  const t = {
    neutral: "bg-surface-3 text-ink-2",
    fire: "bg-fire-soft text-fire-ink",
    ok: "bg-ok-soft text-ok",
    violet: "bg-violet-soft text-violet",
    info: "bg-info-soft text-info",
  }[tone];
  return <span className={`inline-flex h-[22px] items-center gap-1 rounded-full px-2 text-[11px] font-semibold whitespace-nowrap ${t}`}>{children}</span>;
}

const field = "rounded-[12px] border border-line bg-surface-2 shadow-[var(--edge)]";
const tile = "rounded-[14px] border border-line bg-surface shadow-[var(--shadow-sm),var(--edge)]";

function GenerateBtn({ d, label = "Generate" }: { d: number; label?: string }) {
  return (
    <span className="st-press btn-fire inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-white" style={{ ["--d" as string]: d }}>
      <I.sparkles className="size-[15px]" />
      {label}
    </span>
  );
}

/* ---------- the eight mocks ---------- */

function TtsMock() {
  const v = byVoice("documentary");
  return (
    <div className="flex flex-1 flex-col gap-3">
      <A className={`${field} p-4 text-[14.5px] leading-relaxed text-ink`}>
        Here, in the quiet of your own computer, a brand new voice takes its very first breath.
        <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-blink bg-fire" />
        <div className="mt-3 flex items-center justify-between text-[11.5px] text-faint">
          <span>87 characters</span>
          <span>English</span>
        </div>
      </A>
      <A d={90} className="flex flex-wrap items-center gap-2">
        <span className={`${field} flex h-9 items-center gap-2 pr-3 pl-1.5 text-[13px] font-medium`}>
          <Avatar voice={v.voice} size={24} />
          {v.name}
          <I.chevron className="size-3.5 text-faint" />
        </span>
        <span className={`${field} flex h-9 items-center gap-2 px-3 text-[13px] font-medium`}>
          <I.chip className="size-[15px] text-fire" />
          {inferno.brand}
          <Badge tone="fire">{inferno.quality}</Badge>
          <I.chevron className="size-3.5 text-faint" />
        </span>
        <span className={`${field} hidden h-9 items-center px-3 text-[13px] text-muted sm:flex`}>Speed 1.0×</span>
        <span className="ml-auto">
          <GenerateBtn d={350} />
        </span>
      </A>
      <A d={650} className={`${tile} mt-auto flex items-center gap-3 p-3`}>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fire text-white">
          <PlayGlyph playing={false} className="size-3.5" />
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <Bars data={wave(64, 1)} color="var(--fire)" className="h-10" delay={700} step={8} />
          <span className="st-head absolute inset-0"><span className="absolute inset-y-0 right-0 w-[2px] rounded-full bg-ink/70" /></span>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[11.5px] tabular-nums text-ink-2">0:{String(Math.round(v.duration)).padStart(2, "0")}</p>
          <p className="text-[10.5px] text-faint">WAV · 48 kHz</p>
        </div>
      </A>
    </div>
  );
}

function CloneMock() {
  return (
    <div className="grid flex-1 content-center items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <A className="rounded-[16px] border border-dashed border-line-strong bg-surface-2 p-4">
        <div className="flex items-center gap-2.5">
          <span className="st-rec grid size-9 place-items-center rounded-full bg-fire text-white">
            <I.mic className="size-4" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-ink">10 seconds of your voice</p>
            <p className="text-[11.5px] text-muted">Record, or drop a file</p>
          </div>
        </div>
        <Bars data={wave(40, 3)} color="var(--ink-2)" className="mt-4 h-9" delay={120} step={18} />
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <span className="st-fill block h-full rounded-full bg-fire" style={{ ["--d" as string]: 150, ["--dur" as string]: "900ms" }} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] text-faint tabular-nums">
          <span>0:10</span>
          <span className="flex items-center gap-1">
            <I.upload className="size-3" /> sample.wav
          </span>
        </div>
      </A>
      <A d={900} className="grid place-items-center text-fire">
        <I.arrowR className="size-6 rotate-90 sm:rotate-0" />
      </A>
      <A d={1100} pop className={`${tile} p-4`}>
        <div className="flex items-center gap-3">
          <span className="fire-gradient grid size-12 place-items-center rounded-full text-[17px] font-bold text-white">Y</span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ink">My voice</p>
            <p className="text-[11.5px] text-muted">Cloned just now</p>
          </div>
          <span className="ml-auto">
            <Badge tone="ok">
              <I.check className="size-3" /> Ready
            </Badge>
          </span>
        </div>
        <Bars data={wave(36, 5)} color="var(--fire)" className="mt-4 h-8" delay={1250} step={12} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="fire">{inferno.brand}</Badge>
          <Badge>Speaks 30 languages</Badge>
        </div>
      </A>
    </div>
  );
}

function DesignMock() {
  const opts = [
    { n: "Option 1", s: 7, on: false },
    { n: "Option 2", s: 2, on: true },
    { n: "Option 3", s: 11, on: false },
  ];
  return (
    <div className="flex flex-1 flex-col gap-3">
      <A className={`${field} flex items-center gap-3 p-3 pl-4`}>
        <I.design className="size-[18px] text-violet" />
        <p className="min-w-0 flex-1 truncate text-[15px] text-ink">
          a warm, slow storyteller
          <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-blink bg-violet" />
        </p>
        <span className="hidden sm:block">
          <GenerateBtn d={420} label="Design" />
        </span>
      </A>
      <A d={120} className="flex flex-wrap gap-1.5">
        {["Older", "Warm", "Slow pace", "Low pitch", "British English"].map((t) => (
          <span key={t} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-2">
            {t}
          </span>
        ))}
        <Badge tone="violet">{forge.brand}</Badge>
      </A>
      <div className="mt-auto grid grid-cols-3 gap-2">
        {opts.map((o, i) => (
          <A key={o.n} d={650 + i * 160} pop className={`${tile} p-2.5 sm:p-3 ${o.on ? "ring-2 ring-violet" : ""}`}>
            <div className="flex items-center justify-between gap-1">
              <p className="text-[12px] font-semibold whitespace-nowrap text-ink sm:text-[13px]">{o.n}</p>
              {o.on ? (
                <Badge tone="violet">
                  <I.check className="size-3" /> <span className="hidden sm:inline">Chosen</span>
                </Badge>
              ) : (
                <span className="grid size-6 place-items-center rounded-full bg-surface-3 text-ink-2">
                  <PlayGlyph playing={false} className="size-2.5" />
                </span>
              )}
            </div>
            <Bars data={wave(28, o.s)} color={o.on ? "var(--violet)" : "var(--faint)"} className="mt-3 h-7" delay={760 + i * 160} step={10} />
          </A>
        ))}
      </div>
      <A d={1300} className="flex items-center justify-between text-[12px] text-muted">
        <span>Made from words alone. No recording needed.</span>
        <span className="hidden font-semibold text-violet sm:inline">Save voice</span>
      </A>
    </div>
  );
}

function DialogueMock() {
  const a = byVoice("documentary");
  const b = byVoice("radio");
  const lines = [
    { v: a, t: "So the whole thing runs on my laptop?", s: 2 },
    { v: b, t: "Every word of it. Nothing goes to the cloud.", s: 6 },
    { v: a, t: "Then let's record the next episode tonight.", s: 9 },
    { v: b, t: "I'll bring the coffee!", s: 4 },
  ];
  return (
    <div className="flex flex-1 flex-col gap-2">
      <A className="flex items-center gap-2 text-[12px] text-muted">
        <Badge>2 speakers</Badge>
        <Badge>4 lines</Badge>
        <span className="ml-auto font-mono tabular-nums">0:14</span>
      </A>
      {lines.map((l, i) => {
        const left = l.v === a;
        return (
          <A key={i} d={150 + i * 260} className={`${tile} flex items-center gap-3 p-2.5 pr-3`}>
            <Avatar voice={l.v.voice} size={30} />
            <div className="min-w-0 flex-1">
              <p className={`text-[11px] font-semibold ${left ? "text-info" : "text-fire-ink"}`}>{l.v.name}</p>
              <p className="truncate text-[13.5px] text-ink">{l.t}</p>
            </div>
            <Bars data={wave(14, l.s)} color={left ? "var(--info)" : "var(--fire)"} className="hidden h-6 w-20 sm:flex" delay={250 + i * 260} step={14} />
          </A>
        );
      })}
      {/* the timeline: each speaker in its own lane */}
      <A d={1300} className={`${field} mt-auto space-y-1.5 p-2.5`}>
        {[
          ["var(--info)", [[0, 26], [52, 30]]],
          ["var(--fire)", [[27, 24], [83, 15]]],
        ].map(([c, segs], r) => (
          <div key={r} className="relative h-2.5 rounded-full bg-surface-3">
            {(segs as number[][]).map(([l, w], k) => (
              <span key={k} className="absolute inset-y-0 rounded-full" style={{ left: `${l}%`, width: `${w}%`, background: c as string }} />
            ))}
          </div>
        ))}
      </A>
    </div>
  );
}

function DubMock() {
  const langs = [
    { l: "Spanish", s: "done" },
    { l: "French", s: "done" },
    { l: "German", s: "run" },
    { l: "Hindi", s: "wait" },
    { l: "Japanese", s: "wait" },
  ];
  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-[1.25fr_1fr]">
      <A className="relative min-h-[150px] overflow-hidden rounded-[14px] border border-line" >
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 80% at 30% 20%, #3b4a7a, transparent 70%), radial-gradient(60% 70% at 80% 90%, #7a3b2a, transparent 70%), #141722" }} />
        <div className="absolute bottom-[34%] left-[18%] size-16 rounded-full bg-white/15" />
        <div className="absolute bottom-0 left-[10%] h-[34%] w-[34%] rounded-t-[40px] bg-white/12" />
        <span className="absolute top-2.5 left-2.5">
          <Badge tone="fire">ES</Badge>
        </span>
        <span className="absolute inset-0 m-auto grid size-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
          <PlayGlyph playing={false} className="size-4" />
        </span>
        <p className="absolute inset-x-3 bottom-8 text-center text-[12.5px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,.8)]">Bienvenidos a la nueva temporada.</p>
        <div className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-white/20">
          <span className="st-loop-x block h-full w-full origin-left rounded-full bg-fire" />
        </div>
      </A>
      <div className="flex flex-col gap-1.5">
        <A d={100} className="flex items-center justify-between text-[12px] text-muted">
          <span>From English</span>
          <span>launch-video.mp4</span>
        </A>
        {langs.map((x, i) => (
          <A key={x.l} d={250 + i * 140} className={`${tile} flex h-10 items-center gap-2.5 px-3`}>
            <span className={`grid size-5 place-items-center rounded-full ${x.s === "done" ? "bg-ok text-white" : x.s === "run" ? "bg-fire-soft text-fire" : "bg-surface-3 text-faint"}`}>
              {x.s === "done" ? <I.check className="size-3" /> : <span className={`size-1.5 rounded-full ${x.s === "run" ? "st-ping bg-fire" : "bg-faint"}`} />}
            </span>
            <span className="text-[13px] font-medium text-ink">{x.l}</span>
            <span className="ml-auto text-[11.5px] text-muted">{x.s === "done" ? "Ready" : x.s === "run" ? "68%" : "Queued"}</span>
          </A>
        ))}
      </div>
    </div>
  );
}

function ChangerMock() {
  const t = byVoice("trailer");
  return (
    <div className="flex flex-1 flex-col gap-2">
      <A className={`${tile} p-3.5`}>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-surface-3 text-ink-2">
            <I.mic className="size-3.5" />
          </span>
          <p className="text-[13px] font-semibold text-ink">Your recording</p>
          <span className="ml-auto font-mono text-[11.5px] text-faint tabular-nums">0:07</span>
        </div>
        <Bars data={wave(60, 4)} color="var(--faint)" className="h-11" delay={100} step={6} />
      </A>
      <A d={500} className="flex items-center justify-center gap-2 py-0.5 text-[12px] text-muted">
        <I.arrowD className="size-4 text-fire" />
        Same timing, same feeling, a new voice
      </A>
      <A d={700} className={`${tile} p-3.5 ring-1 ring-fire/40`}>
        <div className="mb-2.5 flex items-center gap-2">
          <Avatar voice={t.voice} size={28} />
          <p className="text-[13px] font-semibold text-ink">as {t.name}</p>
          <span className="ml-1">
            <Badge tone="fire">{t.role}</Badge>
          </span>
          <span className="ml-auto font-mono text-[11.5px] text-faint tabular-nums">0:07</span>
        </div>
        <Bars data={wave(60, 4).map((v, i) => Math.min(100, Math.round(v * (0.75 + 0.45 * Math.abs(Math.sin(i * 0.7))))))} color="var(--fire)" className="h-11" delay={800} step={6} />
      </A>
    </div>
  );
}

function SoundMock() {
  const chips = ["Footsteps on gravel", "Busy coffee shop", "Door creak", "Crowd cheering", "Wind in the trees", "Typewriter"];
  const results = [
    { n: "Rain on a tin roof", d: "0:08", s: 8 },
    { n: "Rain on a tin roof, take 2", d: "0:08", s: 13 },
  ];
  return (
    <div className="flex flex-1 flex-col gap-3">
      <A className={`${field} flex items-center gap-3 p-3 pl-4`}>
        <I.sound className="size-[18px] text-info" />
        <p className="min-w-0 flex-1 truncate text-[14.5px] text-ink">rain on a tin roof, distant thunder</p>
        <span className="hidden sm:block">
          <GenerateBtn d={420} />
        </span>
      </A>
      <A d={120} className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span key={c} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-2">
            {c}
          </span>
        ))}
      </A>
      <div className="mt-auto flex flex-col gap-2">
        {results.map((r, i) => (
          <A key={r.n} d={650 + i * 200} className={`${tile} flex items-center gap-3 p-2.5 pr-3`}>
            <span className={`grid size-8 shrink-0 place-items-center rounded-full ${i === 0 ? "bg-info text-white" : "bg-surface-3 text-ink-2"}`}>
              <PlayGlyph playing={false} className="size-3" />
            </span>
            <p className="w-32 shrink-0 truncate text-[12.5px] font-medium text-ink sm:w-44">{r.n}</p>
            <Bars data={wave(40, r.s).map((v) => Math.round(v * 0.4 + 50 * Math.abs(Math.sin(v))))} color={i === 0 ? "var(--info)" : "var(--faint)"} className="h-7 min-w-0 flex-1" delay={700 + i * 200} step={6} />
            <span className="shrink-0 font-mono text-[11px] text-faint tabular-nums">{r.d}</span>
          </A>
        ))}
      </div>
    </div>
  );
}

function CaptionsMock() {
  const rows = [
    { t: "00:00.0", s: "Speaker 1", x: "Welcome back to the show." },
    { t: "00:02.4", s: "Speaker 1", x: "Today we're talking about voices that never leave your computer." },
    { t: "00:06.9", s: "Speaker 2", x: "Which still sounds a little like magic to me." },
    { t: "00:10.2", s: "Speaker 1", x: "It does. Let's show you how it works." },
  ];
  return (
    <div className="flex flex-1 flex-col gap-2">
      <A className="flex items-center gap-2">
        <Badge tone="ok">
          <I.check className="size-3" /> Transcribed
        </Badge>
        <Badge>English, detected</Badge>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="rounded-md border border-fire/40 bg-fire-soft px-1.5 py-0.5 font-mono text-[11px] font-bold text-fire-ink">SRT</span>
          <span className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] font-bold text-muted sm:inline">TXT</span>
        </span>
      </A>
      <div className={`${tile} flex-1 divide-y divide-line overflow-hidden`}>
        {rows.map((r, i) => (
          <A key={r.t} d={180 + i * 220} className={`flex gap-3 px-3.5 py-2.5 ${i === 1 ? "bg-fire-soft" : ""}`}>
            <span className="w-14 shrink-0 pt-px font-mono text-[11.5px] text-faint tabular-nums">{r.t}</span>
            <div className="min-w-0">
              <p className={`text-[11px] font-semibold ${r.s === "Speaker 1" ? "text-info" : "text-violet"}`}>{r.s}</p>
              <p className="text-[13.5px] leading-snug text-ink">{r.x}</p>
            </div>
          </A>
        ))}
      </div>
      <A d={1100} className="flex items-center justify-between text-[12px] text-muted">
        <span>4 captions · 0:13</span>
        <span className="flex items-center gap-1.5 font-semibold text-fire-ink">
          <I.download className="size-3.5" /> Save captions
        </span>
      </A>
    </div>
  );
}

type Tool = { id: string; name: string; icon: Icon; desc: string; Mock: () => ReactNode };
const TOOLS: Tool[] = [
  { id: "tts", name: "Text to speech", icon: I.tts, desc: "Type or paste anything and hear it read in a natural voice, from a library of voices.", Mock: TtsMock },
  { id: "clone", name: "Voice cloning", icon: I.clone, desc: "Record about ten seconds of your voice, and FireVoice makes a voice that sounds like you.", Mock: CloneMock },
  { id: "design", name: "Voice design", icon: I.design, desc: "Describe a voice in a few words and FireVoice creates it. No recording needed.", Mock: DesignMock },
  { id: "dialogue", name: "Dialogue", icon: I.dialogue, desc: "Write a script for several speakers and get one conversation, each line in its own voice.", Mock: DialogueMock },
  { id: "dub", name: "Dubbing", icon: I.dub, desc: "Turn the speech in a video into other languages.", Mock: DubMock },
  { id: "changer", name: "Voice changer", icon: I.changer, desc: "Say it your way, then hear it in another voice. The timing and feeling stay yours.", Mock: ChangerMock },
  { id: "sound", name: "Sound effects", icon: I.sound, desc: "Describe a sound and get it: rain, footsteps, a crowd, a creaking door.", Mock: SoundMock },
  { id: "captions", name: "Transcription & captions", icon: I.captions, desc: "Turn recordings into text with timestamps, and save captions as SRT.", Mock: CaptionsMock },
];

/* ---------- the tool picker and window ---------- */

function Tools() {
  const [sel, setSel] = useState(0);
  const [picked, setPicked] = useState(false);
  const [viewRef, inView] = useInView<HTMLDivElement>("-10% 0px");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // move on by itself, slowly, while on screen and until someone chooses
  useEffect(() => {
    if (picked || !inView || reducedMotion()) return;
    const t = window.setTimeout(() => setSel((s) => (s + 1) % TOOLS.length), CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [sel, picked, inView]);

  const choose = (i: number) => {
    setPicked(true);
    setSel(i);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = TOOLS.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (sel + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (sel - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
    tabs.current[next]?.focus();
  };

  // on phones the tools are a sideways strip: keep the chosen one in sight (without moving the page)
  useEffect(() => {
    const b = tabs.current[sel];
    const strip = b?.parentElement;
    if (!b || !strip || strip.scrollWidth <= strip.clientWidth) return;
    const left = b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2;
    strip.scrollTo({ left, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [sel]);

  const tool = TOOLS[sel];
  const running = inView && !picked;

  return (
    <div ref={viewRef} className="mt-12 grid gap-3 lg:mt-14 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-4" style={{ ["--ps" as string]: inView ? "running" : "paused" }}>
      {/* the studio's sidebar */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="card min-w-0 p-2 lg:p-2.5">
          <p className="hidden px-3 pt-1.5 pb-2 text-[11px] font-semibold tracking-[0.08em] text-faint uppercase lg:block">Voice studio</p>
          <div
            role="tablist"
            aria-label="Studio tools"
            onKeyDown={onKey}
            className="st-scroll relative -m-1 flex snap-x gap-1 overflow-x-auto p-1 lg:m-0 lg:flex-col lg:overflow-visible lg:p-0"
          >
            {TOOLS.map((t, i) => {
              const on = i === sel;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`st-tab-${t.id}`}
                  aria-selected={on}
                  aria-controls="st-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(i)}
                  className={`ki-trigger group relative flex h-11 shrink-0 snap-start items-center gap-3 overflow-hidden rounded-[11px] px-3 text-left text-[14px] font-medium whitespace-nowrap transition-[background,color] duration-200 lg:h-10 ${
                    on ? "bg-fire-soft text-fire-ink" : "text-muted hover:bg-surface-3/70 hover:text-ink"
                  }`}
                >
                  <span className="transition-transform duration-200 group-active:scale-90">
                    <t.icon variant="duotone" strokeWidth={on ? 2 : 1.8} className="size-[18px]" />
                  </span>
                  <span className="lg:truncate">{t.name}</span>
                  {on && running && <span key={`${sel}-${inView}`} className="st-prog absolute inset-x-3 bottom-0 h-[2px] origin-left rounded-full bg-fire/70" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="card hidden flex-col gap-2.5 p-4 text-[13px] text-muted lg:flex">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <I.lock className="size-4 text-ok" /> On your computer
          </p>
          <p className="leading-relaxed">Every tool runs locally. A recent NVIDIA graphics card makes it fastest; it also runs on the processor.</p>
        </div>
      </div>

      {/* the app window */}
      <div className="card-raised min-w-0 overflow-hidden rounded-[22px]">
        <div className="flex h-11 items-center gap-2.5 border-b border-line bg-surface-2/70 px-4" aria-hidden>
          <Mark size={18} />
          <span className="text-[12.5px] font-semibold text-ink-2">FireVoice</span>
          <span className="text-faint">/</span>
          <span key={tool.id} className="st-a truncate text-[12.5px] text-muted">
            {tool.name}
          </span>
          <span className="ml-auto flex items-center gap-4 text-faint">
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2">
              <path d="M0 5h10" />
            </svg>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x=".6" y=".6" width="8.8" height="8.8" rx="2" />
            </svg>
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 1l8 8M9 1l-8 8" />
            </svg>
          </span>
        </div>
        <div id="st-panel" role="tabpanel" aria-labelledby={`st-tab-${tool.id}`} className="flex min-h-[540px] flex-col p-4 sm:min-h-[452px] sm:p-6">
          <div key={tool.id} className="flex flex-1 flex-col">
            <div className="st-a mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-fire-soft text-fire">
                <tool.icon variant="duotone" trigger="manual" active className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[18px] font-semibold tracking-[-0.015em] text-ink">{tool.name}</h3>
                <p className="mt-0.5 text-[13.5px] leading-snug text-muted">{tool.desc}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col" aria-hidden>
              <tool.Mock />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- the voices: one shared player ---------- */

let player: HTMLAudioElement | null = null;
const fills = new Map<string, HTMLDivElement>();
const fillRefs = Object.fromEntries(
  clips.map((c) => [
    c.slug,
    (el: HTMLDivElement | null) => {
      if (el) fills.set(c.slug, el);
      else fills.delete(c.slug);
    },
  ]),
) as Record<string, (el: HTMLDivElement | null) => void>;

function setFill(slug: string, p: number) {
  const el = fills.get(slug);
  if (el) el.style.clipPath = `inset(0 ${(100 - Math.min(1, Math.max(0, p)) * 100).toFixed(2)}% 0 0)`;
}
function getPlayer() {
  if (!player) {
    player = new Audio();
    player.preload = "auto";
  }
  return player;
}

const VoiceCard = memo(function VoiceCard({ clip, playing, onToggle }: { clip: Clip; playing: boolean; onToggle: (slug: string) => void }) {
  const b = clip.peaks.filter((_, i) => i % 2 === 0);
  const row = (color: string) => (
    <div className="flex h-full items-center gap-[2px]">
      {b.map((v, i) => (
        <span key={i} className="min-w-[1.5px] flex-1 rounded-full" style={{ height: `${Math.max(10, Math.round(v * 100))}%`, background: color }} />
      ))}
    </div>
  );
  const role = clip.role.toLowerCase();
  return (
    <li className="w-[272px] shrink-0 snap-start sm:w-[292px]">
      <article className={`flex h-full flex-col rounded-[18px] border bg-surface p-3.5 shadow-[var(--shadow-sm),var(--edge)] transition-[border-color,box-shadow] duration-300 ${playing ? "border-fire/50 shadow-[0_0_0_1px_rgba(255,107,61,.35),0_18px_40px_-20px_rgba(255,107,61,.5)]" : "border-line hover:border-line-strong"}`}>
        <div className="flex items-center gap-3">
          <span className="relative">
            <Avatar voice={clip.voice} size={42} />
            {playing && <span className="absolute -inset-[3px] rounded-full border-2 border-fire" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{clip.name}</h3>
            <p className="truncate text-[12.5px] text-muted">{clip.role}</p>
          </div>
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10.5px] font-medium text-ink-2 capitalize">{clip.style}</span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-[2.7em] text-[13px] leading-[1.35] text-ink-2">&ldquo;{clip.text}&rdquo;</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(clip.slug)}
            aria-label={`${playing ? "Pause" : "Play"} ${clip.name}, ${role}`}
            aria-pressed={playing}
            className={`ki-trigger grid size-11 shrink-0 place-items-center rounded-full transition-[transform,background-color] duration-200 hover:scale-105 active:scale-95 ${playing ? "fire-gradient text-white" : "bg-surface-3 text-ink hover:bg-fire hover:text-white"}`}
          >
            <PlayGlyph playing={playing} className="size-4" />
          </button>
          <div className="relative h-8 min-w-0 flex-1" aria-hidden>
            {row("var(--line-strong)")}
            <div ref={fillRefs[clip.slug]} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
              {row("var(--fire)")}
            </div>
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-[11.5px] text-faint tabular-nums">0:{String(Math.round(clip.duration)).padStart(2, "0")}</span>
        </div>
      </article>
    </li>
  );
});

function VoiceRow() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [viewRef, inView] = useInView<HTMLDivElement>("0px");
  const strip = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  const stop = useCallback(() => {
    if (player && !player.paused) player.pause();
    setPlaying(null);
  }, []);

  const onToggle = useCallback((slug: string) => {
    const a = getPlayer();
    const current = a.dataset.slug;
    if (current === slug && !a.paused) {
      a.pause();
      setPlaying(null);
      return;
    }
    if (current !== slug) {
      if (current) setFill(current, 0);
      a.src = `/audio/${slug}.mp3`;
      a.dataset.slug = slug;
    }
    a.play().then(
      () => setPlaying(slug),
      () => setPlaying(null),
    );
  }, []);

  // the played part of the waveform follows the audio, frame by frame
  useEffect(() => {
    const a = player;
    if (!playing || !a) return;
    let raf = 0;
    const tick = () => {
      if (a.duration) setFill(playing, a.currentTime / a.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const ended = () => {
      setFill(playing, 0);
      setPlaying(null);
    };
    const update = () => a.duration && setFill(playing, a.currentTime / a.duration);
    a.addEventListener("ended", ended);
    a.addEventListener("timeupdate", update);
    return () => {
      cancelAnimationFrame(raf);
      a.removeEventListener("ended", ended);
      a.removeEventListener("timeupdate", update);
    };
  }, [playing]);

  // scrolled away: stop talking
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!inView) stop();
  }, [inView, stop]);
  useEffect(() => () => player?.pause(), []);

  const measure = useCallback(() => {
    const s = strip.current;
    if (!s) return;
    setEnds({ start: s.scrollLeft < 8, end: s.scrollLeft + s.clientWidth >= s.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);
  const page = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * Math.max(300, strip.current.clientWidth * 0.8), behavior: reducedMotion() ? "auto" : "smooth" });

  const arrow = "ki-trigger grid size-10 place-items-center rounded-full border border-line-strong bg-surface text-ink transition-[opacity,background-color] duration-200 hover:bg-surface-3 disabled:pointer-events-none disabled:opacity-35";

  return (
    <div ref={viewRef} className="mt-16 sm:mt-20">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">Hear the voices</h3>
          <p className="mt-1 text-[14.5px] text-muted">Real clips, made by FireVoice on a home computer.</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button type="button" className={arrow} onClick={() => page(-1)} disabled={ends.start} aria-label="Previous voices">
            <I.arrowL className="size-[18px]" />
          </button>
          <button type="button" className={arrow} onClick={() => page(1)} disabled={ends.end} aria-label="More voices">
            <I.arrowR className="size-[18px]" />
          </button>
        </div>
      </div>
      <div ref={strip} onScroll={measure} className="st-scroll -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8">
        <ul className="flex w-max gap-3" aria-label="Voice clips">
          {clips.map((c) => (
            <VoiceCard key={c.slug} clip={c} playing={playing === c.slug} onToggle={onToggle} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- the section ---------- */

export function Studio() {
  return (
    <section id="studio" aria-labelledby="studio-title" className="relative px-2 py-6 sm:px-4 sm:py-10">
      <style>{`
        @keyframes st-in { from { opacity: 0; transform: translate3d(0, 10px, 0); } to { opacity: 1; transform: none; } }
        @keyframes st-pop { from { opacity: 0; transform: scale(.94) translate3d(0, 6px, 0); } to { opacity: 1; transform: none; } }
        @keyframes st-bar { from { transform: scaleY(.08); opacity: .3; } to { transform: none; opacity: 1; } }
        @keyframes st-fill { from { transform: scaleX(0); } to { transform: none; } }
        @keyframes st-press { 0%, 100% { transform: none; } 40% { transform: scale(.93); } }
        @keyframes st-head { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes st-loop-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes st-ping { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.8); opacity: .4; } }
        @keyframes st-rec { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,61,.45); } 50% { box-shadow: 0 0 0 7px rgba(255,107,61,0); } }
        @keyframes st-prog { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        #studio .st-a { animation: st-in .55s cubic-bezier(0.25,1,0.5,1) both; animation-delay: calc(var(--d, 0) * 1ms); }
        #studio .st-pop { animation: st-pop .6s cubic-bezier(0.32,0.72,0,1) both; animation-delay: calc(var(--d, 0) * 1ms); }
        #studio .st-bar { transform-origin: center; animation: st-bar .45s cubic-bezier(0.25,1,0.5,1) both; animation-delay: calc(var(--d, 0) * 1ms); }
        #studio .st-fill { transform-origin: left; animation: st-fill var(--dur, .8s) cubic-bezier(0.25,1,0.5,1) both; animation-delay: calc(var(--d, 0) * 1ms); }
        #studio .st-press { animation: st-press .35s ease both; animation-delay: calc(var(--d, 0) * 1ms); }
        #studio .st-head { opacity: .7; animation: st-head 4.5s linear 1.4s infinite both; animation-play-state: var(--ps, running); }
        #studio .st-loop-x { animation: st-loop-x 6s linear infinite; animation-play-state: var(--ps, running); }
        #studio .st-ping { animation: st-ping 1.2s ease-in-out infinite; animation-play-state: var(--ps, running); }
        #studio .st-rec { animation: st-rec 1.4s ease-out infinite; animation-play-state: var(--ps, running); }
        #studio .st-prog { animation: st-prog ${CYCLE_MS}ms linear both; animation-play-state: var(--ps, running); }
        #studio .st-scroll { scrollbar-width: none; }
        #studio .st-scroll::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          #studio .st-a, #studio .st-pop, #studio .st-bar, #studio .st-fill, #studio .st-press, #studio .st-head, #studio .st-loop-x, #studio .st-ping, #studio .st-rec, #studio .st-prog { animation: none !important; }
          #studio .st-head { display: none; }
        }
      `}</style>
      <div className="on-dark relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[28px] py-20 sm:rounded-[32px] sm:py-28">
        {/* soft glows, as behind the app's pages */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(40% 32% at 12% 8%, rgba(255,107,61,.2), transparent 70%), radial-gradient(34% 30% at 92% 22%, rgba(154,140,255,.14), transparent 70%), radial-gradient(40% 30% at 60% 96%, rgba(61,208,143,.09), transparent 70%)",
          }}
        />
        <div className="container-x">
          <Reveal>
            <Heading
              eyebrow="Voice studio"
              icon={<I.tts className="size-3.5 text-fire" />}
              lede="Natural speech in a library of voices, your own voice cloned from a short sample, voices designed from a few words, dialogue, dubbing and captions. All of it on your computer."
            >
              <span id="studio-title">
                Plus a whole <em>voice studio.</em>
              </span>
            </Heading>
          </Reveal>
          <Reveal delay={80}>
            <Tools />
          </Reveal>
          <VoiceRow />
        </div>
      </div>
    </section>
  );
}
