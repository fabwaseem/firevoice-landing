"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Heading } from "@/site/ui";
import { Reveal, reducedMotion, useInView } from "@/site/motion";
import { Check, Clock, Keyboard, Laptop, Lock, Mic, Zap } from "@/components/icons";

// Why speak instead of type: a bento of live tiles. A race between a keyboard (40 words a minute) and a voice (150),
// a calculator for the hours it gives back, a tile on privacy (speech never leaves the computer), and the apps it
// writes in lighting up one by one.

const TYPE_WPM = 40;
const SPEAK_WPM = 150;
const WORKDAYS = 22;

const PASSAGE =
  "Thanks for sending the draft over so quickly. I read it on the train this morning and I think the structure works well. The opening could be shorter, and the second section needs one clear example, maybe the story from the workshop. Could we also move the budget table to the end? Let me know when the next version is ready and I will look at it straight away. If it helps, I can call you this afternoon to go through the changes together."
    .split(" ");
const written = (k: number) => Array.from({ length: k }, (_, i) => PASSAGE[i % PASSAGE.length]).join(" ");

function Tile({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card mi-trigger relative flex h-full flex-col overflow-hidden p-6 sm:p-7 ${className}`}>{children}</div>;
}

function TileHead({ icon, title, children }: { icon: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <span className="grid size-9 place-items-center rounded-xl bg-fire-soft text-fire-ink">{icon}</span>
      <h3 className="mt-4 text-[19px] font-semibold tracking-[-0.02em] text-ink">{title}</h3>
      {children && <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

// ---- the race ----

/** 0..1 through "one minute" of writing (7 s on screen), held, then again; 1 when still. */
function useRace(running: boolean) {
  const [p, setP] = useState(1);
  useEffect(() => {
    if (!running || reducedMotion()) return;
    const RUN = 7000;
    const HOLD = 2800;
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const e = (performance.now() - t0) % (RUN + HOLD);
      setP(Math.min(1, e / RUN));
    }, 50);
    return () => window.clearInterval(id);
  }, [running]);
  return p;
}

function Lane({ icon, label, wpm, p, fire = false }: { icon: ReactNode; label: string; wpm: number; p: number; fire?: boolean }) {
  const words = Math.floor(p * wpm);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
          <span className={fire ? "text-fire-ink" : "text-muted"}>{icon}</span>
          {label}
          <span className="font-normal text-muted">&middot; {wpm} wpm</span>
        </span>
        <span className="text-[14px] text-muted tabular-nums">
          <span className={`text-[22px] font-bold tracking-[-0.03em] ${fire ? "text-fire-ink" : "text-ink"}`}>{words}</span> words
        </span>
      </div>
      <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full origin-left rounded-full"
          style={{
            transform: `scaleX(${Math.round(((p * wpm) / SPEAK_WPM) * 1000) / 1000})`,
            transition: "transform 60ms linear",
            background: fire ? "linear-gradient(90deg,#ff8a4c,#ff4d2e)" : "var(--faint)",
          }}
        />
      </div>
      <div className="mt-2.5 flex h-[1.6em] justify-end overflow-hidden text-[13.5px] leading-[1.6] whitespace-nowrap text-ink-2 [mask-image:linear-gradient(to_right,transparent,#000_22%)]" aria-hidden>
        <span>
          {written(words)}
          <span className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] rounded-full ${fire ? "bg-fire" : "bg-faint"}`} />
        </span>
      </div>
    </div>
  );
}

function Race() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const p = useRace(inView);
  const secs = Math.round(p * 60);
  return (
    <Tile className="bg-[radial-gradient(90%_70%_at_100%_0%,var(--fire-soft),transparent_60%)]">
      <TileHead icon={<Zap className="size-[18px]" />} title="Nearly 4× faster than typing">
        Most people type about {TYPE_WPM} words a minute and speak about {SPEAK_WPM}. Here is one minute of each.
      </TileHead>
      <div className="my-auto flex flex-wrap items-end gap-x-4 gap-y-2 py-8" aria-hidden>
        <span className="bg-[linear-gradient(100deg,#ff8a4c,#ff4d2e_60%,#ff3d6e)] bg-clip-text pr-1 text-[clamp(72px,9vw,112px)] leading-[0.85] font-bold tracking-[-0.06em] text-transparent">
          3.75&times;
        </span>
        <span className="mb-1 max-w-[12rem] text-[14px] leading-snug text-muted">more words in the same minute, without touching the keyboard</span>
      </div>
      <div ref={ref}>
        <div className="mb-5 flex items-center justify-between text-[12.5px] font-medium text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1">
            <Clock className="size-3.5" />
            <span className="tabular-nums">0:{String(secs).padStart(2, "0")}</span> / 1:00
          </span>
          <span>Words written</span>
        </div>
        <div className="space-y-6">
          <Lane icon={<Keyboard className="size-4" />} label="Keyboard" wpm={TYPE_WPM} p={p} />
          <Lane icon={<Mic className="size-4" />} label="Voice" wpm={SPEAK_WPM} p={p} fire />
        </div>
      </div>
    </Tile>
  );
}

