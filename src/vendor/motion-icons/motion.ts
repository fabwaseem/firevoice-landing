import type { Decl, IconDef, PartMotion } from "./types";

/**
 * The motion system. Every moving part arrives with a little spring and leaves calmly (never bouncing on the way out),
 * parts follow each other by a few tens of milliseconds, and movements stay small (1–2 units of a 24 grid).
 * Everything is CSS, so the same motion plays in React, in a standalone SVG and in plain HTML.
 */
export const TOKENS = {
  /** way in: with a little overshoot */
  springIn: "cubic-bezier(.34,1.56,.64,1)",
  /** way in for turns and sweeps, and every way out: no overshoot */
  smooth: "cubic-bezier(.22,1,.36,1)",
  durationIn: 460,
  durationOut: 260,
  /** the duotone fill at rest and while active */
  toneRest: 0.12,
  toneActive: 0.22,
} as const;

const css = (d?: Decl): string => {
  if (!d) return "";
  const out: string[] = [];
  if (d.transform !== undefined) out.push(`transform:${d.transform}`);
  if (d.opacity !== undefined) out.push(`opacity:${d.opacity}`);
  if (d.d !== undefined) out.push(`d:${d.d}`);
  if (d.strokeDasharray !== undefined) out.push(`stroke-dasharray:${d.strokeDasharray}`);
  if (d.strokeDashoffset !== undefined) out.push(`stroke-dashoffset:${d.strokeDashoffset}`);
  return out.join(";");
};

/** What an icon moves with when pointed at or focused: anything marked `mi-trigger`, and the controls icons sit in. */
export const TRIGGERS = `:is(.mi-trigger,button,a,summary,[role="button"],[role="tab"],[role="menuitem"],[role="option"],[role="checkbox"],[role="radio"],[role="switch"])`;

/** Where an icon is active: pointed at or focused (itself, or the control around it), or set active. */
function active(icon: string, inner: string): string {
  const svg = `svg.mi[data-icon="${icon}"]`;
  return [
    `${TRIGGERS}:is(:hover,:focus-visible) ${svg}[data-trigger="hover"]${inner}`,
    `${svg}[data-trigger="hover"]:hover${inner}`,
    `${svg}[data-active="true"]:not([data-trigger="none"])${inner}`,
  ].join(",\n");
}

/** What every icon shares: the box, the duotone fill, the way parts move, and calm for reduced motion. */
export function baseCss(): string {
  const t = TOKENS;
  return `
svg.mi{overflow:visible;--mi-tone:${t.toneRest};flex-shrink:0}
svg.mi [data-p]{transform-box:fill-box;transform-origin:center;transition-property:transform,opacity,d,stroke-dashoffset;transition-duration:var(--mi-out,${t.durationOut}ms);transition-timing-function:${t.smooth}}
svg.mi .mi-tone{fill:currentColor;stroke:none;fill-opacity:var(--mi-tone);transition:fill-opacity .25s ${t.smooth}}
${TRIGGERS}:is(:hover,:focus-visible) svg.mi[data-trigger="hover"],svg.mi[data-trigger="hover"]:hover,svg.mi[data-active="true"]:not([data-trigger="none"]){--mi-tone:${t.toneActive}}
${TRIGGERS}:is(:hover,:focus-visible) svg.mi[data-trigger="hover"] [data-p],svg.mi[data-trigger="hover"]:hover [data-p],svg.mi[data-active="true"]:not([data-trigger="none"]) [data-p]{transition-duration:var(--mi-in,${t.durationIn}ms);transition-timing-function:var(--mi-ease,${t.springIn});transition-delay:var(--mi-delay,0ms)}
@media (prefers-reduced-motion:reduce){svg.mi [data-p]{transition:none!important;animation:none!important}}
`.trim();
}

/** One icon's motion, as CSS. */
export function iconCss(def: IconDef): string {
  const out: string[] = [];
  for (const [part, m] of Object.entries(def.motion ?? {})) out.push(partCss(def.name, part, m));
  if (def.keyframes) out.push(def.keyframes.trim());
  return out.join("\n");
}

function partCss(icon: string, part: string, m: PartMotion): string {
  const sel = ` [data-p="${part}"]`;
  const rest: string[] = [];
  if (m.origin) rest.push(`transform-origin:${m.origin}`);
  if (m.box) rest.push(`transform-box:${m.box}`);
  const from = css(m.from);
  if (from) rest.push(from);
  const on: string[] = [];
  const to = css(m.to);
  if (to) on.push(to);
  if (m.animation) on.push(`animation:${m.animation}`);
  if (m.delay) on.push(`--mi-delay:${m.delay}ms`);
  if (m.duration) on.push(`--mi-in:${m.duration}ms`);
  if (m.ease === "smooth") on.push(`--mi-ease:${TOKENS.smooth}`);
  const lines: string[] = [];
  if (rest.length) lines.push(`svg.mi[data-icon="${icon}"]${sel}{${rest.join(";")}}`);
  if (on.length) lines.push(`${active(icon, sel)}{${on.join(";")}}`);
  return lines.join("\n");
}

/** All the CSS for these icons (the base once). */
export function stylesheet(defs: IconDef[]): string {
  return [baseCss(), ...defs.map(iconCss)].join("\n");
}
