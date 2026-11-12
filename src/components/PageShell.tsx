import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

/** The frame for the quieter pages (privacy, feedback, account links): the logo home and a centred column. */
export function PageShell({ children, width = "max-w-2xl" }: { children: ReactNode; width?: string }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg text-[15px] font-semibold tracking-tight outline-offset-4">
          <Logo size={26} />
          FireVoice
        </Link>
      </header>
      <main id="main" className={`mx-auto ${width} px-4 pt-8 pb-24 sm:px-6 sm:pt-14`}>
        {children}
      </main>
    </div>
  );
}

export const field =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint outline-none transition focus:border-fire focus:ring-4 focus:ring-fire-soft";

export const button =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-fire px-5 text-[15px] font-semibold text-white shadow-[0_8px_24px_-10px_var(--glow)] transition hover:brightness-110 active:brightness-95 disabled:opacity-60 outline-offset-4";
