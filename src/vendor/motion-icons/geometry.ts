/** Path helpers: every shape is a path, so the three styles and the motion treat them all alike. */

const n = (v: number) => +v.toFixed(3);

/** A rounded rectangle. */
export function rr(x: number, y: number, w: number, h: number, r: number): string {
  r = Math.min(r, w / 2, h / 2);
  return [
    `M${n(x + r)} ${n(y)}`,
    `H${n(x + w - r)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}`,
    `V${n(y + h - r)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h)}`,
    `H${n(x + r)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + h - r)}`,
    `V${n(y + r)}`,
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}`,
    "Z",
  ].join(" ");
}

/** A rounded rectangle turned by `deg` around (cx, cy): arcs stay arcs, only their ends move. */
export function rrTurned(x: number, y: number, w: number, h: number, r: number, deg: number, cx: number, cy: number): string {
  const a = (deg * Math.PI) / 180;
  const t = (px: number, py: number) => {
    const dx = px - cx;
    const dy = py - cy;
    return `${n(cx + dx * Math.cos(a) - dy * Math.sin(a))} ${n(cy + dx * Math.sin(a) + dy * Math.cos(a))}`;
  };
  r = Math.min(r, w / 2, h / 2);
  const arc = (px: number, py: number) => `A${n(r)} ${n(r)} 0 0 1 ${t(px, py)}`;
  return [
    `M${t(x + r, y)}`,
    `L${t(x + w - r, y)}`,
    arc(x + w, y + r),
    `L${t(x + w, y + h - r)}`,
    arc(x + w - r, y + h),
    `L${t(x + r, y + h)}`,
    arc(x, y + h - r),
    `L${t(x, y + r)}`,
    arc(x + r, y),
    "Z",
  ].join(" ");
}

/** A circle, as two arcs. */
export function circle(cx: number, cy: number, r: number): string {
  return `M${n(cx - r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)} A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)} Z`;
}
