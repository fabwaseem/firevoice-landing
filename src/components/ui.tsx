import type { ReactNode, SVGProps } from "react";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <defs>
        <linearGradient id="fv-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a4c" />
          <stop offset="1" stopColor="#ff4d2e" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#fv-g)" />
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

export function WindowsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3 5.1 10.4 4v7.2H3V5.1Zm0 13.8 7.4 1.1v-7.1H3v6Zm8.3 1.2L21 21.5v-8.6h-9.7v7.2Zm0-16.2v7.3H21V2.5l-9.7 1.4Z" />
    </svg>
  );
}

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  children,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="h-section mt-4 text-balance">{title}</h2>
      {children && <p className="mt-5 text-pretty text-[17px] leading-relaxed text-muted sm:text-lg">{children}</p>}
    </div>
  );
}

/** decorative audio bars, static: one SVG path, so a long waveform costs one element instead of dozens */
export function Bars({
  n = 32,
  className = "",
  seed = 1,
  heights,
}: {
  n?: number;
  className?: string;
  seed?: number;
  heights?: number[];
}) {
  const hs =
    heights ??
    Array.from({ length: n }, (_, i) => 0.18 + Math.abs(Math.sin(i * 1.7 * seed) * 0.6 + Math.sin(i * 0.45 + seed) * 0.4) * 0.82);
  const step = 6;
  const d = hs
    .map((h, i) => {
      const x = i * step + 1.5;
      const half = Math.min(1, h) * 48;
      return `M${x} ${(50 - half).toFixed(1)}V${(50 + half).toFixed(1)}`;
    })
    .join("");
  return (
    <svg
      className={`block w-full min-w-0 ${className}`}
      viewBox={`0 0 ${hs.length * step - 3} 100`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={d} stroke="currentColor" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" fill="none" />
    </svg>
  );
}
