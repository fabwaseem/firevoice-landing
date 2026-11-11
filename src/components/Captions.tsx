"use client";

import { useEffect, useRef } from "react";
import { currentTime, onFrame, type Clip } from "@/lib/audio-engine";

/** The playing clip's words, lighting up in time with the voice (timings come from FireVoice's own transcription). */
export function Captions({ clip, playing, className = "" }: { clip: Clip; playing: boolean; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    if (!playing) {
      spans.forEach((s) => s.removeAttribute("data-on"));
      return;
    }
    return onFrame(() => {
      const t = currentTime();
      for (let i = 0; i < spans.length; i++) {
        const w = clip.words[i];
        if (t >= w.s - 0.04) spans[i].setAttribute("data-on", "");
        else spans[i].removeAttribute("data-on");
      }
    });
  }, [clip, playing]);
  return (
    <p ref={ref} className={className} aria-live="polite">
      {clip.words.map((w, i) => (
        <span
          key={i}
          data-w
          className="inline-block translate-y-[0.15em] opacity-15 blur-[2px] transition-[opacity,transform,filter] duration-300 ease-out data-[on]:translate-y-0 data-[on]:opacity-100 data-[on]:blur-0"
        >
          {w.w}&nbsp;
        </span>
      ))}
    </p>
  );
}
