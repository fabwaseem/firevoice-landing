"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Heading, Pill, type PillState } from "@/site/ui";
import { Reveal, reducedMotion, useInView } from "@/site/motion";
import { Check, Laptop, Mail, MessageSquare, Mic, FileText, Sparkles, Wand2 } from "@/components/icons";

// How it works, as a big dark card in the app's dark theme: three tabs (speak, tidy, in) with progress bars that fill
// while each step plays on a wide stage; it moves on by itself while on screen, and stops moving on once a tab is
// chosen. Each step is a little scene driven by the time since the step began; the finished state is the default.

const STEPS = [
  {
    n: "01",
    tab: "Speak",
    title: "Speak",
    text: "Hold Ctrl + Win or say “Hey FireVoice”, then talk the way you would to a friend. Ums are fine.",
  },
  {
    n: "02",
    tab: "FireVoice tidies",
    title: "FireVoice tidies",
    text: "Filler words and repeats drop out; punctuation and capitals go in. All on your computer.",
  },
  {
    n: "03",
    tab: "It’s in",
    title: "It’s in",
    text: "The finished text lands where your cursor is, in any app, and the pill turns into a green tick.",
  },
];
const STEP_MS = 5200;
const FINAL = 1e7; // a time long after every scene has finished

/** What was said: `f` marks filler, `r` a repeat. */
const RAW: { w: string; f?: boolean; r?: boolean }[] = [
  { w: "um", f: true },
  { w: "so", f: true },
  { w: "the", r: true },
  { w: "the" },
  { w: "review" },
  { w: "moves" },
  { w: "to" },
  { w: "next" },
  { w: "week" },
  { w: "uh", f: true },
  { w: "can" },
  { w: "you" },
  { w: "tell" },
  { w: "Priya" },
];
/** For each marked word, its order among the marked ones (for staggering). */
const MARK_ORDER = RAW.map((r, i) => (r.f || r.r ? RAW.slice(0, i).filter((x) => x.f || x.r).length : -1));
const CLEAN = "The review moves to next week. Can you tell Priya?";

/** Rounded to 3 places, so style strings are the same on the server and in the browser. */
const r3 = (x: number) => Math.round(x * 1000) / 1000;

const voice = (ms: number) => {
  const s = ms / 1000;
  const phrase = 0.55 + 0.45 * Math.sin(s * 1.6);
  const syl = Math.abs(Math.sin(s * 7.3)) * 0.6 + Math.abs(Math.sin(s * 11.1 + 1)) * 0.4;
  return Math.max(0.1, Math.min(1, 0.2 + 0.8 * phrase * syl));
};

