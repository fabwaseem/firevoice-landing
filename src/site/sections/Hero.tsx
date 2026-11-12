"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DownloadButton, Pill, type PillState } from "@/site/ui";
import { reducedMotion, useInView } from "@/site/motion";
import { ArrowDown, ArrowRight, Check } from "@/components/icons";

// The opening: the promise and the download on the left; on the right a little desktop where FireVoice does its job
// for real. The pill listens while the raw words (ums and all) show above it, writes, and the clean sentence types into
// the app; the pill turns into the green tick and small chips say what was fixed. Four apps take turns. Under it, the
// programs it types into drift past.

type App = "mail" | "chat" | "code" | "notes";
type Scene = { app: App; raw: string; clean: string; chips: string[] };

const SCENES: Scene[] = [
  { app: "mail", raw: "um so can we move the the meeting to uh Thursday", clean: "Can we move the meeting to Thursday?", chips: ["Filler removed", "Repeat fixed", "Punctuation added"] },
  { app: "chat", raw: "so uh the new mockups look look great ship it", clean: "The new mockups look great. Ship it!", chips: ["Filler removed", "Repeat fixed", "Punctuation added"] },
  { app: "code", raw: "um retry the request like three times before before showing an error", clean: "Retry the request three times before showing an error.", chips: ["Filler removed", "Repeat fixed", "Capital added"] },
  { app: "notes", raw: "okay so book the the train for Friday morning um and pack the charger", clean: "Book the train for Friday morning and pack the charger.", chips: ["Filler removed", "Repeat fixed", "Full stop added"] },
];
const FILLERS = new Set(["um", "uh", "so", "like", "okay"]);

// the beats of one dictation, in ms from the start of its scene
const LISTEN = 300;
const WORD = 185;
const CHAR = 24;
function beats(s: Scene) {
  const n = s.raw.split(" ").length;
  const write = LISTEN + n * WORD + 450; // the pill stops listening and writes
  const type = write + 650; // the words start going in
  const done = type + s.clean.length * CHAR + 180; // the green tick
  const end = done + 2700; // the next app
  return { write, type, done, end };
}
const BEATS = SCENES.map(beats);
const TOTAL = BEATS.reduce((a, b) => a + b.end, 0);

function locate(T: number) {
  let t = T % TOTAL;
  for (let i = 0; i < SCENES.length; i++) {
    if (t < BEATS[i].end) return { i, t };
    t -= BEATS[i].end;
  }
  return { i: 0, t: 0 };
}

/** Milliseconds of demo played, advancing only while `running`. Starts at `rest` (the finished first scene, which is
 * what reduced motion and the server show) and from 0 the first time it runs. */
function useClock(running: boolean, rest: number) {
  const [T, setT] = useState(rest);
  const acc = useRef<number | null>(null);
  useEffect(() => {
    if (!running || reducedMotion()) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      acc.current = (acc.current ?? 0) + Math.min(100, now - last);
      last = now;
      setT(acc.current);
    }, 40);
    return () => window.clearInterval(id);
  }, [running]);
  return T;
}

/** A voice-like level (0..1): syllables on a slow swell. */
const voice = (ms: number) => {
  const s = ms / 1000;
  const phrase = 0.55 + 0.45 * Math.sin(s * 1.7);
  const syl = Math.abs(Math.sin(s * 7.3)) * 0.6 + Math.abs(Math.sin(s * 11.1 + 1)) * 0.4;
  return Math.max(0.1, Math.min(1, 0.2 + 0.8 * phrase * syl));
};

// ---- small parts ----

/** Text typed so far, a caret, and the rest kept invisible so lines never reflow. */
function Typed({ text, n, caret, caretColor = "var(--fire)" }: { text: string; n: number; caret: boolean; caretColor?: string }) {
  return (
    <>
      {text.slice(0, n)}
      <span
        className="relative inline-block h-[1.1em] w-0 align-[-0.18em]"
        style={{ opacity: caret ? 1 : 0 }}
      >
        <span className="absolute inset-y-0 left-0 w-[2px] animate-blink rounded-full motion-reduce:animate-none" style={{ background: caretColor }} />
      </span>
      <span className="opacity-0">{text.slice(n)}</span>
    </>
  );
}

