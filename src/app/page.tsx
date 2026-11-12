import { Nav } from "@/components/Nav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { FieldStage } from "@/components/three/FieldStage";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { VoiceGallery } from "@/components/sections/VoiceGallery";
import { Chapters } from "@/components/sections/Chapters";
import { Dictation } from "@/components/sections/Dictation";
import { Everyday } from "@/components/sections/Everyday";
import { Engines } from "@/components/sections/Engines";
import { Developers } from "@/components/sections/Developers";
import { Faq, faqs } from "@/components/sections/Faq";
import { Finale } from "@/components/sections/Finale";
import { Footer } from "@/components/sections/Closing";
import { Waitlist } from "@/components/sections/Waitlist";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <FieldStage />
      <div className="grain" aria-hidden />
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        {/* the opaque content band; long gradients melt it into the field above and below */}
        <div className="relative bg-bg">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-[50vh] h-[50vh] bg-gradient-to-b from-transparent via-bg/60 to-bg" />
          <ProductShowcase />
          <VoiceGallery />
          <Chapters />
          <Dictation />
          <Everyday />
          <Engines />
          <Developers />
          <Faq />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-[50vh] h-[50vh] bg-gradient-to-b from-bg via-bg/60 to-transparent" />
        </div>
        <Finale />
      </main>
      <div data-stage className="stage relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-[30vh] bottom-0 bg-gradient-to-b from-transparent via-[#050507]/70 to-[#050507]/90" />
        <Waitlist />
        <Footer />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
