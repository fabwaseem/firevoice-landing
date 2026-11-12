"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Heading, Pill } from "@/site/ui";
import { Reveal, reducedMotion, useInView } from "@/site/motion";
import { ArrowRight, BookA, ChartColumn, Globe, History, Keyboard, Mic, Search, Volume2, Wand2, Zap } from "@/components/icons";

// Features: a bento of the things that make dictation fit the way people talk. Every tile carries a small live piece of
// the FireVoice app (the pill, the Dictionary, the Home stats, History), drawn the way the app draws them. Each demo
// runs only while its tile is on screen; with reduced motion each one rests on its finished state.

/* ---------- small helpers ---------- */

function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStill(reducedMotion());
  }, []);
  return still;
}

/** Steps through 0..n-1 every `ms` while `running`; with reduced motion it rests on `rest`. */
function useTick(n: number, ms: number, running: boolean, rest = 0) {
  const still = useStill();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!running || still) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % n), ms);
    return () => window.clearInterval(t);
  }, [running, still, n, ms]);
  return still ? rest : i;
}

/** 0 → 1 over `ms` the first time `go` is true (eased); straight to 1 with reduced motion. */
function useProgress(go: boolean, ms = 1400) {
  const still = useStill();
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!go || still) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      setP(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [go, still, ms]);
  return still ? 1 : p;
}

const EASE = "cubic-bezier(.25,1,.5,1)";
/** a crossfade that lets the old text leave before the new one arrives */
const swap = (on: boolean) => ({ opacity: on ? 1 : 0, transition: on ? `opacity .4s ${EASE} .18s` : "opacity .18s ease-out" });
const fade = (on: boolean, y = 8, delay = 0) => ({
  opacity: on ? 1 : 0,
  transform: on ? "none" : `translate3d(0, ${y}px, 0)`,
  transition: `opacity .5s ${EASE} ${delay}ms, transform .5s ${EASE} ${delay}ms`,
});

/* the kit's icons, by the names the tiles use */
const ICONS = {
  mic: Mic,
  book: BookA,
  volume: Volume2,
  search: Search,
  zap: Zap,
  wand: Wand2,
  globe: Globe,
  keyboard: Keyboard,
  history: History,
  arrow: ArrowRight,
  chart: ChartColumn,
} as const;

function Ic({ name, className = "size-4", active }: { name: keyof typeof ICONS; className?: string; active?: boolean }) {
  const I = ICONS[name];
  return active === undefined ? <I className={className} aria-hidden /> : <I className={className} aria-hidden trigger="manual" active={active} />;
}

const stage = "relative overflow-hidden rounded-[14px] border border-line bg-surface-2";

/* ---------- 1. Hey FireVoice ---------- */

const LEVELS = [0.35, 0.7, 0.5, 0.85, 0.45, 0.75, 0.6, 0.9];

