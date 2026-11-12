import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/site/ui";

/** The frame for the quieter pages (privacy, feedback, account): the name home, and a centred column on the paper. */
export function PageShell({ children, width = "max-w-2xl" }: { children: ReactNode; width?: string }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="FireVoice home" className="rounded-lg">
          <Wordmark />
        </Link>
        <Link href="/" className="text-[14px] font-medium text-ink-2 hover:text-ink">
          &larr; Home
        </Link>
      </header>
      <main id="main" className={`mx-auto ${width} px-4 pt-6 pb-24 sm:px-6 sm:pt-12`}>
        {children}
      </main>
    </div>
  );
}

/** The auth pages: sand all round and one paper card in the middle, the FireVoice pill perched on its corner. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-surface-2 px-4 text-ink">
      <header className="flex h-24 items-center">
        <Link href="/" aria-label="FireVoice home" className="rounded-lg">
          <Wordmark />
        </Link>
      </header>
      <main id="main" className="relative w-full max-w-[440px] pb-16">
        {children}
        <p className="mt-8 text-center text-[12.5px] text-muted">Free · Runs on your own computer · Windows and Linux</p>
      </main>
    </div>
  );
}

export const field =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint outline-none transition focus:border-fire focus:ring-4 focus:ring-fire-soft";

export const button = "btn btn-fire disabled:opacity-60 disabled:pointer-events-none";
