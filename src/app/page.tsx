import { SmoothScroll } from "@/site/motion";
import { Announcement, Nav } from "@/site/Nav";
import { Footer } from "@/site/Footer";
import { Hero } from "@/site/sections/Hero";
import { Apps } from "@/site/sections/Apps";
import { Speed } from "@/site/sections/Speed";
import { HowItWorks } from "@/site/sections/HowItWorks";
import { Features } from "@/site/sections/Features";
import { Privacy } from "@/site/sections/Privacy";
import { Voices } from "@/site/sections/Voices";
import { Faq, faqs } from "@/site/sections/Faq";
import { Closing } from "@/site/sections/Closing";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

/** The home page: speech in, writing out. Each section is its own scene; the sheets slide over each other. */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Announcement />
      <Nav />
      <main id="main">
        <Hero />
        <Apps />
        <Speed />
        <HowItWorks />
        <Features />
        <Privacy />
        <Voices />
        <Faq />
        <Closing />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
