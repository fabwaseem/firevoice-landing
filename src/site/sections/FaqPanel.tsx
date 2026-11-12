"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquareText, Plus } from "@/components/icons";
import { DownloadButton } from "@/site/ui";
import { Reveal } from "@/site/motion";

// The FAQ's interactive part (Faq.tsx stays a server module so the page can read `faqs` for structured data): an
// accordion of white cards, one open at a time, the answer sliding open.

type Faq = { q: string; a: string };

export function FaqPanel({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <ul className="flex flex-col gap-2.5">
      {faqs.map((f, i) => {
        const on = open === i;
        const btn = `faq-q-${base}-${i}`;
        const panel = `faq-a-${base}-${i}`;
        return (
          <Reveal as="li" key={f.q} delay={Math.min(i, 6) * 40} y={14}>
            <div
              className={`rounded-[18px] border bg-surface transition-[border-color,box-shadow] duration-300 ${
                on ? "border-line-strong shadow-[var(--shadow-md)]" : "border-line shadow-[var(--shadow-sm)] hover:border-line-strong"
              }`}
            >
              <h3>
                <button
                  type="button"
                  id={btn}
                  aria-expanded={on}
                  aria-controls={panel}
                  onClick={() => setOpen(on ? null : i)}
                  className="ki-trigger flex min-h-[60px] w-full items-center justify-between gap-4 rounded-[18px] px-5 py-3.5 text-left text-[15.5px] font-semibold tracking-[-0.01em] text-ink sm:px-6 sm:text-[16.5px]"
                >
                  {f.q}
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      on ? "rotate-45 bg-fire text-white" : "bg-surface-3 text-ink-2"
                    }`}
                    aria-hidden
                  >
                    <Plus className="size-4" strokeWidth={2.2} />
                  </span>
                </button>
              </h3>
              <div
                id={panel}
                role="region"
                aria-labelledby={btn}
                inert={!on}
                className="grid transition-[grid-template-rows,opacity,visibility] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0, visibility: on ? "visible" : "hidden" }}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[62ch] px-5 pb-5 text-[15px] leading-relaxed text-ink-2 sm:px-6 sm:pb-6">{f.a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}

/** The left column's way out: write to us, or just get it. */
export function FaqActions() {
  return (
    <div className="mt-8 flex flex-col items-start gap-5">
      <Link
        href="/feedback"
        className="ki-trigger group card flex w-full max-w-sm items-center gap-3.5 rounded-[18px] p-4 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-[var(--shadow-md)]"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-fire-soft text-fire">
          <MessageSquareText variant="duotone" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink">Still curious?</span>
          <span className="block text-[13.5px] text-muted">Send us a message</span>
        </span>
        <ArrowRight className="size-[18px] text-ink-2 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
      <DownloadButton />
    </div>
  );
}
