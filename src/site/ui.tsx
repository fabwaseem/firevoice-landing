"use client";

import { useEffect, useState, type ReactNode } from "react";
import { site } from "@/lib/site";
import { Check, Mic } from "@/components/icons";

// The site's shared parts: the FireVoice pill, the download button, the logo and section headings.

/** The FireVoice mark: the app icon (five bars on a fire gradient). */
export function Mark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden className={className}>
      <defs>
        <linearGradient id="fv-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a4c" />
          <stop offset="1" stopColor="#ff4d2e" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#fv-mark)" />
      <g fill="none" stroke="#fff" strokeWidth="40" strokeLinecap="round">
        <line x1="136" y1="236" x2="136" y2="276" />
        <line x1="196" y1="176" x2="196" y2="336" />
        <line x1="256" y1="124" x2="256" y2="388" />
        <line x1="316" y1="176" x2="316" y2="336" />
        <line x1="376" y1="236" x2="376" y2="276" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em] ${className}`}>
      <Mark size={24} />
      FireVoice
    </span>
  );
}

export type PillState = "idle" | "listening" | "writing" | "done";

/** The app's dictation pill, as on the screen: dark glass; bars that move with the voice while listening, a shimmer
 * while writing, a green tick when the words went in. `level` (0..1) drives the bars and the warm glow. */
export function Pill({ state = "listening", level = 0.6, label, size = "md", className = "" }: { state?: PillState; level?: number; label?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const h = size === "lg" ? 56 : size === "sm" ? 36 : 44;
  const bars = [0.45, 0.8, 1, 0.7, 0.95, 0.55, 0.85, 0.5, 0.75];
  if (state === "done")
    return (
      <span
        className={`fv-pill inline-grid place-items-center rounded-full transition-all duration-300 ${className}`}
        style={{ width: h, height: h, background: "linear-gradient(180deg,#22c55e,#16a34a)", borderColor: "rgba(255,255,255,.25)" }}
        aria-label="Inserted"
      >
        <Check className="text-white" size={h * 0.46} strokeWidth={3} trigger="manual" active />
      </span>
    );
  return (
    <span
      className={`fv-pill relative inline-flex items-center gap-2.5 overflow-hidden rounded-full ${className}`}
      style={{ height: h, padding: `0 ${h * 0.36}px 0 ${h * 0.16}px`, boxShadow: state === "listening" ? `0 0 ${18 + level * 28}px -4px rgba(255,106,51,${0.25 + level * 0.45}), 0 22px 44px -18px rgba(0,0,0,.7)` : undefined }}
    >
      <span className="grid shrink-0 place-items-center rounded-full fire-dot" style={{ width: h - 12, height: h - 12, background: "linear-gradient(135deg,#ff8a4c,#ff4d2e)" }}>
        <Mic className="text-white" size={(h - 12) * 0.52} strokeWidth={2.2} />
      </span>
      {state === "writing" ? (
        <span className="shimmer-text pr-0.5 text-[13.5px] leading-normal font-semibold whitespace-nowrap">{label ?? "Writing"}</span>
      ) : (
        <span className="flex h-[55%] items-center gap-[3px]" aria-hidden>
          {bars.map((b, i) => (
            <span
              key={i}
              className="w-[3px] origin-center rounded-full bg-white/90"
              style={{
                height: "100%",
                transform: `scaleY(${state === "idle" ? 0.2 : Math.max(0.18, Math.min(1, b * (0.35 + level)))})`,
                transition: "transform 120ms ease",
              }}
            />
          ))}
        </span>
      )}
      {label && state !== "writing" && <span className="text-[13px] font-medium text-white/85">{label}</span>}
    </span>
  );
}

/** Which download fits this visitor: Windows unless the browser says Linux. Read after hydration. */
export function useOs(): "windows" | "linux" {
  const [os, setOs] = useState<"windows" | "linux">("windows");
  useEffect(() => {
    const ua = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (/Linux/i.test(ua) && !/Android/i.test(ua)) setOs("linux");
  }, []);
  return os;
}

function WindowsGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="currentColor">
      <path d="M0 2.3 6.5 1.4v6.2H0zM7.3 1.3 16 0v7.6H7.3zM0 8.4h6.5v6.2L0 13.7zM7.3 8.4H16V16l-8.7-1.2z" />
    </svg>
  );
}
function LinuxGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2c-2.2 0-3.6 1.9-3.6 4.5 0 1.3.3 2.3-.6 3.6C6.5 12 5 14 5 16.4c0 .7.2 1.3.5 1.8-.6.5-1.5 1-1.5 1.8 0 1.2 2 1.4 3.3 1.8 1.1.4 2 .9 3.1.9.8 0 1.4-.3 1.6-.8.2.5.8.8 1.6.8 1.1 0 2-.5 3.1-.9 1.3-.4 3.3-.6 3.3-1.8 0-.8-.9-1.3-1.5-1.8.3-.5.5-1.1.5-1.8 0-2.4-1.5-4.4-2.8-6.3-.9-1.3-.6-2.3-.6-3.6C15.6 3.9 14.2 2 12 2z" />
    </svg>
  );
}

/** "Download for Windows" (or Linux): straight to the newest installer. */
export function DownloadButton({ size = "md", tone = "fire", className = "" }: { size?: "sm" | "md"; tone?: "fire" | "line"; className?: string }) {
  const os = useOs();
  return (
    <a
      href={os === "linux" ? site.downloadLinux : site.downloadWindows}
      className={`btn ${tone === "fire" ? "btn-fire" : "btn-line"} ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      {os === "linux" ? <LinuxGlyph className="size-4" /> : <WindowsGlyph className="size-[14px]" />}
      Download for {os === "linux" ? "Linux" : "Windows"}
    </a>
  );
}

/** A section's heading block: eyebrow, serif heading, optional lede; centred unless `align="left"`. */
export function Heading({ eyebrow, icon, children, lede, align = "center", size = "lg", className = "" }: { eyebrow?: string; icon?: ReactNode; children: ReactNode; lede?: ReactNode; align?: "center" | "left"; size?: "lg" | "md"; className?: string }) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && (
        <p className="eyebrow mb-5">
          {icon}
          {eyebrow}
        </p>
      )}
      <h2 className={`display ${size === "lg" ? "display-lg" : "display-md"}`}>{children}</h2>
      {lede && <p className={`lede mt-6 ${align === "center" ? "mx-auto" : ""} max-w-xl`}>{lede}</p>}
    </div>
  );
}
