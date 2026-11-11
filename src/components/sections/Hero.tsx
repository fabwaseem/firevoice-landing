"use client";

import { useSyncExternalStore, useState } from "react";
import { ArrowRight, Mic, MicOff, ShieldCheck } from "lucide-react";
import HeroVisual from "../three/HeroVisual";
import { WindowsIcon } from "../ui";
import { site } from "@/lib/site";
import { getSource, startMic, stopMic, subscribeSource } from "@/lib/voice-level";

function MicToggle() {
  const source = useSyncExternalStore(subscribeSource, getSource, () => "idle");
  const [denied, setDenied] = useState(false);
  const on = source === "mic";
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={async () => {
          if (on) return stopMic();
          setDenied(!(await startMic()));
        }}
        aria-pressed={on}
        className={`group relative inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium backdrop-blur transition-colors ${
          on ? "border-fire/50 bg-fire-soft text-fire-ink" : "border-line-strong bg-surface/70 text-ink-2 hover:text-ink"
        }`}
      >
        <span className="relative grid size-5 place-items-center">
          {on && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-fire/40" />}
          {on ? <MicOff className="relative size-4" /> : <Mic className="relative size-4" />}
        </span>
        {on ? "Stop listening" : "Talk to the orb"}
      </button>
      <p className="text-[12px] text-faint" role="status">
        {denied ? "Microphone not available. The orb keeps its own rhythm." : "Your mic stays in this tab. Nothing is recorded."}
      </p>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      {/* backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-bg absolute inset-0 opacity-70" />
        <div className="absolute left-1/2 top-[-10%] h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] blur-2xl" />
      </div>

      <div className="container-x grid items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-4 [&>*]:min-w-0">
        <div className="relative z-10 text-center lg:text-left">
          <a
            style={{ "--i": 0 } as React.CSSProperties}
            href="#dictation"
            className="enter inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 py-1 pl-1 pr-3 text-[13px] text-ink-2 backdrop-blur transition-colors hover:text-ink"
          >
            <span className="rounded-full fire-gradient px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
            Dictation: speak in any program
            <ArrowRight className="size-3.5" />
          </a>

          <h1 style={{ "--i": 1 } as React.CSSProperties} className="enter h-display mt-6 text-balance">
            Natural voices, made on <span className="accent">your own</span> computer.
          </h1>

          <p style={{ "--i": 2 } as React.CSSProperties} className="enter mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-muted sm:text-lg lg:mx-0"
          >
            FireVoice turns text into expressive speech, types what you say in any program, and copies a voice from a
            short clip. It all runs on your GPU, so nothing you write or say is uploaded.
          </p>

          <div style={{ "--i": 3 } as React.CSSProperties} className="enter mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a href={site.download} className="btn-fire !h-12 w-full !px-6 !text-base sm:w-auto">
              <WindowsIcon className="size-4" /> Download for Windows
            </a>
            <a href="#features" className="btn-ghost !h-12 w-full !px-6 !text-base sm:w-auto">
              See what it does
            </a>
          </div>

          <ul style={{ "--i": 4 } as React.CSSProperties} className="enter mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted lg:justify-start"
          >
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-ok" /> Nothing uploaded
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-fire" /> Runs on your GPU
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-fire" /> Ready in about a minute
            </li>
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[min(560px,92vw)] lg:-mr-6 lg:max-w-none">
          <HeroVisual />
          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <MicToggle />
          </div>
        </div>
      </div>
    </section>
  );
}