function WakeDemo({ running }: { running: boolean }) {
  // 0 idle · 1 "Hey FireVoice" · 2 listening · 3 the request · 4 typed, tick · 5 hold
  const t = useTick(6, 1150, running, 4);
  const listening = t === 2 || t === 3;
  const lv = useTick(LEVELS.length, 140, running && listening);
  const teach = useTick(8, 650, running, 5);
  const dots = Math.min(teach, 5);

  return (
    <div>
      <div className={`${stage} h-[236px] sm:h-[248px]`} aria-hidden>
        {/* the person speaking */}
        <div className="absolute top-5 left-4 flex max-w-[78%] flex-col items-start gap-2 sm:left-5 sm:max-w-[44%]">
          <div className="flex items-end gap-2" style={fade(t >= 1 && t <= 4, 10)}>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-3 text-ink-2">
              <Ic name="mic" className="size-3.5" />
            </span>
            <span className="rounded-[16px] rounded-bl-[5px] border border-line bg-surface px-3.5 py-2 text-[15px] font-semibold tracking-[-0.01em] text-ink shadow-[var(--shadow-md)]">
              “Hey FireVoice”
            </span>
          </div>
          <span
            className="ml-9 rounded-[14px] rounded-tl-[5px] border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-2 shadow-[var(--shadow-sm)]"
            style={fade(t >= 3 && t <= 4, 8)}
          >
            tell Sam I’m on my way
          </span>
        </div>

        {/* where the words go */}
        <div className="absolute top-5 right-5 hidden w-[46%] rounded-[12px] border border-line bg-surface shadow-[var(--shadow-md)] sm:block">
          <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
            <span className="grid size-5 place-items-center rounded-[6px] bg-violet-soft text-[10px] font-bold text-violet">S</span>
            <span className="text-[12px] font-semibold text-ink">Sam Carter</span>
            <span className="ml-auto text-[10.5px] text-faint">Slack</span>
          </div>
          <div className="space-y-2 px-3 py-3">
            <p className="w-fit rounded-[10px] bg-surface-2 px-2.5 py-1.5 text-[12px] text-ink-2">Are you still coming?</p>
            <div className="flex min-h-[34px] items-center rounded-[10px] border border-line-strong px-2.5 text-[12.5px] text-ink">
              <span style={fade(t >= 4, 4)}>I’m on my way, Sam.</span>
              {t < 4 && <span className="ml-0.5 h-3.5 w-px animate-blink bg-ink" />}
            </div>
          </div>
        </div>

        {/* the pill, waking */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <span className="relative inline-flex">
            {listening && (
              <>
                <span className="fv-ring absolute inset-0 rounded-full" />
                <span className="fv-ring absolute inset-0 rounded-full [animation-delay:.9s]" />
              </>
            )}
            <Pill state={t >= 4 ? "done" : listening ? "listening" : "idle"} level={listening ? LEVELS[lv] : 0.3} label={t === 0 || t === 5 ? "Say “Hey FireVoice”" : undefined} />
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" aria-hidden>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-medium text-ink-2">
          <Ic name="globe" className="size-3.5 text-fire" />
          Works with accents
        </span>
        <span className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-[12.5px] font-medium text-ink-2">
          Teach it your voice
          <span className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="size-1.5 rounded-full transition-colors duration-300" style={{ background: i < dots ? "var(--fire)" : "var(--surface-3)" }} />
            ))}
          </span>
          <span className="w-7 text-[11.5px] text-faint tabular-nums">{dots}/5</span>
        </span>
      </div>
    </div>
  );
}

/* ---------- 2. Dictionary ---------- */

const WORDS = [
  { word: "Siobhan", heard: ["Shivon", "Shavon"] },
  { word: "Kubernetes", heard: [] as string[] },
  { word: "FireVoice", heard: ["Fireboys"] },
];
const NEW_WORDS = [
  { word: "Nguyen", heard: ["Win", "New yen"] },
  { word: "Grafana", heard: ["Gravana"] },
  { word: "Saoirse", heard: ["Sersha"] },
];
const ROW = 54;

function WordRow({ word, heard, fresh, playing }: { word: string; heard: string[]; fresh?: boolean; playing?: boolean }) {
  return (
    <li className="flex items-center gap-3 border-b border-line px-4" style={{ height: ROW }}>
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
          {word}
          {fresh && <span className="rounded-full bg-ok-soft px-1.5 text-[10.5px] font-semibold text-ok">New</span>}
        </span>
        {heard.length > 0 ? (
          <span className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-faint">
            also heard as
            {heard.map((h) => (
              <span key={h} className="rounded-full bg-surface-2 px-2 py-px text-[11px] text-ink-2">
                {h}
              </span>
            ))}
          </span>
        ) : (
          <span className="mt-0.5 block text-[11.5px] text-faint">spelled and said your way</span>
        )}
      </div>
      <span className="grid size-8 shrink-0 place-items-center rounded-[9px] text-muted">
        <Ic name="volume" className="size-4" active={!!playing} />
      </span>
    </li>
  );
}

