import { Plus } from "lucide-react";
import { SectionHeader } from "../ui";

export const faqs = [
  {
    q: "Is anything I write or say uploaded?",
    a: "No. Speech, dictation, cloning, dubbing and transcription all run on your own computer. The internet is only used to download the app, the voice engines and updates.",
  },
  {
    q: "What do I need to run it?",
    a: "A Windows PC. FireVoice runs its voice models on your graphics card, so an NVIDIA GPU gives you the fastest results and lets you use the larger engines.",
  },
  {
    q: "How long does setup take?",
    a: "You are in the app in about a minute. FireVoice installs a small core first, then fetches the heavier parts in the background with a progress card in the corner, so you can look around while it finishes.",
  },
  {
    q: "Can I clone my own voice?",
    a: "Yes. Give FireVoice a short, clean clip and it creates a voice you can use with any script and delivery style. You can also design a brand-new voice from a written description.",
  },
  {
    q: "Can my own programs or AI agents use it?",
    a: "Yes. FireVoice runs a local HTTP API with OpenAPI docs, including OpenAI- and ElevenLabs-style routes, so existing code and agents can switch to it by changing one address.",
  },
  {
    q: "How do updates work?",
    a: "FireVoice tells you when a new version is out and installs it when you choose. Engines and voices you already downloaded are kept.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] [&>*]:min-w-0">
        <SectionHeader align="left" eyebrow="FAQ" title={<>Questions, <span className="accent">answered.</span></>} />
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-5 text-left text-[17px] font-medium text-ink">
                {f.q}
                <Plus className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="max-w-2xl pb-6 pr-10 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
