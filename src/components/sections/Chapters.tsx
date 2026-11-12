"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Languages, MessagesSquare, Mic, Music, ScrollText, Sparkles, Wand2 } from "@/components/icons";
import { SectionHeader } from "../ui";
import {
  CloneVisual,
  DesignVisual,
  DialogueVisual,
  DictateVisual,
  DubVisual,
  SoundVisual,
  SpeakVisual,
  TranscribeVisual,
} from "./chapterVisuals";

const chapters = [
  {
    id: "speak",
    icon: AudioLines,
    label: "Speak",
    title: "Type it. Hear it performed.",
    text: "Pick a voice and a delivery, from calm to movie trailer, and FireVoice reads your script like a person would. Pauses, laughs and whispers go right in the text.",
    Visual: SpeakVisual,
  },
  {
    id: "clone",
    icon: Wand2,
    label: "Clone",
    title: "Copy a voice from a short clip.",
    text: "A few clean seconds are enough. FireVoice cleans the recording, asks for consent, and the voice is ready to read anything you write.",
    Visual: CloneVisual,
  },
  {
    id: "design",
    icon: Sparkles,
    label: "Design",
    title: "Describe a voice that doesn't exist yet.",
    text: "Write who you hear in your head. FireVoice offers a few takes; keep the one you love and it joins your library.",
    Visual: DesignVisual,
  },
  {
    id: "dictate",
    icon: Mic,
    label: "Dictate",
    title: "Speak in any program. It types.",
    text: "Say “Hey FireVoice”, or hold Ctrl + Alt + Space, and say what you mean. The words appear wherever your cursor is: mail, chat, documents, code.",
    Visual: DictateVisual,
  },
  {
    id: "dialogue",
    icon: MessagesSquare,
    label: "Dialogue",
    title: "Write a scene. Cast it.",
    text: "Write a conversation and give every speaker their own voice. FireVoice performs the whole scene in one go.",
    Visual: DialogueVisual,
  },
  {
    id: "dubbing",
    icon: Languages,
    label: "Dub",
    title: "Your video, in another language.",
    text: "Turn a video or recording into another language while the music and effects stay underneath.",
    Visual: DubVisual,
  },
  {
    id: "transcribe",
    icon: ScrollText,
    label: "Transcribe",
    title: "Every word, and who said it.",
    text: "Recordings become text with speaker labels and word timings, ready as subtitles.",
    Visual: TranscribeVisual,
  },
  {
    id: "sound",
    icon: Music,
    label: "Sound",
    title: "Effects and music from a sentence.",
    text: "Describe a sound and FireVoice makes it: a footstep, a rainy street, a quiet piano bed under your narration.",
    Visual: SoundVisual,
  },
];

function Stage({ active }: { active: number }) {
  return (
    <div className="stage relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0f] shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_0%,rgba(255,98,41,0.28),transparent_60%),radial-gradient(60%_50%_at_0%_100%,rgba(255,46,99,0.12),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center,#000 30%,transparent 75%)",
        }}
      />
      {chapters.map(({ id, Visual }, i) => (
        <div
          key={id}
          aria-hidden={i !== active}
          className={`absolute inset-0 flex items-center p-6 transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(.25,1,.5,1)] sm:p-10 ${
            i === active ? "opacity-100" : "pointer-events-none translate-y-6 opacity-0 blur-sm"
          }`}
        >
          <div className="w-full">
            <Visual />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Chapters() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="chapters" className="relative bg-bg py-28 sm:py-36">
      <div className="container-x">
        <SectionHeader
          eyebrow="One app, every voice job"
          title={
            <>
              A whole voice studio. <span className="accent">On your desk.</span>
            </>
          }
        />

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 [&>*]:min-w-0">
          <div>
            {chapters.map(({ id, icon: Icon, label, title, text, Visual }, i) => (
              <div
                key={id}
                id={id}
                data-idx={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="flex min-h-0 flex-col justify-center py-10 lg:min-h-[72vh] lg:py-0"
              >
                <div
                  className={`transition-opacity duration-500 ${i === active ? "lg:opacity-100" : "lg:opacity-80"}`}
                >
                  <p className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-fire-ink">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-px w-6 bg-current opacity-50" />
                    <Icon className="size-4" /> {label}
                  </p>
                  <h3 className="mt-5 text-balance text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-ink">
                    {title}
                  </h3>
                  <p className="mt-5 max-w-md text-pretty text-[17px] leading-relaxed text-muted">{text}</p>
                </div>
                {/* on small screens each chapter carries its own visual */}
                <div className="stage relative mt-8 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0b0f] p-5 lg:hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_0%,rgba(255,98,41,0.25),transparent_60%)]" />
                  <div className="relative">
                    <Visual />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-[14vh] h-[72vh]">
              <Stage active={active} />
              <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-1.5">
                {chapters.map((c, i) => (
                  <span
                    key={c.id}
                    className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-fire" : "w-2 bg-line-strong"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
