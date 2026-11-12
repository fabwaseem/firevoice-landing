import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { FeedbackForm } from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell us what works, what does not, and what FireVoice should do next.",
  alternates: { canonical: "/feedback" },
};

export default function Feedback() {
  return (
    <PageShell width="max-w-xl">
      <p className="text-[13px] font-medium tracking-wide text-fire-ink uppercase">Feedback</p>
      <h1 className="mt-2 text-[34px] leading-tight font-semibold tracking-tight sm:text-[42px]">Tell us what you think</h1>
      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
        A bug, an idea, or something you love. Every message is read. In the app, Help then Send feedback includes your app
        version for you.
      </p>
      <FeedbackForm />
    </PageShell>
  );
}