function DictionaryDemo({ running }: { running: boolean }) {
  // four steps per new word: ready (hidden) · in · hold · out
  const t = useTick(12, 1300, running, 1);
  const extra = NEW_WORDS[Math.floor(t / 4)];
  const shown = t % 4 === 1 || t % 4 === 2;
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface shadow-[var(--shadow-md)]" aria-hidden>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="text-[13.5px] font-semibold text-ink">
          Your words <span className="ml-0.5 font-normal text-muted tabular-nums">{shown ? 4 : 3}</span>
        </span>
        <span className="flex h-8 w-36 items-center gap-1.5 rounded-[9px] border border-line-strong bg-surface px-2.5 text-[12px] text-faint">
          <Ic name="search" className="size-3.5" />
          Search words
        </span>
      </div>
      <div className="relative overflow-hidden" style={{ height: ROW * 3 }}>
        <ul style={{ transform: shown ? "none" : `translate3d(0, ${-ROW}px, 0)`, transition: `transform .7s ${EASE}` }}>
          <div style={{ opacity: shown ? 1 : 0, transition: `opacity .5s ${EASE}` }}>
            <WordRow {...extra} fresh playing={t % 4 === 2} />
          </div>
          {WORDS.map((w) => (
            <WordRow key={w.word} {...w} />
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate rounded-[9px] border border-line-strong bg-surface px-2.5 py-1.5 text-[12px] text-ink-2">Siobhan moved the Kubernetes demo</span>
        <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] border border-line-strong bg-surface px-2.5 text-[12px] font-medium text-ink">
          <Ic name="volume" className="size-3.5 text-fire" />
          Hear it
        </span>
      </div>
    </div>
  );
}

/* ---------- 3. Snippets ---------- */

const ADDRESS = ["Alex Morgan", "18 Willow Lane", "Bristol BS1 5TR", "United Kingdom"];

function SnippetDemo({ running }: { running: boolean }) {
  const t = useTick(4, 1500, running, 1);
  const open = t === 1 || t === 2;
  return (
    <div className={`${stage} h-[252px] p-4`} aria-hidden>
      <div className="flex items-center gap-2.5">
        <Pill size="sm" state={open ? "done" : "listening"} level={0.55} />
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-fire/30 bg-fire-soft px-3 text-[13px] font-semibold text-fire-ink">
          <Ic name="zap" className="size-3.5" active={open} />
          “my address”
        </span>
      </div>
      <div
        className="mt-3 rounded-[12px] border border-line bg-surface p-3.5 shadow-[var(--shadow-md)]"
        style={{ clipPath: open ? "inset(0 0 0 0 round 12px)" : "inset(0 0 100% 0 round 12px)", transition: `clip-path .65s ${EASE}` }}
      >
        <span className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.08em] text-muted uppercase">Typed for you</span>
        {ADDRESS.map((l, i) => (
          <span key={l} className="block text-[13.5px] leading-[1.55] text-ink" style={fade(open, 6, open ? 120 + i * 70 : 0)}>
            {l}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-4 bottom-3.5 flex flex-wrap gap-1.5">
        {["my email", "sign-off", "meeting link"].map((s) => (
          <span key={s} className="rounded-full bg-surface-3 px-2.5 py-0.5 text-[11.5px] text-ink-2">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- 4. Writes for where it goes ---------- */

const TONES = [
  { key: "Email", app: "Gmail", text: "Hi Priya,\nThe deck is running late. It will be ready on Friday.\nBest, Alex" },
  { key: "Chat", app: "Slack", text: "Hey Priya, the deck’s running late. It’ll be ready Friday, sorry!" },
  { key: "Notes", app: "Notes", text: "• Deck for Priya: running late\n• Ready by Friday" },
];

function ToneDemo({ running }: { running: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  const auto = useTick(TONES.length, 2800, running && picked === null, 0);
  const idx = picked ?? auto;
  return (
    <div className={`${stage} h-[252px] p-3`}>
      <div role="group" aria-label="Where the text goes" className="flex gap-0.5 rounded-[11px] bg-surface-3 p-0.5">
        {TONES.map((tn, i) => (
          <button
            key={tn.key}
            type="button"
            aria-pressed={idx === i}
            onClick={() => setPicked(i)}
            className={`h-11 flex-1 rounded-[9px] text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200 ${idx === i ? "bg-surface text-ink shadow-[var(--shadow-sm)]" : "text-muted hover:text-ink"}`}
          >
            {tn.key}
          </button>
        ))}
      </div>
      <p className="mt-2.5 px-1 text-[11.5px] text-faint">
        You said: <span className="text-muted italic">“uh tell Priya the deck is late, it’s ready Friday, sorry”</span>
      </p>
      <div className="relative mt-2 h-[126px] rounded-[12px] border border-line bg-surface shadow-[var(--shadow-sm)]">
        {TONES.map((tn, i) => (
          <div key={tn.key} className="absolute inset-0 p-3" style={swap(idx === i)} aria-hidden={idx !== i}>
            <span className="mb-1 block text-[10.5px] font-semibold tracking-[0.08em] text-muted uppercase">In {tn.app}</span>
            <p className="text-[13px] leading-[1.5] whitespace-pre-line text-ink">{tn.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 5. Any language ---------- */

const LANGS = [
  { name: "English", lang: "en", dir: "ltr", text: "Can we move the meeting to Thursday?" },
  { name: "Español", lang: "es", dir: "ltr", text: "¿Podemos mover la reunión al jueves?" },
  { name: "Deutsch", lang: "de", dir: "ltr", text: "Können wir das Meeting auf Donnerstag verschieben?" },
  { name: "Français", lang: "fr", dir: "ltr", text: "Peut-on déplacer la réunion à jeudi ?" },
  { name: "हिन्दी", lang: "hi", dir: "ltr", text: "क्या हम मीटिंग गुरुवार को कर सकते हैं?" },
  { name: "اردو", lang: "ur", dir: "rtl", text: "کیا ہم میٹنگ جمعرات کو کر سکتے ہیں؟" },
] as const;

function LanguageDemo({ running }: { running: boolean }) {
  const t = useTick(LANGS.length, 1900, running, 0);
  return (
    <div className={`${stage} h-[252px] p-4`} aria-hidden>
      <div className="flex items-center gap-2.5">
        <Pill size="sm" state="listening" level={0.5} />
        <span className="relative inline-grid h-8 min-w-[120px] items-center rounded-full border border-info/25 bg-info-soft px-3 text-[12.5px] font-semibold text-info">
          {LANGS.map((l, i) => (
            <span key={l.lang} lang={l.lang} dir={l.dir} className="col-start-1 row-start-1 flex items-center gap-1.5" style={swap(t === i)}>
              <Ic name="globe" className="size-3.5 shrink-0" />
              {l.name}
            </span>
          ))}
        </span>
      </div>
      <div className="relative mt-3 grid min-h-[86px] rounded-[12px] border border-line bg-surface p-3.5 shadow-[var(--shadow-md)]">
        {LANGS.map((l, i) => (
          <p
            key={l.lang}
            lang={l.lang}
            dir={l.dir}
            className="col-start-1 row-start-1 text-[15px] leading-snug font-medium text-ink"
            style={{ ...swap(t === i), textAlign: l.dir === "rtl" ? "right" : "left" }}
          >
            {l.text}
          </p>
        ))}
      </div>
      <div className="absolute inset-x-4 bottom-3.5">
        <span className="mb-1.5 block text-[11px] text-faint">Detects the language you speak</span>
        <div className="flex flex-wrap gap-1">
          {LANGS.map((l, i) => (
            <span
              key={l.lang}
              lang={l.lang}
              className={`rounded-full px-2 py-0.5 text-[11px] transition-colors duration-300 ${t === i ? "bg-ink text-surface" : "bg-surface-3 text-ink-2"}`}
            >
              {l.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 6. Your day, in numbers ---------- */

const WEEK = [
  { d: "Mon", v: 0.55 },
  { d: "Tue", v: 0.8 },
  { d: "Wed", v: 0.42 },
  { d: "Thu", v: 1 },
  { d: "Fri", v: 0.7 },
  { d: "Sat", v: 0.18 },
  { d: "Sun", v: 0.34 },
];
const APPS = [
  { name: "Slack", words: "1,904" },
  { name: "Gmail", words: "1,377" },
  { name: "VS Code", words: "862" },
  { name: "Notion", words: "669" },
];

function HomeDemo({ running }: { running: boolean }) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (running) setSeen(true);
  }, [running]);
  const p = useProgress(seen);
  const saved = Math.round(88 * p);
  const stats = [
    { label: "Words this week", value: Math.round(4812 * p).toLocaleString("en-US"), sub: "212 dictations", fire: true },
    { label: "Time saved", value: `${Math.floor(saved / 60)}h ${saved % 60}m`, sub: "against typing" },
    { label: "Words a minute", value: String(Math.round(148 * p)), sub: "3.7× typing" },
    { label: "Streak", value: `${Math.round(6 * p)} days`, sub: "in a row" },
  ];
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-surface p-4 shadow-[var(--shadow-md)] sm:h-[318px] sm:p-5" aria-hidden>
      <div className="pointer-events-none absolute -top-24 -right-20 size-60 rounded-full bg-fire/10 blur-3xl" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
            <span className="fire-gradient grid size-7 place-items-center rounded-[8px] text-white">
              <Ic name="keyboard" className="size-3.5" />
            </span>
            Dictation
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-fire-ink">
            Open <Ic name="arrow" className="size-3.5" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`min-w-0 ${i > 0 ? "sm:border-l sm:border-line sm:pl-4" : ""}`}>
              <span className="block truncate text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">{s.label}</span>
              <span className={`mt-1 block text-[23px] leading-none font-semibold tracking-[-0.02em] tabular-nums ${s.fire ? "text-fire" : "text-ink"}`}>{s.value}</span>
              <span className="mt-1 block text-[11px] text-muted">{s.sub}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_170px]">
          <div>
            <span className="mb-1.5 block text-[11px] text-muted">Words per day</span>
            <div className="flex h-[92px] items-end gap-1.5 border-b border-line">
              {WEEK.map((w, i) => (
                <div key={w.d} className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className={`origin-bottom rounded-t-[4px] ${i === 3 ? "bg-fire" : "bg-fire/70"}`}
                    style={{ height: `${w.v * 100}%`, transform: `scaleY(${seen || p === 1 ? 1 : 0})`, transition: `transform .9s ${EASE} ${200 + i * 70}ms` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex gap-1.5">
              {WEEK.map((w) => (
                <span key={w.d} className="flex-1 text-center text-[10px] text-faint">
                  {w.d}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="mb-1.5 block text-[11px] text-muted">Where it went</span>
            <ul className="space-y-2">
              {APPS.map((a, i) => (
                <li key={a.name} className="flex items-center gap-2 text-[12px]" style={fade(seen || p === 1, 6, 300 + i * 80)}>
                  <span className="truncate font-medium text-ink">{a.name}</span>
                  <span className="ml-auto text-muted tabular-nums">{a.words}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 7. History you can search ---------- */

type HItem = { kind: "day"; label: string } | { kind: "row"; app: string; letter: string; tone: string; text: string; time: string };
const HISTORY: HItem[] = [
  { kind: "day", label: "Today" },
  { kind: "row", app: "Slack", letter: "S", tone: "bg-violet-soft text-violet", text: "Running five minutes late, start without me.", time: "9:41" },
  { kind: "row", app: "Gmail", letter: "G", tone: "bg-info-soft text-info", text: "Hi Priya, the deck will be ready by Friday.", time: "9:12" },
  { kind: "row", app: "VS Code", letter: "C", tone: "bg-ok-soft text-ok", text: "Retry the upload when the network is back.", time: "8:57" },
  { kind: "day", label: "Yesterday" },
  { kind: "row", app: "Notion", letter: "N", tone: "bg-surface-3 text-ink", text: "Deck outline: the problem, a demo, next steps.", time: "17:20" },
  { kind: "row", app: "Slack", letter: "S", tone: "bg-violet-soft text-violet", text: "Lunch at one? The new place on Mill Street.", time: "12:04" },
];
const DAY_H = 28;
const ROW_H = 46;
const QUERY = "deck";

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const at = text.toLowerCase().indexOf(q);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-fire-soft px-px text-ink">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

/** Which history items show, and where: matching rows close up, the rest fade where they are. */
function layHistory(match: (it: HItem) => boolean) {
  let y = 0;
  let fullY = 0;
  const placed: { it: HItem; show: boolean; pos: number }[] = [];
  HISTORY.forEach((it, i) => {
    let show: boolean;
    if (it.kind === "day") {
      const rows: HItem[] = [];
      for (let j = i + 1; j < HISTORY.length && HISTORY[j].kind === "row"; j++) rows.push(HISTORY[j]);
      show = rows.some(match);
    } else show = match(it);
    const h = it.kind === "day" ? DAY_H : ROW_H;
    placed.push({ it, show, pos: show ? y : fullY });
    if (show) y += h;
    fullY += h;
  });
  return { placed, fullY };
}

function HistoryDemo({ running }: { running: boolean }) {
  // 160 ms steps: empty, type "deck", hold, delete, empty
  const t = useTick(44, 160, running, 0);
  const typed = t < 10 ? 0 : t < 14 ? t - 9 : t < 34 ? 4 : t < 38 ? 37 - t : 0;
  const q = QUERY.slice(0, typed);

  const match = (it: HItem) => it.kind === "row" && it.text.toLowerCase().includes(q);
  const { placed, fullY } = layHistory(match);
  const results = HISTORY.filter(match).length;

  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface p-3 shadow-[var(--shadow-md)] sm:h-[318px]" aria-hidden>
      <div className="flex h-10 items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3 text-[13px]">
        <Ic name="search" className="size-4 text-faint" />
        {q ? <span className="text-ink">{q}</span> : <span className="text-faint">{t >= 10 && t < 14 ? "" : "Search your dictations"}</span>}
        {(q || (t >= 10 && t < 14)) && <span className="-ml-1.5 h-4 w-px animate-blink bg-ink" />}
        {q && <span className="ml-auto text-[11.5px] text-faint tabular-nums">{results} found</span>}
      </div>
      <div className="relative mt-1.5" style={{ height: fullY }}>
        {placed.map(({ it, show, pos }, i) => (
          <div
            key={i}
            className="absolute inset-x-0 top-0"
            style={{ transform: `translate3d(0, ${pos}px, 0)`, opacity: show ? 1 : 0, transition: show ? `transform .5s ${EASE} .14s, opacity .35s ${EASE} .14s` : `transform .5s ${EASE}, opacity .16s ease-out` }}
          >
            {it.kind === "day" ? (
              <p className="flex items-end px-1 pb-1 text-[10.5px] font-semibold tracking-[0.08em] text-muted uppercase" style={{ height: DAY_H }}>
                {it.label}
              </p>
            ) : (
              <div className="flex items-center gap-2.5 border-b border-line px-1" style={{ height: ROW_H }}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-[8px] text-[11px] font-bold ${it.tone}`}>{it.letter}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                  <Highlight text={it.text} q={q} />
                </span>
                <span className="shrink-0 text-[11px] text-faint tabular-nums">{it.time}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- the bento ---------- */

function Tile({ span, icon, title, text, delay, children }: { span: string; icon: keyof typeof ICONS; title: ReactNode; text: string; delay: number; children: (running: boolean) => ReactNode }) {
  const [ref, inView] = useInView<HTMLElement>("0px 0px -8% 0px");
  return (
    <Reveal delay={delay} className={span}>
      <article ref={ref} className="card mi-trigger flex h-full flex-col gap-5 p-3 sm:p-4">
        {children(inView)}
        <div className="flex items-start gap-3 px-1.5 pb-1.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-fire-soft text-fire">
            <Ic name={icon} className="size-[18px]" />
          </span>
          <div>
            <h3 className="text-[16.5px] leading-tight font-semibold tracking-[-0.015em] text-ink">{title}</h3>
            <p className="mt-1 text-[14px] leading-snug text-muted">{text}</p>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function Features() {
  return (
    <section id="features" className="section ambient">
      <style>{`
        @keyframes fv-ring { from { transform: scale(1); opacity: .55; } to { transform: scale(1.55, 1.9); opacity: 0; } }
        .fv-ring { box-shadow: 0 0 0 2px rgba(255,106,51,.55), 0 0 24px 4px rgba(255,106,51,.35); animation: fv-ring 1.8s cubic-bezier(.25,1,.5,1) infinite; }
        @media (prefers-reduced-motion: reduce) { .fv-ring { display: none; } }
      `}</style>
      <div className="container-x">
        <Heading eyebrow="Features" lede="Everything dictation should have done all along, in one small pill.">
          Built for the way <em>you talk.</em>
        </Heading>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-16 lg:grid-cols-12">
          <Tile span="lg:col-span-7" icon="mic" title="Just say “Hey FireVoice”" text="No keys to press. Say it, then say what you want written, in any app. It wakes for your accent too." delay={0}>
            {(r) => <WakeDemo running={r} />}
          </Tile>
          <Tile span="lg:col-span-5" icon="book" title="It learns your words" text="Names and terms are spelled your way when you dictate, and said right by the voices." delay={90}>
            {(r) => <DictionaryDemo running={r} />}
          </Tile>

          <Tile span="lg:col-span-4" icon="zap" title="Snippets" text="Say a short cue and get the long text: your address, your sign-off, a link." delay={0}>
            {(r) => <SnippetDemo running={r} />}
          </Tile>
          <Tile span="lg:col-span-4" icon="wand" title="Writes for where it goes" text="The same words, tidied to suit an email, a chat or your notes." delay={90}>
            {(r) => <ToneDemo running={r} />}
          </Tile>
          <Tile span="md:col-span-2 lg:col-span-4" icon="globe" title="Any language" text="Speak the language you think in. FireVoice notices and writes it." delay={180}>
            {(r) => <LanguageDemo running={r} />}
          </Tile>

          <Tile span="lg:col-span-7" icon="chart" title="Your day, in numbers" text="Words dictated, time saved against typing, how fast you speak and your streak, on Home." delay={0}>
            {(r) => <HomeDemo running={r} />}
          </Tile>
          <Tile span="lg:col-span-5" icon="history" title="History you can search" text="Everything you dictated, by day. Find that sentence from Tuesday in a second." delay={90}>
            {(r) => <HistoryDemo running={r} />}
          </Tile>
        </div>
      </div>
    </section>
  );
}
