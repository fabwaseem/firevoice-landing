import engines from "@/data/engines.json";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui";

/* FireVoice's own engine brands and tiers (from the app). The underlying models are never named on the site. */
const qualityRank: Record<string, number> = { Studio: 3, Pro: 2, Standard: 1 };
const order = [...engines].sort(
  (a, b) =>
    (b.brand === "Inferno" ? 10 : 0) - (a.brand === "Inferno" ? 10 : 0) ||
    (qualityRank[b.quality ?? ""] ?? 0) - (qualityRank[a.quality ?? ""] ?? 0) ||
    b.languages - a.languages,
);

const stats = [
  { value: "15", label: "voice engines" },
  { value: "100", label: "ready voices" },
  { value: "30", label: "languages" },
  { value: "0", label: "bytes uploaded" },
];

function Flame({ level }: { level: number }) {
  return (
    <span className="flex items-end gap-[3px]" role="img" aria-label={`Quality ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`w-1.5 rounded-full ${n <= level ? "fire-gradient" : "bg-line-strong"}`}
          style={{ height: 6 + n * 4 }}
        />
      ))}
    </span>
  );
}

export function Engines() {
  const [flagship, ...rest] = order;
  return (
    <section id="engines" className="relative bg-bg py-28 sm:py-36">
      <div className="container-x">
        <SectionHeader
          eyebrow="The engines"
          title={
            <>
              Fifteen engines. <span className="accent">All fire.</span>
            </>
          }
        >
          Each engine is tuned for a job: instant, emotional, multilingual, studio-grade. Install the ones your GPU can
          carry and switch per script.
        </SectionHeader>

        <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col bg-bg px-6 py-6 text-center">
              <dt className="mt-1 text-[13px] text-muted">{s.label}</dt>
              <dd className="order-first text-4xl font-semibold tracking-[-0.05em] text-ink sm:text-5xl">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
          <Reveal className="md:col-span-2 lg:row-span-2">
            <article className="stage relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0b0f] p-7 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_80%_10%,rgba(255,98,41,0.45),transparent_60%),radial-gradient(50%_50%_at_10%_100%,rgba(255,46,99,0.2),transparent_60%)]" />
              <div className="relative flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#ffb08a]">
                  Flagship
                </span>
                <span className="font-mono text-[12px] text-white/55">{flagship.vram} GB VRAM</span>
              </div>
              <h3 className="relative mt-auto pt-16 text-[clamp(3rem,6vw,5rem)] font-semibold leading-none tracking-[-0.05em]">
                {flagship.brand}
              </h3>
              <p className="relative mt-4 max-w-sm text-[16px] leading-relaxed text-white/70">
                The most natural FireVoice engine: 48 kHz studio sound, voice cloning and voice design in{" "}
                {flagship.languages} languages. Every clip on this page was made with it.
              </p>
              <div className="relative mt-6 flex flex-wrap gap-2 text-[12px]">
                {[flagship.quality, flagship.speed, "Clone", "Design"].map((t) => (
                  <span key={t} className="rounded-full border border-white/15 px-2.5 py-1 text-white/75">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
          {rest.map((e, i) => (
            <Reveal key={e.brand} delay={(i % 4) * 0.04}>
              <article className="card flex h-full flex-col p-5 transition-colors hover:border-line-strong">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-semibold tracking-tight text-ink">{e.brand}</h3>
                  <Flame level={qualityRank[e.quality ?? ""] ?? 1} />
                </div>
                <p className="mt-2 text-[14px] leading-snug text-muted">{e.tagline}</p>
                <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 font-mono text-[11px] text-muted">
                  <span>{e.speed}</span>
                  <span>{e.vram} GB</span>
                  <span>
                    {e.languages} lang{e.languages > 1 ? "s" : ""}
                  </span>
                  {e.clone && <span className="text-fire-ink">clone</span>}
                  {e.design && <span className="text-fire-ink">design</span>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
