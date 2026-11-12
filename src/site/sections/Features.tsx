"use client";

import { useEffect, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heading, Pill } from "@/site/ui";
import { Reveal, reducedMotion, useInView, useScene } from "@/site/motion";

// Features: the things that make dictation fit the way people talk. On a wide screen the list scrolls past a sticky
// card whose little demo follows the item in the middle of the screen; on phones (and with reduced motion) each item
// carries its own demo above its text.

/** Steps through 0..n-1 every `ms` while `running`; with reduced motion it rests on `rest`. */
function useCycle(n: number, ms: number, running: boolean, rest = n - 1) {
  const [i, setI] = useState(0);
  const [still, setStill] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStill(reducedMotion());
  }, []);
  useEffect(() => {
    if (!running || still) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % n), ms);
    return () => window.clearInterval(t);
  }, [running, still, n, ms]);
  return still ? rest : i;
}

const fade = (on: boolean, y = 8) => ({
  opacity: on ? 1 : 0,
  transform: on ? "none" : `translate3d(0, ${y}px, 0)`,
  transition: "opacity .5s cubic-bezier(.25,1,.5,1), transform .5s cubic-bezier(.25,1,.5,1)",
});

const chip = "inline-flex items-center rounded-full border border-line-strong bg-white/70 px-2.5 py-1 text-[11.5px] font-medium text-ink-2";

/* ---------- the little demos ---------- */

function WakeDemo({ running }: { running: boolean }) {
  const t = useCycle(4, 1300, running);
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="relative h-[54px] w-full max-w-[260px] text-center">
        <p className="absolute inset-x-0 top-0 font-serif text-[26px] leading-tight text-ink italic" style={fade(t >= 1)}>
          “Hey FireVoice,”
        </p>
        <p className="absolute inset-x-0 top-[34px] text-[13px] text-ink-2" style={fade(t >= 3, 6)}>
          reply to Sam that I’m in
        </p>
      </div>
      <div className="grid h-11 place-items-center">
        <Pill state={t >= 2 ? "listening" : "idle"} level={t === 3 ? 0.75 : 0.45} />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <span className={chip}>Works with your accent</span>
        <span className={chip}>
          <span className="mr-1.5 size-1.5 rounded-full bg-fire" />
          Teach it your voice
        </span>
      </div>
    </div>
  );
}

