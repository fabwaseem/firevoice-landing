import { Cpu, HardDrive, Lock, WifiOff } from "lucide-react";
import { Reveal } from "../Reveal";

const items = [
  { icon: Lock, t: "Nothing is uploaded", d: "Your scripts, recordings and voices never leave the computer." },
  { icon: HardDrive, t: "Your files, your folder", d: "Voices, renders and history live in a folder you can open, back up or move." },
  { icon: Cpu, t: "Your GPU does the work", d: "The voice engines run on your own graphics card. No credits, no per-minute fees." },
  { icon: WifiOff, t: "Works without the internet", d: "Once the engines are downloaded, FireVoice keeps working offline." },
];

export function Privacy() {
  return (
    <section aria-labelledby="privacy-title" className="relative py-10 sm:py-16">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0705] px-6 py-16 text-white sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-0">
            <div className="absolute -left-1/4 -top-1/2 h-[140%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(255,98,41,0.35),transparent)] blur-2xl" />
            <div className="absolute -bottom-1/2 right-[-10%] h-[120%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(255,61,110,0.18),transparent)] blur-2xl" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "radial-gradient(ellipse at center, #000 20%, transparent 70%)",
              }}
            />
          </div>
          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#ff9c6e]">Private by design</p>
              <h2
                id="privacy-title"
                className="mt-4 text-balance font-semibold leading-[1.02] tracking-[-0.04em]"
                style={{ fontSize: "clamp(2.2rem, 5.4vw, 4.4rem)" }}
              >
                Your voice is yours. <span className="accent">It stays here.</span>
              </h2>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-white/65">
                Cloud voice tools keep a copy of what you send them. FireVoice can&apos;t, because there is nowhere to
                send it: everything happens on the computer in front of you.
              </p>
            </div>
            <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {items.map(({ icon: Icon, t, d }, i) => (
                <Reveal as="li" key={t} delay={i * 0.06}>
                  <Icon className="size-5 text-[#ff8a5c]" />
                  <p className="mt-3 font-medium">{t}</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-white/55">{d}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