/** What was fixed: small white chips that pop in one by one. */
function Chips({ items, shown, className = "" }: { items: string[]; shown: number; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1.5 font-sans ${className}`}>
      {items.map((c, i) => (
        <span
          key={c}
          className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(17,19,24,.08)] bg-white py-1 pr-2.5 pl-1 text-[11.5px] font-medium whitespace-nowrap text-[#3a3f4b] shadow-[0_6px_16px_-8px_rgba(17,19,24,.35)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
          style={{ opacity: i < shown ? 1 : 0, transform: i < shown ? "none" : "translateY(6px) scale(.85)" }}
        >
          <span className="grid size-4 place-items-center rounded-full bg-[#17935f] text-white">
            <Check className="size-2.5" strokeWidth={3.2} />
          </span>
          {c}
        </span>
      ))}
    </div>
  );
}

function Dots({ dark = false }: { dark?: boolean }) {
  const o = dark ? "opacity-90" : "";
  return (
    <span className={`flex gap-1.5 ${o}`}>
      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
      <span className="size-2.5 rounded-full bg-[#febc2e]" />
      <span className="size-2.5 rounded-full bg-[#28c840]" />
    </span>
  );
}

function Frame({ title, dark = false, children, right }: { title: string; dark?: boolean; children: ReactNode; right?: ReactNode }) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-[16px] border ${
        dark ? "border-white/10 bg-[#16181f] text-[#d2d6df]" : "border-[rgba(17,19,24,.08)] bg-white text-[#111318]"
      } shadow-[0_24px_50px_-24px_rgba(17,19,24,.45),0_4px_12px_-6px_rgba(17,19,24,.12)]`}
    >
      <div className={`relative flex h-9 shrink-0 items-center px-3.5 ${dark ? "bg-[#1c1f27]" : "border-b border-[rgba(17,19,24,.07)] bg-[#f6f7f9]"}`}>
        <Dots dark={dark} />
        <span className={`absolute left-1/2 -translate-x-1/2 text-[11.5px] font-semibold ${dark ? "text-[#9da3b1]" : "text-[#676d7b]"}`}>{title}</span>
        {right && <span className="ml-auto">{right}</span>}
      </div>
      {children}
    </div>
  );
}

type WinProps = { s: Scene; n: number; caret: boolean; chips: number };

function MailWin({ s, n, caret, chips }: WinProps) {
  return (
    <Frame title="New message">
      <div className="flex items-center gap-2 border-b border-[rgba(17,19,24,.07)] px-4 py-2 text-[12.5px]">
        <span className="w-14 text-[#979dab]">To</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eceef3] py-0.5 pr-2.5 pl-0.5 font-medium text-[#3a3f4b]">
          <span className="grid size-5 place-items-center rounded-full bg-[#ffd9c7] text-[10px] font-semibold text-[#d9431a]">S</span>
          Sam
        </span>
      </div>
      <div className="flex items-center gap-2 border-b border-[rgba(17,19,24,.07)] px-4 py-2 text-[12.5px]">
        <span className="w-14 text-[#979dab]">Subject</span>
        <span className="font-semibold">Thursday</span>
      </div>
      <div className="flex-1 px-4 pt-3 text-[13.5px] leading-[1.6] sm:text-[14.5px]">
        <p>Hi Sam,</p>
        <p className="mt-1.5">
          <Typed text={s.clean} n={n} caret={caret} />
        </p>
        <Chips items={s.chips} shown={chips} className="mt-3" />
      </div>
      <div className="flex items-center gap-3 px-4 pb-3">
        <span className="rounded-full bg-[#3473d6] px-3.5 py-1.5 text-[12px] font-semibold text-white">Send</span>
        <span className="h-2 w-10 rounded-full bg-[#eceef3]" />
        <span className="h-2 w-6 rounded-full bg-[#eceef3]" />
      </div>
    </Frame>
  );
}