const TERMS = [
  { term: "Siobhan", heard: "Shivon" },
  { term: "Kubernetes", heard: "Cooper Netties" },
  { term: "FireVoice", heard: "Fire voice" },
];
function DictionaryDemo({ running }: { running: boolean }) {
  const t = useCycle(3, 1600, running, 0);
  return (
    <div className="w-full max-w-[290px] rounded-[18px] bg-white/90 p-3 shadow-[0_16px_36px_-22px_rgba(80,30,10,.5)]">
      <p className="px-2 pt-1 pb-2 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Dictionary</p>
      <ul className="space-y-1">
        {TERMS.map((x, i) => (
          <li key={x.term} className="relative rounded-[12px] px-2.5 py-2">
            <span className="absolute inset-0 rounded-[12px] bg-fire-soft transition-opacity duration-500" style={{ opacity: t === i ? 1 : 0 }} />
            <span className="relative flex items-center justify-between gap-2">
              <span className="text-[14px] font-semibold text-ink">{x.term}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-fire-ink">
                <path d="M11 5 6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            </span>
            <span className="relative mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
              also heard as <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium text-ink-2">{x.heard}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SnippetDemo({ running }: { running: boolean }) {
  const t = useCycle(3, 1700, running);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="font-serif text-[24px] text-ink italic">“my address”</p>
      <div className="relative h-[92px] w-full max-w-[260px]">
        <div className="absolute inset-0 rounded-[16px] border border-dashed border-line-strong" style={fade(t < 2, -6)} />
        <div className="absolute inset-0 rounded-[16px] bg-white/90 px-4 py-3 text-[13px] leading-[1.5] text-ink shadow-[0_16px_36px_-22px_rgba(80,30,10,.5)]" style={fade(t === 2)}>
          Flat 4, 12 Rosemary Lane
          <br />
          Manchester M1 4BT
          <br />
          United Kingdom
        </div>
      </div>
      <div className="grid h-9 place-items-center">
        <Pill size="sm" state={t === 0 ? "listening" : t === 1 ? "writing" : "done"} level={0.6} />
      </div>
    </div>
  );
}

const TONES = [
  { name: "Email", text: "Hi Sam,\nQuick update: the launch is moving to Monday.\nThanks, Alex" },
  { name: "Chat", text: "heads up, launch is moving to Monday" },
  { name: "Notes", text: "• Launch moved to Monday" },
];
function ToneDemo({ running }: { running: boolean }) {
  const auto = useCycle(3, 2400, running, 0);
  const [picked, setPicked] = useState<number | null>(null);
  const t = picked ?? auto;
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex gap-1.5 rounded-full bg-white/60 p-1" role="group" aria-label="Where it goes">
        {TONES.map((x, i) => (
          <button
            key={x.name}
            type="button"
            aria-pressed={t === i}
            onClick={() => setPicked(i)}
            className={`h-11 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300 ${t === i ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"}`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="relative h-[100px] w-full max-w-[270px]">
        {TONES.map((x, i) => (
          <p
            key={x.name}
            className="absolute inset-0 rounded-[16px] bg-white/90 px-4 py-3 text-[13px] leading-[1.5] whitespace-pre-line text-ink shadow-[0_16px_36px_-22px_rgba(80,30,10,.5)]"
            style={fade(t === i)}
            aria-hidden={t !== i}
          >
            {x.text}
          </p>
        ))}
      </div>
    </div>
  );
}

const LANGS = [
  { name: "English", lang: "en", text: "See you at the meeting tomorrow." },
  { name: "Español", lang: "es", text: "Nos vemos mañana en la reunión." },
  { name: "Deutsch", lang: "de", text: "Wir sehen uns morgen beim Meeting." },
  { name: "Français", lang: "fr", text: "On se voit demain à la réunion." },
  { name: "हिन्दी", lang: "hi", text: "कल मीटिंग में मिलते हैं।" },
  { name: "اردو", lang: "ur", text: "کل میٹنگ میں ملتے ہیں۔" },
];
function LanguageDemo({ running }: { running: boolean }) {
  const t = useCycle(LANGS.length, 1800, running, 0);
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex items-center gap-2.5">
        <Pill size="sm" state="listening" level={0.35 + (t % 3) * 0.2} />
        <span className="relative grid h-8 w-[92px] place-items-center overflow-hidden rounded-full border border-line-strong bg-white/80 text-[12.5px] font-semibold text-ink">
          {LANGS.map((x, i) => (
            <span key={x.lang} lang={x.lang} className="absolute" style={fade(t === i, 10)}>
              {x.name}
            </span>
          ))}
        </span>
      </div>
      <div className="relative h-[60px] w-full max-w-[290px]">
        {LANGS.map((x, i) => (
          <p
            key={x.lang}
            lang={x.lang}
            dir={x.lang === "ur" ? "rtl" : "ltr"}
            className="absolute inset-0 grid place-items-center rounded-[16px] bg-white/90 px-4 text-center text-[15px] text-ink shadow-[0_16px_36px_-22px_rgba(80,30,10,.5)]"
            style={fade(t === i)}
          >
            {x.text}
          </p>
        ))}
      </div>
    </div>
  );
}

function StatsDemo({ running }: { running: boolean }) {
  const t = useCycle(8, 450, running, 7);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="w-full max-w-[290px] rounded-[18px] bg-white/90 p-4 shadow-[0_16px_36px_-22px_rgba(80,30,10,.5)]">
      <div className="grid grid-cols-3 gap-2">
        {[
          ["4,812", "words this week"],
          ["1h 46m", "time saved"],
          ["148", "words a minute"],
        ].map(([v, l]) => (
          <div key={l}>
            <p className="font-serif text-[22px] leading-none text-ink">{v}</p>
            <p className="mt-1 text-[10.5px] leading-tight text-muted">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[11px] font-medium text-ink-2">7-day streak</p>
        <div className="mt-2 flex justify-between">
          {days.map((d, i) => (
            <span key={i} className="flex flex-col items-center gap-1">
              <span className="relative size-[22px] rounded-full bg-surface-3">
                <span className="absolute inset-0 rounded-full bg-fire transition-transform duration-300" style={{ transform: `scale(${i < t ? 1 : 0})` }} />
              </span>
              <span className="text-[10px] text-muted">{d}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- the list ---------- */

const ITEMS: { title: ReactNode; text: string; Demo: (p: { running: boolean }) => ReactNode }[] = [
  {
    title: "Just say “Hey FireVoice”",
    text: "No shortcut needed: say the words and start talking. It understands accents, and Teach it your voice learns how you say it. The listening stays on your computer.",
    Demo: WakeDemo,
  },
  {
    title: "It learns your words",
    text: "Add the names and terms you use. Dictation spells them right, and the voices pronounce them right too.",
    Demo: DictionaryDemo,
  },
  {
    title: "Snippets",
    text: "Say a short cue like “my address” and the whole thing goes in. Handy for sign-offs, links and replies you write every day.",
    Demo: SnippetDemo,
  },
  {
    title: "Writes for where it goes",
    text: "The same thought comes out as a tidy email, a quick chat message or a short note, to suit where you are writing.",
    Demo: ToneDemo,
  },
  {
    title: "Any language",
    text: "Speak in the language you think in. FireVoice hears which one it is and writes it down.",
    Demo: LanguageDemo,
  },
  {
    title: "Your progress, every day",
    text: "Home shows the words you dictated, the time you saved over typing, how fast you speak and your daily streak.",
    Demo: StatsDemo,
  },
];

/** The sand card the demos sit on, with a soft warm glow. */
function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[26px] border border-line bg-surface-2 ${className}`}>
      <div aria-hidden className="pointer-events-none absolute -right-20 -bottom-24 size-64 rounded-full bg-[#ffb48a] opacity-45 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -top-20 -left-16 size-48 rounded-full bg-[#ffe0bf] opacity-80 blur-3xl" />
      {children}
    </div>
  );
}

/** A phone (or reduced-motion) item's own demo, running only while on screen. */
function InlineDemo({ Demo }: { Demo: (p: { running: boolean }) => ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      <Stage className="grid h-[300px] place-items-center p-6">
        <Demo running={inView} />
      </Stage>
    </div>
  );
}

export function Features() {
  const [active, setActive] = useState(0);
  const [stickyRef, stickyInView] = useInView<HTMLDivElement>();

  const ref = useScene<HTMLElement>(({ el, mm }) => {
    mm.add("(min-width: 768px)", () => {
      const items = gsap.utils.toArray<HTMLElement>(".js-item", el);
      items.forEach((item, i) =>
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        }),
      );
    });
  }, []);

  return (
    <section ref={ref} id="features" className="relative py-28 md:py-40">
      <div className="container-x">
        <Reveal>
          <Heading eyebrow="Made for the way you talk">
            Built around <em>how you talk,</em> not how a keyboard works.
          </Heading>
        </Reveal>

        <div className="mt-16 md:mt-24 md:grid md:grid-cols-2 md:gap-14 lg:gap-24 md:motion-reduce:block">
          {/* the sticky card (wide screens with motion) */}
          <div className="hidden md:block md:motion-reduce:hidden">
            <div ref={stickyRef} className="sticky top-[calc(50vh-150px)] mx-auto h-[300px] w-full max-w-[360px]">
              <Stage className="h-full">
                {ITEMS.map(({ Demo }, i) => (
                  <div
                    key={i}
                    inert={active !== i}
                    aria-hidden={active !== i}
                    className="absolute inset-0 grid place-items-center p-6"
                    style={{
                      opacity: active === i ? 1 : 0,
                      transform: active === i ? "none" : "translate3d(0, 14px, 0) scale(.98)",
                      transition: "opacity .55s cubic-bezier(.25,1,.5,1), transform .55s cubic-bezier(.25,1,.5,1)",
                    }}
                  >
                    <Demo running={stickyInView && active === i} />
                  </div>
                ))}
              </Stage>
            </div>
          </div>

          <ul className="grid gap-16 md:block md:motion-reduce:grid md:motion-reduce:grid-cols-2 md:motion-reduce:gap-x-14 md:motion-reduce:gap-y-20">
            {ITEMS.map(({ title, text, Demo }, i) => (
              <li
                key={i}
                className={`js-item md:flex md:min-h-[56vh] md:flex-col md:justify-center md:transition-opacity md:duration-500 md:motion-reduce:min-h-0 md:motion-reduce:opacity-100 ${active === i ? "" : "md:opacity-30"}`}
              >
                <div className="mb-7 md:hidden md:motion-reduce:block">
                  <InlineDemo Demo={Demo} />
                </div>
                <h3 className="display display-sm">{title}</h3>
                <p className="mt-4 max-w-md text-[16.5px] leading-relaxed text-ink-2">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