// ---- time back ----

/** A number that eases to its new value. */
function useEased(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reducedMotion()) {
      from.current = target;
      const id = requestAnimationFrame(() => setV(target));
      return () => cancelAnimationFrame(id);
    }
    const a = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 450);
      const e = 1 - Math.pow(1 - k, 3);
      const x = a + (target - a) * e;
      from.current = x;
      setV(x);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

const hoursSaved = (words: number) => (words * WORKDAYS * (1 / TYPE_WPM - 1 / SPEAK_WPM)) / 60;
const fmt = (h: number) => (h < 10 ? h.toFixed(1) : String(Math.round(h)));

function TimeBack() {
  const [words, setWords] = useState(2000);
  const target = hoursSaved(words);
  const shown = useEased(target);
  const pct = Math.round(((words - 200) / (10000 - 200)) * 10000) / 100;
  const days = (target * 12) / 8;
  return (
    <Tile>
      <style>{`
        .why-range { -webkit-appearance: none; appearance: none; background: transparent; height: 44px; width: 100%; cursor: pointer; }
        .why-range::-webkit-slider-runnable-track { height: 8px; border-radius: 999px; background: linear-gradient(90deg, #ff8a4c, #ff4d2e) 0 / var(--p) 100% no-repeat, var(--surface-3); }
        .why-range::-moz-range-track { height: 8px; border-radius: 999px; background: var(--surface-3); }
        .why-range::-moz-range-progress { height: 8px; border-radius: 999px; background: linear-gradient(90deg, #ff8a4c, #ff4d2e); }
        .why-range::-webkit-slider-thumb { -webkit-appearance: none; margin-top: -8px; width: 24px; height: 24px; border-radius: 999px; background: #fff; border: 1px solid var(--line-strong); box-shadow: 0 4px 12px -4px rgba(17,19,24,.35), 0 0 0 4px var(--fire-soft); transition: transform .2s; }
        .why-range::-moz-range-thumb { width: 24px; height: 24px; border-radius: 999px; background: #fff; border: 1px solid var(--line-strong); box-shadow: 0 4px 12px -4px rgba(17,19,24,.35), 0 0 0 4px var(--fire-soft); }
        .why-range:active::-webkit-slider-thumb { transform: scale(1.12); }
        .why-range:focus-visible { outline: none; }
        .why-range:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--fire); outline-offset: 2px; }
      `}</style>
      <div className="grid h-full gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
        <div className="flex h-full flex-col">
          <TileHead icon={<Clock className="size-[18px]" />} title="Your time back">
            Move the slider to how much you write in a day.
          </TileHead>
          <div className="mt-auto pt-5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="why-words" className="text-[13.5px] font-medium text-ink-2">
                Words you write a day
              </label>
              <output htmlFor="why-words" className="text-[15px] font-semibold text-ink tabular-nums">
                {words.toLocaleString("en-US")}
              </output>
            </div>
            <input
              id="why-words"
              type="range"
              min={200}
              max={10000}
              step={100}
              value={words}
              onChange={(e) => setWords(Number(e.target.value))}
              aria-valuetext={`${words.toLocaleString("en-US")} words a day`}
              className="why-range"
              style={{ "--p": `${pct}%` } as CSSProperties}
            />
          </div>
        </div>
        <div className="rounded-[18px] border border-line bg-surface-2 p-5" aria-live="polite">
          <p className="text-[13px] font-medium text-muted">Time saved</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-[52px] leading-none font-bold tracking-[-0.045em] text-ink tabular-nums">&asymp;&thinsp;{fmt(shown)}</span>
          </p>
          <p className="mt-1.5 text-[15px] font-semibold text-ink-2">hours saved a month</p>
          <p className="mt-3 text-[13px] text-muted">That is about {Math.round(days)} working days a year.</p>
          <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-faint">
            words a day &times; {WORKDAYS} workdays &times; (1/{TYPE_WPM} &minus; 1/{SPEAK_WPM}) minutes a word
          </p>
        </div>
      </div>
    </Tile>
  );
}