function Panel({ label, children, className = "", right }: { label: ReactNode; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <div className={`rounded-[18px] border border-line bg-surface p-4 shadow-md sm:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2 text-[11.5px] font-semibold tracking-wide text-muted uppercase">
        <span className="inline-flex items-center gap-1.5">{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

// ---- 01 speak ----

function SpeakScene({ t }: { t: number }) {
  const pressed = t >= 300 && t < 1300;
  const said = t >= 900;
  const listening = t >= 1100;
  const words = Math.max(0, Math.min(RAW.length, Math.floor((t - 1300) / 230) + 1));
  const level = listening && t < FINAL ? r3(voice(t)) : 0.65; // 0.65: the pill draws its bars at their plain heights
  const bars = 36;
  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-1 lg:items-center lg:gap-6 lg:p-8">
      <Panel label="Start dictating">
        <div className="mt-3 flex flex-wrap items-center gap-3 lg:mt-5 lg:flex-col lg:items-start lg:gap-4">
          <div className="flex items-center gap-1.5">
            {["Ctrl", "Win"].map((k, i) => (
              <span key={k} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-faint">+</span>}
                <span
                  className="kbd relative h-9 min-w-12 px-2.5 text-[13px] transition-transform duration-150 lg:h-12 lg:min-w-16 lg:rounded-lg lg:text-[16px]"
                  style={{ transform: pressed ? "translateY(2px)" : "none" }}
                >
                  <span className="absolute -inset-px rounded-md ring-2 ring-fire transition-opacity duration-150" style={{ opacity: pressed ? 1 : 0 }} />
                  {k}
                </span>
              </span>
            ))}
          </div>
          <span className="text-[12.5px] font-medium text-faint">or say</span>
          <span
            className="relative inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-fire-soft px-3.5 py-2 text-[14.5px] font-semibold lg:px-4 lg:py-2.5 lg:text-[17px] text-fire-ink transition-[opacity,transform] duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
            style={{ opacity: said ? 1 : 0.25, transform: said ? "none" : "scale(.9)" }}
          >
            <Mic className="size-4" />
            &ldquo;Hey FireVoice&rdquo;
          </span>
        </div>
      </Panel>

      <div className="relative flex flex-col items-center justify-center gap-3 py-1 lg:gap-6">
        <div className="flex h-10 items-center gap-[3px] lg:h-28 lg:gap-1" aria-hidden>
          {Array.from({ length: bars }, (_, i) => {
            const env = Math.sin((i / (bars - 1)) * Math.PI);
            // at rest (server render, reduced motion) a fixed shape from the index, so both renders agree
            const wob = t >= FINAL ? 0.5 + 0.5 * Math.sin(i * 1.7) : 0.5 + 0.5 * Math.sin(t / 140 + i * 0.9) * Math.cos(t / 330 + i * 0.4);
            const h = r3(listening ? Math.max(0.08, env * (0.25 + 0.75 * wob) * (0.4 + level)) : 0.08);
            return (
              <span
                key={i}
                className="h-full w-[3px] origin-center rounded-full lg:w-1"
                style={{ transform: `scaleY(${Math.min(1, h)})`, transition: "transform 120ms ease", background: i % 3 === 0 ? "var(--fire-2)" : "var(--fire)", opacity: r3(0.35 + env * 0.65) }}
              />
            );
          })}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,107,61,.3),transparent)]" />
          <span className="relative hidden lg:block">
            <Pill state={listening ? "listening" : "idle"} level={level} size="lg" />
          </span>
          <span className="relative lg:hidden">
            <Pill state={listening ? "listening" : "idle"} level={level} />
          </span>
        </div>
      </div>

      <Panel
        label="What it hears"
        className="min-h-0"
        right={
          <span className="inline-flex items-center gap-1.5 normal-case">
            <span className="size-1.5 rounded-full bg-fire" style={{ opacity: listening ? 1 : 0.3 }} />
            {listening ? "Listening" : "Ready"}
          </span>
        }
      >
        <p className="mt-3 text-[15px] leading-[1.6] text-muted sm:text-[16.5px] lg:mt-4 lg:text-[20px]">
          {RAW.map((r, i) => (
            <span key={i} className="inline-block transition-[opacity,transform] duration-300" style={{ opacity: i < words ? (r.f ? 0.55 : 1) : 0, transform: i < words ? "none" : "translateY(4px)" }}>
              {r.w}&nbsp;
            </span>
          ))}
        </p>
      </Panel>
    </div>
  );
}

// ---- 02 tidy ----

const FIXES: { at: number; title: string; detail: string }[] = [
  { at: 1300, title: "Filler removed", detail: "um, so, uh" },
  { at: 1650, title: "Repeat fixed", detail: "the the → the" },
  { at: 2900, title: "Punctuation added", detail: "full stop, question mark" },
  { at: 3250, title: "Capitals added", detail: "The, Can" },
];

function Pop({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="absolute -inset-x-[3px] inset-y-0 rounded-[5px] bg-fire-soft transition-opacity duration-500" style={{ opacity: on ? 1 : 0 }} />
      <span className="relative inline-block transition-[opacity,transform] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "scale(0)" }}>
        {children}
      </span>
    </span>
  );
}

function TidyScene({ t }: { t: number }) {
  const swap = t >= 2300;
  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-3 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-6 lg:p-8">
      <Panel
        label={
          <>
            <Wand2 className="size-3.5" />
            Your words
          </>
        }
        className="flex flex-col"
        right={<Pill state={t < 3500 ? "writing" : "done"} size="sm" label="Tidying" className="normal-case" />}
      >
        <div className="relative mt-4 flex-1 text-[17px] leading-[1.65] sm:text-[21px] lg:text-[24px] lg:leading-[1.55]">
          {/* as said: the filler is marked, struck and dropped */}
          <p className="absolute inset-0 text-ink-2 transition-[opacity,transform] duration-500" style={{ opacity: swap ? 0 : 1, transform: swap ? "translateY(-8px)" : "none" }}>
            {RAW.map((r, i) => {
              if (!r.f && !r.r) return <span key={i}>{r.w} </span>;
              const k = MARK_ORDER[i];
              const hl = t >= 400 + k * 160;
              const st = t >= 1300 + k * 160;
              return (
                <span key={i}>
                  <span className="relative inline-block transition-opacity duration-300" style={{ opacity: st ? 0.45 : 1 }}>
                    <span className="absolute -inset-x-[3px] inset-y-[3px] rounded-[6px] bg-fire-soft transition-opacity duration-300" style={{ opacity: hl ? 1 : 0 }} />
                    <span className="relative text-fire-ink">{r.w}</span>
                    <span className="absolute inset-x-0 top-[54%] h-[2px] origin-left rounded-full bg-fire transition-transform duration-300" style={{ transform: `scaleX(${st ? 1 : 0})` }} />
                  </span>{" "}
                </span>
              );
            })}
          </p>
          {/* tidy: punctuation and capitals pop in */}
          <p className="absolute inset-0 font-medium text-ink transition-[opacity,transform] duration-500" style={{ opacity: swap ? 1 : 0, transform: swap ? "none" : "translateY(8px)" }}>
            <Pop on={t >= 2700}>T</Pop>he review moves to next week<Pop on={t >= 2900}>.</Pop> <Pop on={t >= 3050}>C</Pop>an you tell Priya<Pop on={t >= 3250}>?</Pop>
          </p>
        </div>
        <div className="mt-3 hidden flex-wrap items-center gap-2 border-t border-line pt-3 text-[12.5px] text-muted sm:flex">
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1">Said: {RAW.length} words</span>
          <span aria-hidden>&rarr;</span>
          <span className="rounded-full border border-line bg-ok-soft px-2.5 py-1 text-ok transition-opacity duration-500" style={{ opacity: swap ? 1 : 0.3 }}>
            Written: {CLEAN.split(" ").length} words
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <Laptop className="size-3.5" />
            On this computer
          </span>
        </div>
      </Panel>

      <Panel label="Fixes" right={<span className="normal-case">{FIXES.filter((f) => t >= f.at).length} of 4</span>}>
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 lg:grid-cols-1 lg:gap-y-2">
          {FIXES.map((f) => {
            const on = t >= f.at;
            return (
              <li key={f.title} className="flex items-center gap-2.5 rounded-xl py-1 transition-opacity duration-300 lg:border lg:border-line lg:bg-surface-2 lg:px-3 lg:py-2.5" style={{ opacity: on ? 1 : 0.35 }}>
                <span className="relative grid size-5 shrink-0 place-items-center rounded-full border border-line-strong">
                  <span className="absolute inset-[-1px] grid place-items-center rounded-full bg-ok text-[#0b0c10] transition-[opacity,transform] duration-300" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "scale(.4)" }}>
                    <Check className="size-3" strokeWidth={3.2} />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink lg:text-[14px]">{f.title}</span>
                  <span className="hidden text-[12.5px] text-muted lg:block">{f.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

// ---- 03 in ----

const TARGETS: { name: string; icon: ReactNode; at: number }[] = [
  { name: "Team chat · #design", icon: <MessageSquare className="size-3.5" />, at: 300 },
  { name: "Mail · Re: Review", icon: <Mail className="size-3.5" />, at: 1150 },
  { name: "Docs · Plan", icon: <FileText className="size-3.5" />, at: 2000 },
];
const CHAR = 17;

/** The rest of each little window, so it reads as that app (wide screens only). */
function Extras({ kind }: { kind: number }) {
  const bar = "h-2 rounded-full bg-surface-3";
  if (kind === 0)
    return (
      <div className="mt-auto hidden lg:block">
        <div className="flex items-center gap-2 rounded-xl border border-line-strong px-3 py-2 text-[12px] text-faint">
          Message #design
          <span className="ml-auto h-5 w-5 rounded-md bg-ok-soft" />
        </div>
      </div>
    );
  if (kind === 1)
    return (
      <div className="mt-auto hidden space-y-3 lg:block">
        <div className="space-y-1.5">
          <div className={`${bar} w-24`} />
          <div className={`${bar} w-16`} />
        </div>
        <span className="inline-block rounded-full bg-info px-3 py-1 text-[11.5px] font-semibold text-[#0b0c10]">Send</span>
      </div>
    );
  return (
    <div className="mt-auto hidden space-y-1.5 lg:block">
      <div className={`${bar} w-full`} />
      <div className={`${bar} w-[85%]`} />
      <div className={`${bar} w-[60%]`} />
    </div>
  );
}

function InScene({ t }: { t: number }) {
  const end = TARGETS[2].at + CLEAN.length * CHAR;
  const pill: PillState = t < TARGETS[0].at ? "listening" : t < end + 150 ? "writing" : "done";
  return (
    <div className="flex h-full flex-col gap-3 p-4 sm:p-6 lg:gap-6 lg:p-8">
      <div className="grid flex-1 gap-2.5 lg:grid-cols-3 lg:gap-5">
        {TARGETS.map((w, i) => {
          const n = Math.max(0, Math.min(CLEAN.length, Math.floor((t - w.at) / CHAR)));
          const done = n >= CLEAN.length;
          return (
            <div key={w.name} className="flex min-h-0 flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-md">
              <div className="flex h-8 shrink-0 items-center gap-2 border-b border-line bg-surface-2 px-3 text-[11.5px] font-semibold text-muted lg:h-9">
                <span className="flex gap-1">
                  <span className="size-2 rounded-full bg-[#ff5f57]" />
                  <span className="size-2 rounded-full bg-[#febc2e]" />
                  <span className="size-2 rounded-full bg-[#28c840]" />
                </span>
                <span className="ml-1 inline-flex min-w-0 items-center gap-1.5 truncate">
                  {w.icon}
                  {w.name}
                </span>
                <span
                  className="ml-auto inline-flex items-center gap-1 rounded-full bg-ok-soft px-1.5 py-0.5 text-[10.5px] text-ok transition-[opacity,transform] duration-300"
                  style={{ opacity: done ? 1 : 0, transform: done ? "none" : "scale(.8)" }}
                >
                  <Check className="size-3" strokeWidth={3} />
                  Inserted
                </span>
              </div>
              <div className="flex flex-1 flex-col px-3 py-2 text-[13px] leading-[1.55] text-ink-2 lg:px-4 lg:py-3.5 lg:text-[14.5px]">
                {i === 0 && <span className="mb-1 hidden text-[12px] text-muted lg:block">Lena: When is the review?</span>}
                {i === 1 && <span className="mb-1 hidden text-[12px] text-muted lg:block">Hi team,</span>}
                {i === 2 && <span className="mb-1 hidden text-[15px] font-bold text-ink lg:block">Next steps</span>}
                <span className="text-ink">
                  {CLEAN.slice(0, n)}
                  <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[0.15em] rounded-full bg-fire transition-opacity" style={{ opacity: n > 0 && !done ? 1 : 0 }} />
                  <span className="opacity-0">{CLEAN.slice(n)}</span>
                </span>
                <Extras kind={i} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative flex h-11 shrink-0 justify-center lg:h-14">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(61,208,143,.18),transparent)]" />
        <span className="relative lg:hidden">
          <Pill state={pill} level={0.5} />
        </span>
        <span className="relative hidden lg:block">
          <Pill state={pill} level={0.5} size="lg" />
        </span>
      </div>
    </div>
  );
}

const SCENES = [SpeakScene, TidyScene, InScene];

export function HowItWorks() {
  const [viewRef, inView] = useInView<HTMLDivElement>("0px");
  const [st, setSt] = useState({ step: 0, t: FINAL, paused: false });
  const started = useRef(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);

  // phones: keep the current tab in view in the scrolling row
  useEffect(() => {
    const l = list.current;
    const b = tabs.current[st.step];
    if (!l || !b || l.scrollWidth <= l.clientWidth) return;
    l.scrollTo({ left: b.offsetLeft - l.offsetLeft - 16, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [st.step]);

  useEffect(() => {
    if (!inView || reducedMotion()) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(100, now - last);
      last = now;
      const first = !started.current;
      started.current = true;
      setSt((s) => {
        if (first) return { ...s, t: 0 };
        const t = Math.min(FINAL, s.t + dt);
        if (!s.paused && t >= STEP_MS) return { step: (s.step + 1) % STEPS.length, t: 0, paused: false };
        return { ...s, t };
      });
    }, 40);
    return () => window.clearInterval(id);
  }, [inView]);

  const choose = (i: number, focus = false) => {
    started.current = true;
    setSt({ step: i, t: reducedMotion() ? FINAL : 0, paused: true });
    if (focus) tabs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    let i = -1;
    if (k === "ArrowRight") i = (st.step + 1) % STEPS.length;
    else if (k === "ArrowLeft") i = (st.step + STEPS.length - 1) % STEPS.length;
    else if (k === "Home") i = 0;
    else if (k === "End") i = STEPS.length - 1;
    if (i < 0) return;
    e.preventDefault();
    choose(i, true);
  };

  return (
    <section id="how" aria-labelledby="how-title" className="on-dark relative mx-3 overflow-hidden rounded-[32px] py-20 sm:mx-5 sm:py-28 lg:mx-6">
      {/* the app's dark glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-[8%] size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,107,61,.16),transparent)]" />
        <div className="absolute top-[30%] -right-40 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(154,140,255,.12),transparent)]" />
        <div className="absolute -bottom-48 left-[35%] size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(61,208,143,.08),transparent)]" />
      </div>

      <div className="container-x relative">
        <Reveal>
          <Heading eyebrow="How it works" icon={<Sparkles className="size-3.5 text-fire-ink" />} lede="Press a shortcut or say the words, talk, and finished writing appears in the app you are in. Here is one dictation, step by step.">
            <span id="how-title">
              Three steps. <em>No typing.</em>
            </span>
          </Heading>
        </Reveal>

        <Reveal className="mt-12 sm:mt-14">
          <div ref={viewRef}>
            <div
              ref={list}
              role="tablist"
              aria-label="Steps"
              onKeyDown={onKey}
              className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {STEPS.map((s, i) => {
                const on = i === st.step;
                const fill = on ? (st.paused || st.t >= FINAL ? 1 : Math.min(1, st.t / STEP_MS)) : i < st.step && !st.paused ? 1 : 0;
                return (
                  <button
                    key={s.n}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    id={`how-tab-${i}`}
                    role="tab"
                    type="button"
                    aria-selected={on}
                    aria-controls="how-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(i)}
                    className={`group relative min-w-[200px] flex-1 snap-start overflow-hidden rounded-[16px] border px-4 pt-3.5 pb-4 text-left transition-colors duration-300 sm:min-w-0 ${
                      on ? "border-line-strong bg-surface" : "border-line bg-surface/40 hover:bg-surface/70"
                    }`}
                  >
                    <span className="flex items-baseline gap-2.5">
                      <span className={`font-mono text-[12px] ${on ? "text-fire-ink" : "text-faint"}`}>{s.n}</span>
                      <span className={`text-[15.5px] font-semibold ${on ? "text-ink" : "text-muted group-hover:text-ink-2"}`}>{s.tab}</span>
                    </span>
                    <span className="absolute inset-x-4 bottom-2.5 h-[3px] overflow-hidden rounded-full bg-line-strong" aria-hidden>
                      <span className="block h-full origin-left rounded-full bg-fire" style={{ transform: `scaleX(${fill})`, opacity: on ? 1 : 0.45, transition: "transform 80ms linear" }} />
                    </span>
                  </button>
                );
              })}
            </div>

            <div id="how-panel" role="tabpanel" aria-labelledby={`how-tab-${st.step}`} className="mt-4">
              <p className="sr-only">{STEPS[st.step].text}</p>
              <div aria-hidden className="relative h-[420px] overflow-hidden rounded-[24px] border border-line bg-bg-elev sm:h-[460px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:22px_22px]" />
                {SCENES.map((Scene, i) => {
                  const on = i === st.step;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(.25,1,.5,1)]"
                      style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(12px) scale(.985)", pointerEvents: on ? undefined : "none" }}
                    >
                      <Scene t={on ? st.t : FINAL} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>

        <ol className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.n} className="transition-opacity duration-500" style={{ opacity: i === st.step ? 1 : 0.55 }}>
              <h3 className="flex items-baseline gap-2 text-[16px] font-semibold text-ink">
                <span className="font-mono text-[12px] text-fire-ink">{s.n}</span>
                {s.title}
              </h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
