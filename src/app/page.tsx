import { SmoothScroll } from "@/site/motion";
import { Announcement, Nav } from "@/site/Nav";
import { Footer } from "@/site/Footer";
import { Hero } from "@/site/sections/Hero";
import { Why } from "@/site/sections/Why";
import { HowItWorks } from "@/site/sections/HowItWorks";
import { Features } from "@/site/sections/Features";
import { Privacy } from "@/site/sections/Privacy";
import { Studio } from "@/site/sections/Studio";
import { Faq, faqs } from "@/site/sections/Faq";
import { Closing } from "@/site/sections/Closing";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

/** The home page: speech in, writing out, shown the way the app looks. */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Announcement />
      <Nav />
      <main id="main">
        <Hero />
        <Why />
        <HowItWorks />
        <Features />
        <Privacy />
        <Studio />
        <Faq />
        <Closing />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
