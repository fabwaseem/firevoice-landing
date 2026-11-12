"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal, useInView } from "@/site/motion";

// Privacy: one wide sand card. The heading, a short promise, a link to the policy, and three round badges whose rings
// draw in when they come into view.

const BADGES = [
  { lines: ["Runs on your", "computer"], icon: "M4 5h16v11H4zM8 20h8M12 16v4" },
  { lines: ["Nothing you", "say uploaded"], icon: "M12 3v12M7 8l5-5 5 5M5 21h14" },
  { lines: ["You choose", "what’s shared"], icon: "M5 12l4 4 10-10" },
];

function Badge({ lines, icon, shown, strike, delay }: { lines: string[]; icon: string; shown: boolean; strike?: boolean; delay: number }) {
  return (
    <li className="relative grid size-[92px] shrink-0 place-items-center sm:size-[112px]">
      <svg viewBox="0 0 112 112" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="56" cy="56" r="54" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
        <circle
          cx="56"
          cy="56"
          r="54"
          fill="none"
          stroke="var(--fire)"
          strokeWidth="1.6"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: shown ? 0 : 1, transition: `stroke-dashoffset 1.4s cubic-bezier(.25,1,.5,1) ${delay}ms` }}
        />
        <circle cx="56" cy="56" r="47" fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 4" />
      </svg>
      <span className="relative flex flex-col items-center text-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--fire-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={icon} />
          {strike && <path d="M4 4l16 16" />}
        </svg>
        <span className="mt-1.5 text-[10.5px] leading-[1.25] font-medium text-ink sm:text-[11.5px]">
          {lines[0]}
          <br />
          {lines[1]}
        </span>
      </span>
    </li>
  );
}

export function Privacy() {
  const [ref, inView] = useInView<HTMLUListElement>("0px 0px -10% 0px");
  const [seen, setSeen] = useState(false);
  if (inView && !seen) setSeen(true);

  return (
    <section id="privacy" aria-labelledby="privacy-title" className="relative pt-4 pb-20 md:pt-6 md:pb-28">
      <div className="container-x">
        <Reveal>
          <div className="sheet-round grid items-center gap-8 border border-line bg-surface-2 px-6 py-10 sm:px-10 lg:min-h-[220px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto] lg:gap-12 lg:px-14">
            <h2 id="privacy-title" className="display display-md">
              Your voice <em>stays yours.</em>
            </h2>
            <div>
              <p className="text-[16px] leading-relaxed text-ink-2">
                FireVoice listens, writes and speaks on your own computer. What you say and write is never uploaded, and you choose whether usage statistics are shared.
              </p>
              <Link href="/privacy" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-fire-ink underline-offset-4 hover:underline">
                Read the privacy policy <span aria-hidden>→</span>
              </Link>
            </div>
            <ul ref={ref} className="flex justify-center gap-1.5 sm:justify-start sm:gap-3" aria-label="What that means">
              {BADGES.map((b, i) => (
                <Badge key={b.lines.join(" ")} {...b} strike={i === 1} shown={seen} delay={i * 180} />
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