function ChatWin({ s, n, caret, chips }: WinProps) {
  return (
    <Frame title="Team chat">
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[104px] shrink-0 flex-col gap-1 bg-[#1c1f27] px-2 py-3 text-[11.5px] text-[#9da3b1] sm:flex">
          <span className="px-2 pb-1 text-[10px] font-semibold tracking-wide text-[#6f7584] uppercase">Channels</span>
          <span className="rounded-md px-2 py-1"># general</span>
          <span className="rounded-md bg-[#ff6b3d] px-2 py-1 font-semibold text-white"># design</span>
          <span className="rounded-md px-2 py-1"># launch</span>
          <span className="rounded-md px-2 py-1"># random</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[rgba(17,19,24,.07)] px-3.5 py-2 text-[12.5px] font-semibold"># design</div>
          <div className="flex gap-2.5 px-3.5 pt-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#e2dcff] text-[11px] font-semibold text-[#6250d6]">L</span>
            <div className="min-w-0 text-[12.5px] leading-snug">
              <p>
                <span className="font-semibold">Lena</span> <span className="text-[10.5px] text-[#979dab]">10:24</span>
              </p>
              <p className="text-[#3a3f4b]">New mockups are up. Thoughts?</p>
            </div>
          </div>
          <div className="mt-auto p-3">
            <div className="rounded-xl border border-[rgba(17,19,24,.13)] px-3 pt-2 pb-2">
              <p className="min-h-[1.5em] text-[13px] leading-[1.5] sm:text-[13.5px]">
                <Typed text={s.clean} n={n} caret={caret} />
              </p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <Chips items={s.chips} shown={chips} />
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#17935f] text-white">
                  <ArrowRight className="size-3.5" strokeWidth={2.4} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

const CODE: [string, string][] = [
  ["kw", "export async function"],
  ["fn", " sync"],
  ["tx", "(url: string) {"],
];
function CodeWin({ s, n, caret, chips }: WinProps) {
  const ln = "w-6 shrink-0 pr-3 text-right text-[#4b5060] select-none";
  return (
    <Frame title="sync.ts — Editor" dark>
      <div className="flex shrink-0 gap-px bg-[#1c1f27] text-[11px]">
        <span className="border-t-2 border-[#ff6b3d] bg-[#16181f] px-3 py-1.5 text-[#f4f5f8]">sync.ts</span>
        <span className="px-3 py-1.5 text-[#6f7584]">api.ts</span>
      </div>
      <div className="relative flex-1 overflow-hidden py-2.5 font-mono text-[11.5px] leading-[1.75] sm:text-[12.5px]">
        <div className="flex whitespace-pre">
          <span className={ln}>1</span>
          <span>
            <span className="text-[#c792ea]">import</span> {"{ fetchJson, wait }"} <span className="text-[#c792ea]">from</span> <span className="text-[#c3e88d]">&quot;./api&quot;</span>;
          </span>
        </div>
        <div className="flex">
          <span className={ln}>2</span>
        </div>
        <div className="flex bg-[rgba(255,107,61,.07)]">
          <span className={ln}>3</span>
          <span className="min-w-0 pr-3 whitespace-pre-wrap text-[#7fb986]">
            {"// "}
            <Typed text={s.clean} n={n} caret={caret} caretColor="#ff9c5e" />
          </span>
        </div>
        <div className="flex whitespace-pre">
          <span className={ln}>4</span>
          <span>
            {CODE.map(([k, t]) => (
              <span key={t} className={k === "kw" ? "text-[#c792ea]" : k === "fn" ? "text-[#82aaff]" : ""}>
                {t}
              </span>
            ))}
          </span>
        </div>
        <div className="flex whitespace-pre">
          <span className={ln}>5</span>
          <span>
            {"  "}
            <span className="text-[#c792ea]">for</span> (<span className="text-[#c792ea]">let</span> i = <span className="text-[#f78c6c]">0</span>; i &lt; <span className="text-[#f78c6c]">3</span>; i++) {"{"}
          </span>
        </div>
        <div className="flex whitespace-pre">
          <span className={ln}>6</span>
          <span>
            {"    "}
            <span className="text-[#c792ea]">try</span> {"{ "}
            <span className="text-[#c792ea]">return await</span> <span className="text-[#82aaff]">fetchJson</span>(url); {"}"}
          </span>
        </div>
        <div className="flex whitespace-pre">
          <span className={ln}>7</span>
          <span>
            {"    "}
            <span className="text-[#c792ea]">catch</span> {"{ "}
            <span className="text-[#c792ea]">await</span> <span className="text-[#82aaff]">wait</span>(<span className="text-[#f78c6c]">500</span> * i); {"}"}
          </span>
        </div>
        <div className="flex whitespace-pre">
          <span className={ln}>8</span>
          <span>{"  }"}</span>
        </div>
        <div className="flex whitespace-pre">
          <span className={ln}>9</span>
          <span>
            {"  "}
            <span className="text-[#82aaff]">showError</span>(<span className="text-[#c3e88d]">&quot;Could not sync&quot;</span>);
          </span>
        </div>
        <Chips items={s.chips} shown={chips} className="absolute right-3 bottom-3 max-w-[70%] justify-end" />
      </div>
    </Frame>
  );
}

function NotesWin({ s, n, caret, chips }: WinProps) {
  const box = "mt-[0.3em] size-3.5 shrink-0 rounded-[4px] border border-[rgba(17,19,24,.25)]";
  return (
    <Frame title="Notes">
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[118px] shrink-0 flex-col gap-0.5 border-r border-[rgba(17,19,24,.07)] bg-[#f9fafb] p-2 text-[11.5px] text-[#676d7b] sm:flex">
          <span className="rounded-md bg-[#eceef3] px-2 py-1.5 font-semibold text-[#111318]">Weekend plans</span>
          <span className="px-2 py-1.5">Reading list</span>
          <span className="px-2 py-1.5">Gift ideas</span>
          <span className="px-2 py-1.5">Recipes</span>
        </div>
        <div className="min-w-0 flex-1 px-4 pt-3.5 sm:px-5">
          <p className="text-[17px] font-bold tracking-[-0.02em]">Weekend plans</p>
          <p className="text-[11px] text-[#979dab]">Edited just now</p>
          <ul className="mt-2.5 space-y-1.5 text-[13px] leading-[1.5] sm:text-[13.5px]">
            <li className="flex gap-2">
              <span className={`${box} grid place-items-center border-[#17935f] bg-[#17935f] text-white`}>
                <Check className="size-2.5" strokeWidth={3.2} />
              </span>
              <span className="text-[#979dab] line-through">Check the weather</span>
            </li>
            <li className="flex gap-2">
              <span className={box} />
              Ask Mia about Sunday lunch
            </li>
            <li className="flex gap-2">
              <span className={box} />
              <span className="min-w-0">
                <Typed text={s.clean} n={n} caret={caret} />
              </span>
            </li>
          </ul>
          <Chips items={s.chips} shown={chips} className="mt-3 pl-5.5" />
        </div>
      </div>
    </Frame>
  );
}

const WINS: Record<App, (p: WinProps) => ReactNode> = { mail: MailWin, chat: ChatWin, code: CodeWin, notes: NotesWin };

/** The little desktop: a soft backdrop, the app windows taking turns, the raw words and the pill at the bottom. */
function Demo() {
  const [viewRef, inView] = useInView<HTMLDivElement>("0px");
  const T = useClock(inView, BEATS[0].end - 1);
  const { i: cur, t } = locate(T);
  const b = BEATS[cur];
  const s = SCENES[cur];

  const listening = t < b.write;
  const pill: PillState = listening ? "listening" : t < b.done ? "writing" : "done";
  const level = listening && t > LISTEN ? voice(T) : 0.15;
  const words = s.raw.split(" ");
  const said = Math.max(0, Math.min(words.length, Math.floor((t - LISTEN) / WORD) + 1));
  const bubble = t >= LISTEN - 100 && t < b.type + 150;
  const typed = Math.max(0, Math.min(s.clean.length, Math.floor((t - b.type) / CHAR)));
  const chips = s.chips.filter((_, k) => t >= b.done + 220 + k * 170).length;

  return (
    <div ref={viewRef} aria-hidden className="relative h-[440px] overflow-hidden rounded-[28px] border border-line shadow-lg sm:h-[470px]">
      {/* the wallpaper */}
      <div className="absolute inset-0 bg-[linear-gradient(140deg,#ffe6d6_0%,#f6eefc_48%,#ddf3ec_100%)]" />
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-[#ffb48a] opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 size-80 rounded-full bg-[#9be3cc] opacity-45 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 size-56 rounded-full bg-[#c9bfff] opacity-35 blur-3xl" />

      {/* the apps */}
      <div className="absolute inset-x-4 top-4 h-[252px] sm:inset-x-7 sm:top-7 sm:h-[300px]">
        {SCENES.map((sc, k) => {
          const on = k === cur;
          const Win = WINS[sc.app];
          return (
            <div
              key={sc.app}
              className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(.25,1,.5,1)]"
              style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px) scale(.965)", zIndex: on ? 2 : 1 }}
            >
              <Win s={sc} n={on ? typed : sc.clean.length} caret={on && t >= b.type - 400 && t < b.end - 200} chips={on ? chips : sc.chips.length} />
            </div>
          );
        })}
      </div>

      {/* what was said, above the pill (as the app shows it) */}
      <div
        className="absolute bottom-[74px] left-1/2 z-10 w-[min(88%,390px)] rounded-2xl border border-white/10 bg-[rgba(20,21,27,.9)] px-4 py-2.5 text-center text-[13px] leading-[1.5] text-[#b4b9c5] shadow-[0_18px_40px_-18px_rgba(0,0,0,.6)] backdrop-blur transition-[opacity,transform] duration-300 sm:text-[13.5px]"
        style={{ opacity: bubble ? 1 : 0, transform: `translate(-50%, ${bubble ? 0 : 8}px)` }}
      >
        {words.map((w, k) => (
          <span key={k} className="transition-opacity duration-200" style={{ opacity: k < said ? (FILLERS.has(w) ? 0.6 : 1) : 0 }}>
            {w}{" "}
          </span>
        ))}
      </div>

      {/* the pill */}
      <div className="absolute bottom-5 left-1/2 z-10 flex h-11 -translate-x-1/2 items-center">
        <div className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,51,.25),transparent)]" />
        <Pill state={pill} level={level} className="relative" />
      </div>
    </div>
  );
}

