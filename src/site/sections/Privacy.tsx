"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Heading } from "@/site/ui";
import { Reveal, useInView } from "@/site/motion";
import { ArrowRight, AudioWaveform, Cloud, CloudOff, Laptop, Mic, ShieldCheck, SlidersHorizontal, Sparkles, Type, WifiOff, X, type Icon } from "@/components/icons";

// Privacy: a full section. On the left, a drawing of what happens when you dictate: everything travels inside a frame
// marked "Your computer" (dots run along the connectors while it is on screen) and the cloud above it is crossed out.
// On the right, the plain facts, honest about the one thing that can be shared: optional usage statistics.

const STEPS: { icon: Icon; title: string; note: string }[] = [
  { icon: Mic, title: "Microphone", note: "you speak" },
  { icon: AudioWaveform, title: "Speech engine", note: "hears the words" },
  { icon: Sparkles, title: "Clean-up", note: "drops the ums, adds punctuation" },
  { icon: Type, title: "Your app", note: "text where the cursor is" },
];

const FACTS: { icon: Icon; title: string; text: ReactNode }[] = [
  { icon: Laptop, title: "Runs on your computer", text: "Speech, clean-up and voices all happen locally, on your own machine." },
  { icon: WifiOff, title: "Works offline", text: "Pull the cable and keep dictating. Nothing waits on a server." },
  { icon: CloudOff, title: "No audio, text or files uploaded", text: "What you say, what it writes and the files you open stay with you." },
  {
    icon: SlidersHorizontal,
    title: "You choose what’s shared",
    text: "Anonymous usage statistics are optional: FireVoice asks once, and you can turn them off in Settings. Never your words.",
  },
];

/** A connector between two steps: a hairline with a dot that travels along it while `on`. Horizontal from sm up,
 * vertical on phones. */
function Connector({ on, delay }: { on: boolean; delay: number }) {
  const play = { animationPlayState: on ? "running" : "paused", animationDelay: `${delay}ms` } as const;
  return (
    <div className="relative flex h-7 w-full justify-center sm:mt-6 sm:h-px sm:w-auto sm:min-w-6 sm:flex-1" aria-hidden>
      {/* phones: vertical */}
      <div className="relative h-full w-px overflow-hidden bg-line-strong sm:hidden">
        <span className="fv-dot-y absolute inset-0 motion-reduce:hidden" style={play}>
          <span className="absolute bottom-0 left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-fire shadow-[0_0_8px_2px_rgba(255,90,45,.45)]" />
        </span>
      </div>
      {/* wider: horizontal */}
      <div className="relative hidden h-px w-full overflow-hidden bg-line-strong sm:block">
        <span className="fv-dot-x absolute inset-0 motion-reduce:hidden" style={play}>
          <span className="absolute top-1/2 right-0 size-[6px] -translate-y-1/2 rounded-full bg-fire shadow-[0_0_8px_2px_rgba(255,90,45,.45)]" />
        </span>
      </div>
    </div>
  );
}

