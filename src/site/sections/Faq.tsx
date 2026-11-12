import { Heading } from "@/site/ui";
import { Reveal } from "@/site/motion";
import { FaqActions, FaqPanel } from "./FaqPanel";

// Questions and answers: a short intro with a way to ask more on the left, an accordion of every question on the right
// (stacked on phones). `faqs` also feeds the page's FAQ structured data.

export const faqs: { q: string; a: string }[] = [
  {
    q: "Does it work in every app?",
    a: "Almost everywhere you can type. FireVoice puts the finished text where your cursor is, so it works in email, chat, documents, browsers and code editors: Slack, Gmail, Word, Notion, VS Code and the rest. The one exception is a window running as administrator, which Windows keeps apart from other programs.",
  },
  {
    q: "How is it different from the dictation built into Windows?",
    a: "Built-in dictation writes down what you said, word for word. FireVoice writes what you meant: it drops the ums and uhs, repeated words and false starts, adds punctuation and capitals, and tidies the text to suit where it goes, so an email reads like an email and a chat like a chat. You can also start it by saying \"Hey FireVoice\", teach it names and terms in the Dictionary, and keep snippets for text you use often.",
  },
  {
    q: "Does it work with my accent or language?",
    a: "Yes. FireVoice detects the language you speak and works in many languages, with all kinds of accents. Add the names and terms you use to the Dictionary and it spells them right. \"Teach it your voice\" helps \"Hey FireVoice\" learn how you say it.",
  },
  {
    q: "Does anything I say leave my computer?",
    a: "No. Speech recognition, the writing clean-up and the voices all run on your own computer, so what you say and write is never uploaded. If you agree when FireVoice asks, it shares usage statistics: which features you use, details about the app and your computer, and your approximate location. Never what you say or write. You can turn that off at any time in Settings, Privacy.",
  },
  {
    q: "Is it free?",
    a: "Yes. FireVoice is free for everyone right now. There is no card to enter and nothing to unlock.",
  },
  {
    q: "Do I need an account?",
    a: "No. An account is optional, and everything on your computer works without one.",
  },
  {
    q: "What computer do I need?",
    a: "A Windows or Linux computer. Dictation runs on the processor, and faster with a graphics card. For the voice studio, a recent NVIDIA graphics card makes it fastest; without one it still runs on the processor, just slower.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. Because everything runs on your computer, once FireVoice has downloaded what it needs, you can dictate and make voices without an internet connection.",
  },
  {
    q: "Can it start with my computer?",
    a: "Yes. FireVoice starts with Windows and waits quietly in the tray, ready for the shortcut or \"Hey FireVoice\". You can turn that off in Settings.",
  },
  {
    q: "How do I start dictating?",
    a: "Press the shortcut or say \"Hey FireVoice\", then speak in any program. The pill glows with your voice and turns into a green tick when the words go in. Choose whether the text is typed as you speak or all at once when you stop. Your first dictation comes with a short guided tour.",
  },
  {
    q: "Is there a Mac version?",
    a: "Not yet. FireVoice is for Windows and Linux today. Join the list at the bottom of this page and we will tell you when it arrives on the Mac.",
  },
  {
    q: "What else can it do?",
    a: "FireVoice is also a voice studio: natural text to speech in a library of voices, your own voice cloned from a short sample, new voices designed from a description, dialogue between several speakers, dubbing into other languages, a voice changer, sound effects, and transcription with captions you can save as SRT.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section ambient">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Heading
              eyebrow="FAQ"
              align="left"
              size="md"
              lede="The short answers about how FireVoice works, what it needs and what stays on your computer."
            >
              <span id="faq-title">
                Questions, <em>answered.</em>
              </span>
            </Heading>
          </Reveal>
          <Reveal delay={80}>
            <FaqActions />
          </Reveal>
        </div>
        <FaqPanel faqs={faqs} />
      </div>
    </section>
  );
}
