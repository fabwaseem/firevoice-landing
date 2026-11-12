import Link from "next/link";
import type { ReactNode } from "react";
import { Pill, Wordmark } from "@/site/ui";
import { ArrowLeft, Laptop, MessageSquareHeart, ShieldCheck } from "@/components/icons";

/** The frame for the quieter pages (privacy, feedback, account): the name home, and a centred column. */
export function PageShell({ children, width = "max-w-2xl" }: { children: ReactNode; width?: string }) {
  return (
    <div className="ambient min-h-dvh bg-bg text-ink">
      <header className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="FireVoice home" className="rounded-lg">
          <Wordmark />
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink">
          <ArrowLeft className="size-4" />
          Home
        </Link>
      </header>
      <main id="main" className={`mx-auto ${width} px-4 pt-6 pb-24 sm:px-6 sm:pt-12`}>
        {children}
      </main>
    </div>
  );
}

const PERKS = [
  { icon: Laptop, title: "Keep your computers together", text: "Sign in on each one and they show up under one account." },
  { icon: MessageSquareHeart, title: "Feedback that reaches you", text: "Send ideas and bugs as you, so we can write back." },
  { icon: ShieldCheck, title: "Free, with nothing to buy", text: "Every feature is included. Your voice and words stay on your computer." },
];

/** The sign-in pages: the form on the left, and on the right a dark panel in the app's own look that says what an
 * account is for, with the dictation pill at work. On phones only the form shows. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-bg text-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="ambient flex flex-col px-4 sm:px-8">
        <header className="flex h-20 items-center justify-between">
          <Link href="/" aria-label="FireVoice home" className="rounded-lg">
            <Wordmark />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-2 transition-colors hover:bg-surface hover:text-ink">
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </header>
        <main id="main" className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center pb-16">
          {children}
        </main>
      </div>
      <aside aria-label="Why a FireVoice account" className="on-dark relative m-3 hidden overflow-hidden rounded-[28px] lg:flex lg:flex-col lg:justify-between">
        {/* glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 size-[420px] rounded-full bg-[#ff6b3d]/25 blur-[90px]" />
          <div className="absolute bottom-0 -left-24 size-[380px] rounded-full bg-[#7a6bff]/20 blur-[90px]" />
          <div className="absolute top-1/2 left-1/3 size-[260px] rounded-full bg-[#3dd08f]/10 blur-[80px]" />
        </div>
        <div className="relative px-12 pt-14">
          <p className="eyebrow">FireVoice account</p>
          <h2 className="display display-md mt-6 max-w-md text-ink">
            One account for <em>every computer</em> you talk to.
          </h2>
        </div>
        {/* the pill at work over a little window */}
        <div aria-hidden className="relative mx-12 my-10">
          <div className="rounded-[18px] border border-line bg-surface/80 p-5 shadow-[var(--shadow-lg)] backdrop-blur">
            <div className="mb-4 flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="text-[15px] leading-relaxed text-ink-2">
              Hi Sam, can we move the review to Thursday afternoon? I&rsquo;ll send the notes before then.
              <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-blink bg-fire" />
            </p>
          </div>
          <div className="mt-[-18px] flex justify-center">
            <Pill state="listening" level={0.6} />
          </div>
        </div>
        <ul className="relative grid gap-5 px-12 pb-14">
          {PERKS.map((p) => (
            <li key={p.title} className="flex gap-3.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-fire-soft text-fire">
                <p.icon className="size-4" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-ink">{p.title}</span>
                <span className="block text-[14px] text-muted">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export const field =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint outline-none transition focus:border-fire focus:ring-4 focus:ring-fire-soft";

export const button = "btn btn-fire disabled:opacity-60 disabled:pointer-events-none";
