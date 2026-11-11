"use client";

import { useRef, type ReactNode } from "react";
import { AudioLines, Languages, MessagesSquare, Music, ScrollText, Wand2 } from "lucide-react";
import { Reveal } from "../Reveal";
import { Bars, SectionHeader } from "../ui";

/** a card with a soft fire spotlight that follows the pointer */
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={`card group relative h-full overflow-hidden p-6 sm:p-7 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), var(--fire-soft), transparent 60%)" }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}

function Title({ icon: Icon, label, title, text }: { icon: typeof AudioLines; label: string; title: string; text: string }) {
  return (
    <>
      <div className="flex items-center gap-2 text-[13px] font-medium text-fire-ink">
        <Icon className="size-4" /> {label}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-[22px]">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
    </>
  );
}

function SpeakVisual() {
  const tags = ["[laugh]", "[pause 500ms]", "[whisper]"];
  return (
    <div className="mt-6 flex-1 rounded-2xl border border-line bg-surface-2/60 p-4">
      <p className="text-[15px] leading-relaxed text-ink-2">
        &ldquo;You did <em className="not-italic text-ink underline decoration-fire/60 underline-offset-4">what</em>?{" "}
        <span className="font-mono text-[12px] text-fire-ink">[laugh]</span> Okay. Tell me everything.&rdquo;
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-[11px] text-muted">
            {t}
          </span>
        ))}
      </div>
      <Bars n={56} seed={2.1} className="mt-5 h-10 text-fire" />
    </div>
  );
}

function DialogueVisual() {
  const lines = [
    { who: "Ava", c: "#ff7a45", text: "Did you hear that?" },
    { who: "Leo", c: "#6c8cff", text: "It's just the wind." },
    { who: "Ava", c: "#ff7a45", text: "The wind doesn't knock." },
  ];
  return (
    <ul className="mt-6 space-y-2">
      {lines.map((l, i) => (
        <li key={i} className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
          <span className="mt-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white" style={{ background: l.c }}>
            {l.who}
          </span>
          <span className="text-[14px] text-ink-2">{l.text}</span>
        </li>
      ))}
    </ul>
  );
}

function DubbingVisual() {
  return (
    <div className="mt-6 space-y-2">
      {[
        { lang: "EN", text: "Welcome back to the workshop.", w: "w-full" },
        { lang: "ES", text: "Bienvenidos de nuevo al taller.", w: "w-[92%]" },
        { lang: "DE", text: "Willkommen zurück in der Werkstatt.", w: "w-[86%]" },
      ].map((r, i) => (
        <div key={r.lang} className="flex items-center gap-3">
          <span className={`w-8 font-mono text-[11px] ${i ? "text-fire-ink" : "text-faint"}`}>{r.lang}</span>
          <div className={`${r.w} truncate rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[13px] text-ink-2`}>
            {r.text}
          </div>
        </div>
      ))}
      <p className="pt-1 text-[12px] text-faint">Music and effects kept under the new voices.</p>
    </div>
  );
}

function TranscribeVisual() {
  return (
    <div className="mt-6 space-y-2 font-mono text-[12px]">
      {[
        ["00:00:02", "Speaker 1", "So the plan is simple."],
        ["00:00:05", "Speaker 2", "Simple is good. Go on."],
      ].map(([t, s, x]) => (
        <div key={t} className="rounded-lg border border-line bg-surface-2/60 px-3 py-2">
          <span className="text-faint">{t}</span> <span className="text-fire-ink">{s}</span>
          <p className="mt-1 font-sans text-[13px] text-ink-2">{x}</p>
        </div>
      ))}
      <p className="pt-1 font-sans text-[12px] text-faint">Exports text, subtitles and word timings.</p>
    </div>
  );
}

function SoundVisual() {
  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-xl border border-line bg-surface-2/60 px-3 py-2.5 text-[13px] text-ink-2">
        <span className="text-faint">Describe it: </span>rain on a tin roof, distant thunder
      </div>
      <div className="flex gap-2">
        {["Sound effect", "Ambience", "Music bed"].map((t, i) => (
          <span
            key={t}
            className={`rounded-full px-2.5 py-1 text-[12px] ${i === 0 ? "bg-fire-soft text-fire-ink" : "border border-line text-muted"}`}
          >
            {t}
          </span>
        ))}
      </div>
      <Bars n={40} seed={5.3} className="h-8 text-fire/70" />
    </div>
  );
}

function VoiceVisual() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {["Pick", "Copy", "Describe"].map((t, i) => (
        <div key={t} className="rounded-xl border border-line bg-surface-2/60 p-3 text-center">
          <div
            className="mx-auto size-9 rounded-full"
            style={{
              background: ["linear-gradient(135deg,#ffb38a,#ff5a2d)", "linear-gradient(135deg,#9fb4ff,#5a6cff)", "linear-gradient(135deg,#9fe6c8,#1baf7a)"][i],
            }}
          />
          <p className="mt-2 text-[12px] text-muted">{t}</p>
        </div>
      ))}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader eyebrow="Everything voice" title={<>One app for <span className="accent">every</span> voice job.</>}>
          Write it, say it, translate it, transcribe it. FireVoice puts a studio of voice engines behind one calm
          window, and keeps every file on your disk.
        </SectionHeader>

        <div className="mt-16 grid gap-4 md:grid-cols-6 [&>*]:min-w-0">
          <Reveal className="md:col-span-4">
            <Card>
              <Title
                icon={AudioLines}
                label="Speak"
                title="Text to speech that actually performs"
                text="Type a script, pick a voice and a delivery, and hear it in seconds. Add pauses, laughs and whispers right in the text."
              />
              <SpeakVisual />
            </Card>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.08}>
            <Card>
              <Title
                icon={Wand2}
                label="Voices"
                title="100 voices, and your own"
                text="Use a ready voice, copy one from a short clip, or describe one and FireVoice creates it."
              />
              <VoiceVisual />
            </Card>
          </Reveal>
          <Reveal className="md:col-span-2">
            <Card>
              <Title
                icon={MessagesSquare}
                label="Dialogue"
                title="Conversations with a cast"
                text="Write a conversation; every speaker keeps their own voice."
              />
              <DialogueVisual />
            </Card>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.08}>
            <Card>
              <Title
                icon={Languages}
                label="Dubbing"
                title="Your video, in another language"
                text="Turn a video or recording into another language, music kept."
              />
              <DubbingVisual />
            </Card>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.16}>
            <Card>
              <Title
                icon={ScrollText}
                label="Transcribe"
                title="Every word, and who said it"
                text="Turn recordings into text with speaker labels and subtitles."
              />
              <TranscribeVisual />
            </Card>
          </Reveal>
          <Reveal className="md:col-span-6">
            <Card className="md:!p-8">
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div>
                  <Title
                    icon={Music}
                    label="Sound and music"
                    title="Effects, ambience and music from a sentence"
                    text="Describe the sound you need and FireVoice makes it: a footstep, a rainy street, a quiet piano bed for your narration."
                  />
                </div>
                <SoundVisual />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
