import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { Engines } from "@/components/sections/Engines";
import { Features } from "@/components/sections/Features";
import { Voices } from "@/components/sections/Voices";
import { Dictation } from "@/components/sections/Dictation";
import { Privacy } from "@/components/sections/Privacy";
import { Developers } from "@/components/sections/Developers";
import { Faq, faqs } from "@/components/sections/Faq";
import { FinalCta, Footer } from "@/components/sections/Closing";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <ProductShowcase />
        <Engines />
        <Features />
        <Voices />
        <Dictation />
        <Privacy />
        <Developers />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