function Diagram() {
  const [ref, on] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="card-raised relative flex h-full flex-col justify-center overflow-hidden p-4 sm:p-6" role="img" aria-label="Diagram: inside your computer, the microphone feeds the speech engine, then the clean-up, then your app. Nothing goes to the cloud.">
      <div className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-fire/10 blur-3xl" aria-hidden />
      <div aria-hidden className="relative">
        {/* the cloud, crossed out */}
        <div className="flex flex-col items-end pr-2 sm:pr-10">
          <div className="flex items-center gap-2.5 opacity-60">
            <span className="text-right">
              <span className="block text-[13px] font-semibold text-muted">Cloud</span>
              <span className="block text-[11.5px] text-faint">servers, someone else’s computer</span>
            </span>
            <span className="grid size-12 place-items-center rounded-[14px] border border-dashed border-line-strong bg-surface-2 text-faint">
              <Cloud className="size-6" />
            </span>
          </div>
          <div className="relative mr-[22px] flex h-14 w-px flex-col items-center">
            <span className="h-full w-px border-l border-dashed border-line-strong" />
            <span className="absolute top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full border border-fire/30 bg-surface text-fire shadow-[var(--shadow-sm)]">
              <X className="size-3.5" />
            </span>
            <span className="absolute top-1/2 right-5 -translate-y-1/2 rounded-full bg-fire-soft px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-fire-ink">Nothing goes here</span>
          </div>
        </div>

        {/* your computer */}
        <div className="rounded-[18px] border border-line-strong bg-surface-2 shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-surface-3" />
              <span className="size-2.5 rounded-full bg-surface-3" />
              <span className="size-2.5 rounded-full bg-surface-3" />
            </span>
            <span className="ml-1 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <Laptop className="size-4 text-fire" />
              Your computer
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-semibold text-ok">
              <span className="size-1.5 rounded-full bg-ok" />
              Works offline
            </span>
          </div>

          <div className="flex flex-col items-center px-4 py-6 sm:flex-row sm:items-start sm:px-5 sm:py-8">
            {STEPS.map((s, i) => (
              <div key={s.title} className="contents">
                {i > 0 && <Connector on={on} delay={(i - 1) * 450} />}
                <div className="flex w-full max-w-[220px] flex-row items-center gap-3 sm:w-[104px] sm:flex-col sm:gap-2 sm:text-center">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-[14px] border ${i === STEPS.length - 1 ? "fire-gradient border-transparent text-white shadow-[0_10px_22px_-10px_rgba(255,77,46,.8)]" : "border-line bg-surface text-fire shadow-[var(--shadow-sm)]"}`}
                  >
                    <s.icon className="size-[22px]" trigger="manual" active={on} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-ink">{s.title}</span>
                    <span className="block text-[11.5px] leading-snug text-muted">{s.note}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-4 mb-4 grid gap-2 rounded-[12px] border border-line bg-surface px-3.5 py-3 text-[12.5px] sm:mx-5 sm:mb-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <span className="text-muted italic">“um so the deck is uh late”</span>
            <ArrowRight className="hidden size-4 text-faint sm:block" />
            <span className="font-medium text-ink">The deck is late.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <section id="privacy" className="section">
      <style>{`
        @keyframes fv-dot-x { 0% { transform: translateX(-100%); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(0); opacity: 0; } }
        @keyframes fv-dot-y { 0% { transform: translateY(-100%); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(0); opacity: 0; } }
        .fv-dot-x { transform: translateX(-100%); animation: fv-dot-x 1.8s cubic-bezier(.45,0,.55,1) infinite both; }
        .fv-dot-y { transform: translateY(-100%); animation: fv-dot-y 1.8s cubic-bezier(.45,0,.55,1) infinite both; }
      `}</style>
      <div className="container-x">
        <Heading eyebrow="Privacy" icon={<ShieldCheck className="size-3.5 text-fire" />} lede="FireVoice listens, writes and speaks on your own computer. What you say and what it writes never pass through a server, so there is nothing to upload and nothing to wait for.">
          Your voice <em>never leaves</em> your computer.
        </Heading>

        <div className="mt-14 grid items-start gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch lg:gap-8">
          <Reveal className="h-full">
            <Diagram />
          </Reveal>

          <div>
            <ul className="space-y-3">
              {FACTS.map((f, i) => (
                <Reveal key={f.title} as="li" delay={i * 90}>
                  <div className="card ki-trigger flex items-start gap-3.5 p-4 sm:p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-fire-soft text-fire">
                      <f.icon className="size-5" variant="duotone" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[15.5px] leading-tight font-semibold text-ink">{f.title}</h3>
                      <p className="mt-1 text-[14px] leading-snug text-muted">{f.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={400}>
              <Link href="/privacy" className="ki-trigger mt-5 inline-flex min-h-11 items-center gap-1.5 px-1 text-[15px] font-semibold text-fire-ink underline-offset-4 hover:underline">
                Read the privacy policy <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
