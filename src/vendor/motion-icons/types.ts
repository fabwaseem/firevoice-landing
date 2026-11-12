/** How an icon is drawn and how it moves. One drawing gives all three styles. */

export type Variant = "outline" | "filled" | "duotone";
export const VARIANTS: Variant[] = ["outline", "duotone", "filled"];

/**
 * What a part is to the icon's shape:
 * - body:   a closed shape. Outline: its stroke. Duotone: a soft fill plus the stroke. Filled: solid.
 * - detail: a line inside a body (a door, clock hands). Outline and duotone: a stroke. Filled: cut out of the body.
 * - line:   a stroke in every style (a roof edge, sound waves, a handle).
 */
export type Role = "body" | "detail" | "line";

export interface Part {
  /** the motion name: parts with the same name move together */
  p?: string;
  role?: Role;
  /** the stroked geometry (may be open); a body may leave it out and only fill `area` */
  d?: string;
  /** a body's closed area, for its fill (defaults to `d`) */
  area?: string;
  /** always drawn solid, whatever the style (equalizer bars, a play triangle) */
  solid?: boolean;
  /** a line that crosses a body (a slash, a power line, an arrow coming out of a cloud): the filled style cuts a gap
   * around it out of the body, so it stays visible on the solid shape */
  knock?: boolean;
  /** measured as length 1 (pathLength), so a motion can draw it in whatever its real length */
  draw?: boolean;
}

/** CSS a part has at rest (`from`) and while the icon is active (`to`). */
export interface Decl {
  transform?: string;
  opacity?: number;
  /** a path to morph into: `path("M…")`, with the same commands as the part's own */
  d?: string;
  strokeDasharray?: number;
  strokeDashoffset?: number;
}

export interface PartMotion {
  /** transform origin, in the part's own box ("50% 100%") or, with box "view-box", in icon units ("12px 12px") */
  origin?: string;
  box?: "fill-box" | "view-box";
  from?: Decl;
  to?: Decl;
  /** while active, a keyframe animation instead of (or besides) the transition: "mi-eq .9s ease-in-out infinite" */
  animation?: string;
  /** ms after the icon becomes active */
  delay?: number;
  /** ms for this part's way in (default from the motion tokens) */
  duration?: number;
  /** "spring" (default, with a little overshoot) or "smooth" (no overshoot: turns, sweeps) */
  ease?: "spring" | "smooth";
}

export type Category = "app" | "media" | "actions" | "status" | "window" | "navigation";

export interface IconDef {
  name: string;
  title: string;
  category: Category;
  tags: string[];
  /** a line on what the motion shows */
  motionNote: string;
  parts: Part[];
  /** motion by part name; "root" moves the whole icon */
  motion?: Record<string, PartMotion>;
  /** keyframes this icon's animations use (CSS) */
  keyframes?: string;
  /** units of the drawing grid (24, or 12 for the window controls) */
  grid?: number;
  /** stroke at the default size (1.75 on 24, 1.2 on the window controls) */
  stroke?: number;
  /** styles it comes in (window controls are outline only) */
  variants?: Variant[];
}

/** When an icon plays its motion. */
export type Trigger =
  /** when pointed at or focused: the icon itself, or the nearest element with the class `mi-trigger` (a button) */
  | "hover"
  /** over and over, by itself */
  | "loop"
  /** never on its own: set `active` */
  | "manual"
  /** no motion */
  | "none";
