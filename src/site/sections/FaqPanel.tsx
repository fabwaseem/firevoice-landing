"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Mark } from "@/site/ui";
import { Reveal, reducedMotion } from "@/site/motion";

// The FAQ's interactive part (Faq.tsx stays a server module so the page can read `faqs` for structured data).

type Faq = { q: string; a: string };

/** The selected question as a chat: the question on the right, a moment of typing, then the answer on the left. */
function Conversation({ f }: { f: Faq }) {
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    if (reducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyping(false);
      return;
    }
    const t = window.setTimeout(() => setTyping(false), 650);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div className="faq-in ml-auto max-w-[78%] rounded-[20px] rounded-br-[6px] bg-ember px-4 py-2.5 text-[14.5px] leading-snug text-[#f6efe6]">{f.q}</div>
      <div className="flex items-end gap-2.5">
        <Mark size={30} className="shrink-0" />
        {typing ? (
          <div className="faq-in flex h-11 items-center gap-1.5 rounded-[20px] rounded-bl-[6px] bg-surface px-4 shadow-[0_10px_30px_-18px_rgba(23,19,15,.35)]" aria-hidden>
            {[0, 1, 2].map((d) => (
              <span key={d} className="faq-dot size-2 rounded-full bg-faint" style={{ animationDelay: `${d * 140}ms` }} />
            ))}
          </div>
        ) : (
          <div className="faq-in max-w-[88%] rounded-[20px] rounded-bl-[6px] bg-surface px-5 py-4 text-[15.5px] leading-relaxed text-ink-2 shadow-[0_10px_30px_-18px_rgba(23,19,15,.35)]">
            {f.a}
          </div>
        )}
      </div>
    </div>
  );
}

export function FaqPanel({ faqs }: { faqs: Faq[] }) {
  const [sel, setSel] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = faqs.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (sel + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (sel - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setSel(next);
    tabs.current[next]?.focus();
  };

  return (
    <>
      <style>{`
        @keyframes faq-in { from { opacity: 0; transform: translate3d(0, 10px, 0) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes faq-dot { 0%, 80%, 100% { transform: translateY(0); opacity: .45; } 40% { transform: translateY(-4px); opacity: 1; } }
        #faq .faq-in { animation: faq-in .38s cubic-bezier(0.25,1,0.5,1) both; transform-origin: bottom left; }
        #faq .faq-dot { animation: faq-dot 1s ease-in-out infinite; }
      `}</style>
      {/* desktop: two panes */}
      <Reveal className="mt-14 hidden md:block" delay={80}>
        <div className="grid h-[600px] grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-2 rounded-[28px] bg-surface-2 p-2">
          <div className="bg-deep on-dark flex min-h-0 flex-col rounded-[22px] p-3">
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label="Questions"
              onKeyDown={onKey}
              className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1 [scrollbar-color:rgba(255,245,235,.2)_transparent] [scrollbar-width:thin]"
            >
              {faqs.map((f, i) => {
                const on = i === sel;
                return (
                  <button
                    key={f.q}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`faq-tab-${i}`}
                    aria-selected={on}
                    aria-controls="faq-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setSel(i)}
                    className={`flex min-h-11 shrink-0 items-center rounded-[14px] px-4 py-2.5 text-left text-[14.5px] leading-snug transition-colors duration-200 ${
                      on ? "bg-[rgba(255,245,235,.12)] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" : "text-ink-2 hover:bg-[rgba(255,245,235,.06)] hover:text-ink"
                    }`}
                  >
                    <span className={`mr-3 h-4 w-[3px] shrink-0 rounded-full transition-colors ${on ? "bg-fire" : "bg-transparent"}`} aria-hidden />
                    {f.q}
                  </button>
                );
              })}
            </div>
          </div>
          <div
            id="faq-panel"
            role="tabpanel"
            aria-labelledby={`faq-tab-${sel}`}
            aria-live="polite"
            tabIndex={0}
            className="flex min-h-0 flex-col justify-end overflow-y-auto rounded-[22px] p-8"
          >
            <Conversation key={sel} f={faqs[sel]} />
          </div>
        </div>
      </Reveal>

      {/* phones: an accordion */}
      <div className="mt-12 flex flex-col gap-2 md:hidden">
        {faqs.map((f, i) => (
          <details key={f.q} className="group rounded-[22px] bg-surface-2 open:bg-surface open:shadow-[0_10px_30px_-20px_rgba(23,19,15,.4)]" open={i === 0}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-[15.5px] font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-3 text-ink transition-transform duration-300 group-open:rotate-45" aria-hidden>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 1.5v9M1.5 6h9" />
                </svg>
              </span>
            </summary>
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
