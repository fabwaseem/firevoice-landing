"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui";
import { clips, currentTime, getServerSnapshot, getSnapshot, onFrame, play, subscribe, type Clip } from "@/lib/audio-engine";

/** The clip's real waveform; the played part lights up as it plays. */
function Wave({ clip, active }: { clip: Clip; active: boolean }) {
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = fill.current;
    if (!el) return;
    if (!active) {
      el.style.clipPath = "inset(0 100% 0 0)";
      return;
    }
    return onFrame(() => {
      const p = Math.min(1, currentTime() / clip.duration);
      el.style.clipPath = `inset(0 ${(100 - p * 100).toFixed(2)}% 0 0)`;
    });
  }, [active, clip]);
  const bars = (cls: string) => (
    <div className={`flex h-full items-center gap-[2px] ${cls}`}>
      {clip.peaks.map((v, i) => (
        <span key={i} className="w-full rounded-full bg-current" style={{ height: `${Math.max(8, Math.round(v * 100))}%` }} />
      ))}
    </div>
  );
  return (
    <div className="relative h-10 w-full">
      {bars("text-ink/15")}
      <div ref={fill} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
        {bars("text-fire")}
      </div>
    </div>
  );
}

function VoiceCard({ clip }: { clip: Clip }) {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const on = s.playing && s.clip?.slug === clip.slug;
  return (
    <button
      type="button"
      onClick={() => play(clip)}
      aria-pressed={on}
      aria-label={`${on ? "Pause" : "Play"} ${clip.name}, ${clip.role}: ${clip.text}`}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] border p-4 text-left transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1 ${
        on
          ? "border-fire/50 bg-surface shadow-[0_30px_80px_-30px_rgba(255,77,46,0.55)]"
          : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
        <Image
          src={`/avatars/${clip.voice}.webp`}
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 80vw"
          className={`object-cover transition-transform duration-700 ${on ? "scale-105" : "group-hover:scale-105"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent" />
        <span
          className={`absolute bottom-3 right-3 grid size-11 place-items-center rounded-full shadow-lg transition-all duration-300 ${
            on ? "bg-white text-[#0a0a0c]" : "bg-black/45 text-white backdrop-blur group-hover:bg-white group-hover:text-[#0a0a0c]"
          }`}
        >
          {on ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4 fill-current" />}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90 backdrop-blur">
          {clip.role}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold tracking-tight text-ink">{clip.name}</span>
          <span className="font-mono text-[11px] text-muted">0:{String(Math.round(clip.duration)).padStart(2, "0")}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[14px] leading-snug text-muted">&ldquo;{clip.text}&rdquo;</p>
        <div className="mt-auto pt-4">
          <Wave clip={clip} active={on} />
        </div>
      </div>
    </button>
  );
}

export function VoiceGallery() {
  return (
    <section id="voices" className="relative bg-bg py-28 sm:py-36">
      <div className="container-x">
        <SectionHeader
          eyebrow="Hear the range"
          title={
            <>
              Eight voices. <span className="accent">Zero</span> cloud.
            </>
          }
        >
          Every clip below was rendered by FireVoice on a desktop GPU, untouched. Press play. Then imagine your own
          script, in your own voice.
        </SectionHeader>
        <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
          {clips.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={(i % 4) * 0.06}>
              <VoiceCard clip={c} />
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-center text-[14px] text-muted">
          These are 8 of the 100 voices you get on day one. Copy any voice from a short clip, or describe a new one.
        </p>
      </div>
    </section>
  );
}