// ---- the apps strip ----

type Mark = { name: string; style: CSSProperties; prefix?: string };
const sans = "var(--font-sans)";
const mono = "var(--font-mono)";
const MARKS: Mark[] = [
  { name: "Slack", style: { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "lowercase" } },
  { name: "Gmail", style: { fontFamily: sans, fontWeight: 500, letterSpacing: "-0.02em" } },
  { name: "Outlook", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "-0.01em" } },
  { name: "Word", style: { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.03em" } },
  { name: "Google Docs", style: { fontFamily: sans, fontWeight: 400, letterSpacing: "-0.02em" } },
  { name: "Notion", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "-0.035em" } },
  { name: "VS Code", style: { fontFamily: mono, fontWeight: 500, fontSize: "0.88em", letterSpacing: "-0.02em" } },
  { name: "Cursor", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.8em" } },
  { name: "ChatGPT", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "-0.03em" } },
  { name: "Claude", style: { fontFamily: sans, fontWeight: 500, letterSpacing: "-0.02em" } },
  { name: "Discord", style: { fontFamily: sans, fontWeight: 800, letterSpacing: "-0.03em" } },
  { name: "WhatsApp", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "-0.02em" } },
  { name: "Teams", style: { fontFamily: sans, fontWeight: 500, letterSpacing: "0.01em" } },
  { name: "Obsidian", style: { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.02em" } },
  { name: "Excel", style: { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.01em" } },
  { name: "Figma", style: { fontFamily: sans, fontWeight: 500, letterSpacing: "-0.03em" } },
  { name: "Terminal", prefix: ">_", style: { fontFamily: mono, fontWeight: 500, fontSize: "0.88em" } },
];

function AppMark({ m }: { m: Mark }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 px-5 whitespace-nowrap sm:px-7" style={m.style}>
      {m.prefix && <span className="text-fire-ink">{m.prefix}</span>}
      {m.name}
    </span>
  );
}

function AppsStrip() {
  const [ref, inView] = useInView<HTMLDivElement>("40px");
  return (
    <div ref={ref} className="container-x mt-12 sm:mt-14">
      <div className="flex flex-col items-center gap-3 border-t border-line pt-6 md:flex-row md:gap-8">
        <p className="shrink-0 text-[13px] font-medium text-muted">Works in every app you type in</p>
        <ul className="sr-only">
          {MARKS.map((m) => (
            <li key={m.name}>{m.name}</li>
          ))}
        </ul>
        <div className="mask-fade-x flex w-full min-w-0 overflow-hidden text-[17px] text-muted motion-reduce:hidden sm:text-[19px]" aria-hidden>
          <div className="flex w-max animate-marquee items-center" style={{ animationDuration: "55s", animationPlayState: inView ? "running" : "paused" }}>
            {[0, 1].map((copy) => MARKS.map((m) => <AppMark key={`${copy}-${m.name}`} m={m} />))}
          </div>
        </div>
        <div className="hidden flex-wrap justify-center gap-y-2 text-[17px] text-muted motion-reduce:flex" aria-hidden>
          {MARKS.map((m) => (
            <AppMark key={m.name} m={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

const enter = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="ambient pt-8 pb-8 sm:pt-12 lg:pt-14">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-12">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="eyebrow enter" style={enter(0)}>
            <span className="fire-gradient size-2 rounded-full shadow-[0_0_0_3px_var(--fire-soft)]" aria-hidden />
            New &middot; Start with &ldquo;Hey FireVoice&rdquo;
          </p>
          <h1 id="hero-title" className="display display-xl enter mt-5 lg:text-[clamp(3.3rem,4.9vw,4.4rem)]" style={enter(1)}>
            Stop typing. <em>Start talking.</em>
          </h1>
          <p className="lede enter mt-6 max-w-[31rem]" style={enter(2)}>
            Speak in any app and FireVoice writes it out, clean and punctuated, right where your cursor is. Free, and it runs on your own computer.
          </p>
          <div className="enter mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" style={enter(3)}>
            <DownloadButton className="btn-lg" />
            <a href="#how" className="btn btn-line btn-lg ki-trigger">
              See how it works
              <ArrowDown className="size-4" />
            </a>
          </div>
          <ul className="enter mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13.5px] font-medium text-ink-2 lg:justify-start" style={enter(4)}>
            {["Free", "Windows, Mac & Linux", "Works offline"].map((c) => (
              <li key={c} className="inline-flex items-center gap-1.5">
                <span className="grid size-[18px] place-items-center rounded-full bg-ok-soft text-ok">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="enter w-full" style={enter(3)}>
          <Demo />
        </div>
      </div>

      <AppsStrip />
    </section>
  );
}
