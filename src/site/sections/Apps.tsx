"use client";

import type { CSSProperties } from "react";
import { useInView } from "@/site/motion";

// A dark sheet over the hero: the programs FireVoice types into, drifting past as quiet text wordmarks (no logos).

type Mark = { name: string; style: CSSProperties; prefix?: string };

const serif = "var(--font-serif)";
const sans = "var(--font-sans)";
const mono = "var(--font-mono)";

const ROW_A: Mark[] = [
  { name: "Slack", style: { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.04em", textTransform: "lowercase" } },
  { name: "Gmail", style: { fontFamily: sans, fontWeight: 500, letterSpacing: "-0.02em" } },
  { name: "Outlook", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "-0.01em" } },
  { name: "Word", style: { fontFamily: serif, fontSize: "1.18em" } },
  { name: "Google Docs", style: { fontFamily: sans, fontWeight: 400, letterSpacing: "-0.02em" } },
  { name: "Notion", style: { fontFamily: serif, fontSize: "1.18em", fontStyle: "italic" } },
  { name: "VS Code", style: { fontFamily: mono, fontWeight: 500, fontSize: "0.86em", letterSpacing: "-0.02em" } },
  { name: "Cursor", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.78em" } },
  { name: "ChatGPT", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "-0.03em" } },
];
const ROW_B: Mark[] = [
  { name: "Claude", style: { fontFamily: serif, fontSize: "1.18em" } },
  { name: "Discord", style: { fontFamily: sans, fontWeight: 800, letterSpacing: "-0.03em" } },
  { name: "WhatsApp", style: { fontFamily: sans, fontWeight: 600, letterSpacing: "-0.02em" } },
  { name: "Teams", style: { fontFamily: sans, fontWeight: 500, letterSpacing: "0.01em" } },
  { name: "Obsidian", style: { fontFamily: serif, fontSize: "1.18em", fontStyle: "italic" } },
  { name: "Excel", style: { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.01em" } },
  { name: "Figma", style: { fontFamily: sans, fontWeight: 500, letterSpacing: "-0.03em" } },
  { name: "Terminal", prefix: ">_", style: { fontFamily: mono, fontWeight: 500, fontSize: "0.86em" } },
];
const ALL = [...ROW_A, ...ROW_B];

function Wordmark({ m }: { m: Mark }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 px-6 whitespace-nowrap text-ink-2/75 transition-colors duration-300 hover:text-ink sm:px-9" style={m.style}>
      {m.prefix && <span className="text-fire-ink">{m.prefix}</span>}
      {m.name}
    </span>
  );
}

/** One endless row: the list twice, sliding by half its width; paused on hover and while off screen. */
function Row({ marks, reverse = false, running, duration }: { marks: Mark[]; reverse?: boolean; running: boolean; duration: number }) {
  return (
    <div className="group mask-fade-x flex overflow-hidden py-2">
      <div
        className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal", animationPlayState: running ? undefined : "paused" }}
      >
        {[0, 1].map((copy) =>
          marks.map((m) => <Wordmark key={`${copy}-${m.name}`} m={m} />),
        )}
      </div>
    </div>
  );
}

export function Apps() {
  const [ref, inView] = useInView<HTMLElement>("40px");
  return (
    <section
      ref={ref}
      id="apps"
      aria-labelledby="apps-title"
      className="on-dark relative z-[2] -mt-[var(--sheet-r)] rounded-t-[var(--sheet-r)] bg-ember pt-12 pb-[calc(var(--sheet-r)+36px)] sm:pt-14"
    >
      <h2 id="apps-title" className="eyebrow text-center">
        Works wherever you type
      </h2>
      <ul className="sr-only">
        {ALL.map((m) => (
          <li key={m.name}>{m.name}</li>
        ))}
      </ul>

      {/* moving rows; with reduced motion a still, wrapped list instead */}
      <div className="mt-7 text-[22px] motion-reduce:hidden sm:text-[30px]" aria-hidden>
        <Row marks={ROW_A} running={inView} duration={46} />
        <Row marks={ROW_B} running={inView} duration={52} reverse />
      </div>
      <div className="container-x mt-7 hidden flex-wrap justify-center gap-y-3 text-[20px] motion-reduce:flex sm:text-[26px]" aria-hidden>
        {ALL.map((m) => (
          <Wordmark key={m.name} m={m} />
        ))}
      </div>
    </section>
  );
}
