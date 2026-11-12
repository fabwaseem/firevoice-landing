"use client";

import Image from "next/image";
import { Check, FileAudio, Upload } from "@/components/icons";
import { Bars } from "../ui";
import { DictationDemo } from "./Dictation";

/* Each visual fills the sticky stage on the right of the chapters. They read as product UI, at a glance. */

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function SpeakVisual() {
  const styles = ["Storyteller", "Trailer", "Calm", "Excited", "Whisper", "Newscaster"];
  return (
    <div className="space-y-3">
      <Panel>
        <div className="flex items-center gap-3">
          <Image src="/avatars/dsg-documentary-m.webp" alt="" width={40} height={40} className="rounded-full" />
          <div>
            <p className="text-[14px] font-medium text-white">Atticus</p>
            <p className="text-[12px] text-white/50">Documentary narrator · Inferno engine</p>
          </div>
        </div>
        <p className="mt-5 text-[19px] leading-relaxed text-white/90">
          Here, in the quiet of your own computer,{" "}
          <span className="rounded bg-[#ff6b3d]/20 px-1.5 font-mono text-[13px] text-[#ffb08a]">[pause 400ms]</span> a
          brand new voice takes its very first breath.
        </p>
      </Panel>
      <div className="flex flex-wrap gap-2">
        {styles.map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1.5 text-[13px] ${
              i === 0 ? "bg-[#c2410c] text-white" : "border border-white/12 text-white/60"
            }`}
          >
            {s}
          </span>
        ))}
        <span className="rounded-full border border-dashed border-white/15 px-3 py-1.5 text-[13px] text-white/40">
          +15 more
        </span>
      </div>
      <Panel className="flex items-center gap-4 !py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full fire-gradient text-white">▶</span>
        <Bars n={64} seed={2.3} className="h-10 text-[#ff7a45]" />
        <span className="font-mono text-[12px] text-white/50">0:06</span>
      </Panel>
    </div>
  );
}

export function CloneVisual() {
  return (
    <div className="space-y-3">
      <Panel className="border-dashed !border-white/20">
        <div className="flex items-center gap-3 text-white/80">
          <Upload className="size-5 text-[#ff8a5c]" />
          <span className="text-[15px]">my-voice.wav</span>
          <span className="ml-auto font-mono text-[12px] text-white/45">0:12</span>
        </div>
        <Bars n={72} seed={3.7} className="mt-4 h-14 text-white/35" />
      </Panel>
      <div className="flex items-center justify-center gap-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
        <span className="h-px w-10 bg-white/15" /> cleaned · analysed · on your GPU <span className="h-px w-10 bg-white/15" />
      </div>
      <Panel className="flex items-center gap-4 !border-[#ff6b3d]/40 !bg-[#ff6b3d]/10">
        <span className="grid size-12 place-items-center rounded-full fire-gradient text-lg font-semibold text-white">
          Y
        </span>
        <div>
          <p className="text-[16px] font-medium text-white">Your voice</p>
          <p className="text-[13px] text-[#ffb08a]">Ready to read any script, in any style</p>
        </div>
        <Check className="ml-auto size-5 text-[#7ee0b5]" />
      </Panel>
    </div>
  );
}

export function DesignVisual() {
  return (
    <div className="space-y-3">
      <Panel>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Describe it</p>
        <p className="mt-3 text-[19px] leading-relaxed text-white/90">
          &ldquo;An epic movie-trailer narrator, very deep, slow and dramatic.&rdquo;
        </p>
      </Panel>
      {[0, 1, 2].map((i) => (
        <Panel
          key={i}
          className={`flex items-center gap-4 !py-3 ${i === 1 ? "!border-[#ff6b3d]/45 !bg-[#ff6b3d]/10" : ""}`}
        >
          <span className="w-20 text-[13px] text-white/55">Take {i + 1}</span>
          <Bars n={44} seed={i + 4.2} className={`h-7 ${i === 1 ? "text-[#ff7a45]" : "text-white/30"}`} />
          {i === 1 ? (
            <span className="rounded-full bg-[#c2410c] px-2.5 py-1 text-[11px] font-semibold text-white">Keep</span>
          ) : (
            <span className="w-[46px]" />
          )}
        </Panel>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <Image src="/avatars/dsg-trailer-voice.webp" alt="" width={36} height={36} className="rounded-full" />
        <p className="text-[13px] text-white/60">Kept as <span className="text-white">Titan</span>, in your library.</p>
      </div>
    </div>
  );
}

export function DictateVisual() {
  return (
    <div>
      <DictationDemo />
    </div>
  );
}

export function DialogueVisual() {
  const lines = [
    { who: "Wren", img: "dsg-ghost-whisper-f", text: "Did you hear that?" },
    { who: "Viktor", img: "dsg-villain-m", text: "It's only the wind." },
    { who: "Wren", img: "dsg-ghost-whisper-f", text: "The wind doesn't knock." },
    { who: "Viktor", img: "dsg-villain-m", text: "...Then don't answer." },
  ];
  return (
    <div className="space-y-2.5">
      {lines.map((l, i) => (
        <Panel key={i} className={`flex items-center gap-3 !py-3 ${i % 2 ? "ml-10" : "mr-10"}`}>
          <Image src={`/avatars/${l.img}.webp`} alt="" width={34} height={34} className="rounded-full" />
          <div>
            <p className="text-[12px] text-white/45">{l.who}</p>
            <p className="text-[16px] text-white/90">{l.text}</p>
          </div>
        </Panel>
      ))}
      <p className="pt-1 text-center text-[13px] text-white/45">One script, every speaker in their own voice.</p>
    </div>
  );
}

export function DubVisual() {
  const rows = [
    ["EN", "Welcome back to the workshop."],
    ["ES", "Bienvenidos de nuevo al taller."],
    ["DE", "Willkommen zurück in der Werkstatt."],
    ["UR", "ورکشاپ میں دوبارہ خوش آمدید۔"],
  ];
  return (
    <div className="space-y-3">
      <Panel className="relative aspect-video overflow-hidden !p-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,138,76,0.35),transparent_60%),linear-gradient(135deg,#1a0d08,#0b0b10)]" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 p-4">
          <span className="text-white">▶</span>
          <div className="h-1 flex-1 rounded-full bg-white/20">
            <div className="h-full w-[42%] rounded-full bg-[#ff6b3d]" />
          </div>
          <span className="font-mono text-[11px] text-white/60">1:04 / 2:31</span>
        </div>
        <p className="absolute inset-x-0 bottom-14 text-center text-[17px] text-white drop-shadow">
          Bienvenidos de nuevo al taller.
        </p>
      </Panel>
      {rows.map(([l, t], i) => (
        <div key={l} className="flex items-center gap-3">
          <span className={`w-8 font-mono text-[12px] ${i === 1 ? "text-[#ff8a5c]" : "text-white/40"}`}>{l}</span>
          <div
            className={`flex-1 truncate rounded-xl border px-3 py-2 text-[14px] ${
              i === 1 ? "border-[#ff6b3d]/40 bg-[#ff6b3d]/10 text-white" : "border-white/10 text-white/60"
            }`}
          >
            {t}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TranscribeVisual() {
  const segs = [
    ["00:02", "Speaker 1", "#ff8a5c", "So the plan is simple: we ship on Thursday."],
    ["00:06", "Speaker 2", "#8ea2ff", "Thursday works. Is the installer signed?"],
    ["00:09", "Speaker 1", "#ff8a5c", "Signed, tested, and the update feed is live."],
  ];
  return (
    <div className="space-y-2.5">
      <Panel className="flex items-center gap-3 !py-3">
        <FileAudio className="size-5 text-[#ff8a5c]" />
        <span className="text-[14px] text-white/80">standup-meeting.m4a</span>
        <span className="ml-auto rounded-full bg-[#7ee0b5]/15 px-2.5 py-1 text-[11px] text-[#7ee0b5]">Done</span>
      </Panel>
      {segs.map(([t, s, c, x]) => (
        <Panel key={t} className="!py-3">
          <p className="font-mono text-[11px] text-white/40">
            {t} <span style={{ color: c }}>{s}</span>
          </p>
          <p className="mt-1 text-[16px] text-white/90">{x}</p>
        </Panel>
      ))}
      <div className="flex gap-2 pt-1">
        {["TXT", "SRT", "VTT", "JSON"].map((f) => (
          <span key={f} className="rounded-md border border-white/12 px-2 py-1 font-mono text-[11px] text-white/55">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SoundVisual() {
  return (
    <div className="space-y-3">
      <Panel>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Describe a sound</p>
        <p className="mt-3 text-[19px] text-white/90">Rain on a tin roof, distant thunder, a cat purring nearby.</p>
      </Panel>
      {[
        ["Sound effect", 5.3, "text-[#ff7a45]"],
        ["Ambience", 7.1, "text-white/40"],
        ["Music bed", 9.4, "text-white/40"],
      ].map(([label, seed, cls]) => (
        <Panel key={label as string} className="flex items-center gap-4 !py-3">
          <span className="w-28 text-[13px] text-white/60">{label as string}</span>
          <Bars n={52} seed={seed as number} className={`h-8 ${cls as string}`} />
        </Panel>
      ))}
    </div>
  );
}
