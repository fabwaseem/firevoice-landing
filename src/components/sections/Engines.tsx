/* FireVoice's own names for its built-in engines (the underlying models are never named on the site) */
const engines = [
  { name: "Ember", job: "expressive speech" },
  { name: "Blaze", job: "fast speech" },
  { name: "Flint", job: "many languages" },
  { name: "Cinder", job: "voice design" },
  { name: "Kindle", job: "voice copying" },
  { name: "Hearth", job: "transcription" },
  { name: "Spark", job: "dictation" },
  { name: "Forge", job: "voice changer" },
  { name: "Pyre", job: "music and sound" },
];

const stats = [
  { value: "100", label: "ready voices from the first minute" },
  { value: "21", label: "delivery styles, from calm to trailer" },
  { value: "0", label: "bytes of your text or voice uploaded" },
  { value: "1", label: "short clip to copy a voice" },
];

export function Engines() {
  return (
    <section aria-label="Engines and numbers" className="py-16 sm:py-20">
      <div className="container-x">
        <p className="text-center text-[13px] text-muted">FireVoice engines, each tuned for one job, all running on your machine</p>
        <div className="mask-fade-x mt-6 overflow-hidden">
          <ul className="flex w-max animate-marquee gap-12 pr-12 motion-reduce:animate-none">
            {[...engines, ...engines].map((e, i) => (
              <li
                key={i}
                aria-hidden={i >= engines.length}
                className="flex items-baseline gap-2 whitespace-nowrap"
              >
                <span className="text-[17px] font-semibold tracking-tight text-ink-2">{e.name}</span>
                <span className="font-mono text-[12px] text-muted">{e.job}</span>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col bg-bg p-6 sm:p-8">
              <dt className="mt-2 text-[14px] leading-snug text-muted">{s.label}</dt>
              <dd className="order-first text-5xl font-semibold tracking-[-0.05em] text-ink sm:text-6xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
