import { FileAudio, Library, Wand2 } from "lucide-react";
import { Reveal } from "../Reveal";
import { Bars, SectionHeader } from "../ui";

const sample = [
  { name: "Mara", tag: "Warm narrator", g: "#ffb38a,#ff5a2d" },
  { name: "Theo", tag: "Calm explainer", g: "#9fb4ff,#5a6cff" },
  { name: "June", tag: "Bedtime stories", g: "#ffd28a,#ff9a2d" },
  { name: "Idris", tag: "Documentary", g: "#9fe6c8,#1baf7a" },
  { name: "Noor", tag: "Podcast host", g: "#f2a6c8,#d55181" },
  { name: "Wes", tag: "Movie trailer", g: "#c8b4ff,#6250d6" },
];

export function Voices() {
  return (
    <section id="voices" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader
          eyebrow="Voices"
          title={
            <>
              Pick one. Copy one.<br /> <span className="accent">Describe</span> one.
            </>
          }
        >
          Start with 100 narrators, characters and accents. When you need something that doesn&apos;t exist yet, make
          it in a minute.
        </SectionHeader>

        <div className="mt-16 grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
          <Reveal>
            <div className="card h-full p-6 sm:p-7">
              <div className="flex items-center gap-2 text-[13px] font-medium text-fire-ink">
                <Library className="size-4" /> 100 ready voices
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-2">
                {sample.map((v) => (
                  <li key={v.name} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/60 p-2.5">
                    <span className="size-8 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg,${v.g})` }} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-ink">{v.name}</span>
                      <span className="block truncate text-[11px] text-faint">{v.tag}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">
                Ready from the first minute. Every voice works with every delivery style.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="card h-full p-6 sm:p-7">
              <div className="flex items-center gap-2 text-[13px] font-medium text-fire-ink">
                <FileAudio className="size-4" /> Copy a voice
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-line-strong p-4">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-ink-2">my-voice.wav</span>
                  <span className="font-mono text-faint">0:12</span>
                </div>
                <Bars n={44} seed={3.7} className="mt-3 h-12 text-muted" />
              </div>
              <div className="my-3 flex justify-center text-faint" aria-hidden>
                ↓
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-fire/30 bg-fire-soft p-3">
                <span className="size-9 rounded-full fire-gradient" />
                <div>
                  <p className="text-[13px] font-medium text-ink">Your voice</p>
                  <p className="text-[11px] text-fire-ink">Ready to speak any script</p>
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">
                A short, clean clip is enough. FireVoice cleans the noise for you, and asks for consent first.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="card h-full p-6 sm:p-7">
              <div className="flex items-center gap-2 text-[13px] font-medium text-fire-ink">
                <Wand2 className="size-4" /> Design from a description
              </div>
              <div className="mt-6 rounded-2xl border border-line bg-surface-2/60 p-4 text-[15px] leading-relaxed text-ink-2">
                &ldquo;An older sea captain, gravelly and kind, who speaks slowly and smiles while he talks.&rdquo;
              </div>
              <ul className="mt-3 space-y-2">
                {["Candidate 1", "Candidate 2", "Candidate 3"].map((c, i) => (
                  <li
                    key={c}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                      i === 1 ? "border-fire/40 bg-fire-soft" : "border-line bg-surface"
                    }`}
                  >
                    <span className="w-[86px] text-[12px] text-muted">{c}</span>
                    <Bars n={26} seed={i + 4.2} className={`h-5 flex-1 ${i === 1 ? "text-fire" : "text-faint"}`} />
                    {i === 1 && <span className="text-[11px] font-medium text-fire-ink">Keep</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">
                Listen to a few takes, keep the one you like, and it joins your library.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
