import { Fragment, type CSSProperties, type ReactElement, type SVGProps } from "react";
import type { IconDef, Part, Trigger, Variant } from "./types";

export interface DrawOptions {
  variant?: Variant;
  /** pixels (the icon is square) */
  size?: number;
  /** stroke at this size; by default the icon's own (1.75 on the 24 grid), kept visually the same at any size */
  strokeWidth?: number;
  trigger?: Trigger;
  active?: boolean;
  /** a unique id for the filled style's cut-outs (several icons on a page) */
  uid?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /** any other attributes for the <svg> (aria-*, data-*, event handlers) */
  svgProps?: Omit<SVGProps<SVGSVGElement>, "ref" | "children">;
}

/** The icon as SVG elements. The same function draws for React and for the exports. */
export function draw(def: IconDef, o: DrawOptions = {}): ReactElement {
  const grid = def.grid ?? 24;
  const variant: Variant = def.variants && !def.variants.includes(o.variant ?? "outline") ? def.variants[0] : (o.variant ?? "outline");
  const size = o.size ?? grid;
  const sw = o.strokeWidth ?? def.stroke ?? (grid === 24 ? 1.75 : 1.2);
  const mask = `mi-${def.name}-${o.uid ?? "0"}`;
  const parts = def.parts;

  const stroke = (pt: Part, k: string | number, extra: Record<string, unknown> = {}) =>
    pt.d ? <path key={k} data-p={pt.p} d={pt.d} pathLength={pt.draw ? 1 : undefined} {...extra} /> : null;
  const solid = (pt: Part, k: string | number) => <path key={k} data-p={pt.p} d={pt.area ?? pt.d} fill="currentColor" />;

  let body: ReactElement;
  if (variant === "filled") {
    const bodies = parts.filter((p) => p.role === "body");
    const details = parts.filter((p) => p.role === "detail");
    const lines = parts.filter((p) => !p.role || p.role === "line");
    body = (
      <>
        {details.length > 0 && (
          <mask id={mask} maskUnits="userSpaceOnUse" x={-grid} y={-grid} width={grid * 3} height={grid * 3}>
            <rect x={-grid} y={-grid} width={grid * 3} height={grid * 3} fill="#fff" />
            {details.map((pt, i) => stroke(pt, i, { stroke: "#000", strokeWidth: sw + 0.5 }))}
          </mask>
        )}
        <g mask={details.length ? `url(#${mask})` : undefined}>{bodies.map((pt, i) => <Fragment key={i}>{solid(pt, "f")}{stroke(pt, "s")}</Fragment>)}</g>
        {lines.map((pt, i) => (pt.solid ? solid(pt, i) : stroke(pt, i)))}
      </>
    );
  } else {
    body = (
      <>
        {variant === "duotone" &&
          parts.filter((p) => p.role === "body").map((pt, i) => <path key={`t${i}`} className="mi-tone" data-p={pt.p} d={pt.area ?? pt.d} />)}
        {parts.map((pt, i) => (pt.solid ? solid(pt, i) : stroke(pt, i)))}
      </>
    );
  }

  const root = def.motion?.root ? <g data-p="root">{body}</g> : body;
  return (
    <svg
      {...o.svgProps}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${grid} ${grid}`}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={["mi", o.className].filter(Boolean).join(" ")}
      style={o.style}
      data-icon={def.name}
      data-variant={variant}
      data-trigger={o.trigger ?? "hover"}
      data-active={o.active ? "true" : undefined}
      role={o.title ? "img" : undefined}
      aria-hidden={o.title || o.svgProps?.["aria-label"] ? undefined : true}
      aria-label={o.title ?? o.svgProps?.["aria-label"]}
    >
      {o.title && <title>{o.title}</title>}
      {root}
    </svg>
  );
}