// ---- privacy ----

function Private() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const play = { animationPlayState: inView ? "running" : "paused" } as CSSProperties;
  return (
    <Tile>
      <style>{`
        @keyframes why-ring { 0% { transform: scale(.6); opacity: .7; } 100% { transform: scale(1.5); opacity: 0; } }
        .why-ring { animation: why-ring 2.8s cubic-bezier(.25,1,.5,1) infinite; }
        @media (prefers-reduced-motion: reduce) { .why-ring { animation: none; opacity: .25; } }
      `}</style>
      <div ref={ref} className="relative mx-auto grid h-[112px] w-full place-items-center" aria-hidden>
        <span className="why-ring absolute size-24 rounded-full border border-ok/40" style={play} />
        <span className="why-ring absolute size-24 rounded-full border border-ok/40 [animation-delay:-1.4s]" style={play} />
        <span className="absolute size-[84px] rounded-full bg-ok-soft" />
        <span className="relative grid size-14 place-items-center rounded-2xl border border-line bg-surface text-ok shadow-md">
          <Lock className="size-6" />
        </span>
        <span className="absolute right-2 bottom-1 inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[10.5px] font-semibold text-ink-2 shadow-sm">
          <Laptop className="size-3" />
          This computer
        </span>
      </div>
      <p className="mt-4 text-[34px] leading-none font-bold tracking-[-0.04em] text-ink">0 bytes</p>
      <h3 className="mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-ink">of your voice uploaded</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">Speech turns into text on your own computer. It works offline, too.</p>
    </Tile>
  );
}

// ---- every app ----

const APPS = ["Slack", "Gmail", "Word", "Notion", "VS Code", "Docs", "Teams", "Discord", "Excel"];

function EveryApp() {
  const [ref, inView] = useInView<HTMLDivElement>("0px");
  const [lit, setLit] = useState(APPS.length);
  useEffect(() => {
    if (!inView || reducedMotion()) return;
    let k = 0;
    const id = window.setInterval(() => {
      k = (k + 1) % (APPS.length + 4); // all lit, a short rest, then again
      setLit(Math.min(k, APPS.length));
    }, 420);
    return () => window.clearInterval(id);
  }, [inView]);
  return (
    <Tile>
      <div ref={ref} className="grid grid-cols-3 gap-1.5" aria-hidden>
        {APPS.map((a, i) => {
          const on = i < lit;
          return (
            <span key={a} className="relative flex h-9 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-surface-2 px-2 text-[11.5px] font-semibold text-ink-2">
              <span className="absolute inset-0 rounded-[10px] bg-fire-soft ring-1 ring-fire/25 ring-inset transition-opacity duration-300" style={{ opacity: on ? 1 : 0 }} />
              <span className="relative">{a}</span>
              <span
                className="absolute top-0.5 right-0.5 grid size-2.5 place-items-center rounded-full bg-ok text-white transition-[opacity,transform] duration-300"
                style={{ opacity: on ? 1 : 0, transform: on ? "none" : "scale(.4)" }}
              >
                <Check className="size-[7px]" strokeWidth={4} />
              </span>
            </span>
          );
        })}
      </div>
      <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-ink">Every app</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">If it has a text box, FireVoice can write in it. Email, chat, documents, code.</p>
    </Tile>
  );
}

export function Why() {
  return (
    <section id="why" aria-labelledby="why-title" className="section">
      <div className="container-x">
        <Reveal>
          <Heading
            eyebrow="Why speak"
            icon={<Zap className="size-3.5 text-fire-ink" />}
            lede="You already know what you want to say. FireVoice keeps up with you, tidies it as you go, and puts it wherever you are writing."
          >
            <span id="why-title">
              Write at the speed <em>you think.</em>
            </span>
          </Heading>
        </Reveal>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
          <Reveal className="sm:col-span-2 lg:row-span-2">
            <Race />
          </Reveal>
          <Reveal delay={90} className="sm:col-span-2">
            <TimeBack />
          </Reveal>
          <Reveal delay={180}>
            <Private />
          </Reveal>
          <Reveal delay={270}>
            <EveryApp />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
