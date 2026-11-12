import type { IconDef } from "../types";

/** The window's own controls, on a 12 grid at a 1.2 stroke (drawn for 46 × 36 title bar buttons). */
const base = { category: "window" as const, grid: 12, stroke: 1.2, variants: ["outline" as const] };

export const windowMinimize: IconDef = {
  ...base,
  name: "window-minimize",
  title: "Minimize",
  tags: ["window", "minimise", "hide", "title bar"],
  motionNote: "The dash dips and bends into an arrow toward the taskbar.",
  parts: [{ p: "dash", d: "M2.5 6 L6 6 L9.5 6" }],
  motion: { dash: { to: { d: 'path("M3 4.75 L6 7.75 L9 4.75")', transform: "translateY(.6px)" } } },
};

export const windowMaximize: IconDef = {
  ...base,
  name: "window-maximize",
  title: "Maximize",
  tags: ["window", "maximise", "full screen", "title bar"],
  motionNote: "The rounded square opens into four corners that spread out.",
  parts: [
    { p: "k1", d: "M2.25 5.25 V3.85 A1.6 1.6 0 0 1 3.85 2.25 H5.25" },
    { p: "k2", d: "M6.75 2.25 H8.15 A1.6 1.6 0 0 1 9.75 3.85 V5.25" },
    { p: "k3", d: "M9.75 6.75 V8.15 A1.6 1.6 0 0 1 8.15 9.75 H6.75" },
    { p: "k4", d: "M5.25 9.75 H3.85 A1.6 1.6 0 0 1 2.25 8.15 V6.75" },
    { p: "mid", d: "M5.25 2.25 H6.75 M9.75 5.25 V6.75 M6.75 9.75 H5.25 M2.25 6.75 V5.25" },
  ],
  motion: {
    k1: { to: { transform: "translate(-1.1px,-1.1px)" } },
    k2: { to: { transform: "translate(1.1px,-1.1px)" } },
    k3: { to: { transform: "translate(1.1px,1.1px)" } },
    k4: { to: { transform: "translate(-1.1px,1.1px)" } },
    mid: { to: { opacity: 0 }, duration: 180, ease: "smooth" },
  },
};

export const windowRestore: IconDef = {
  ...base,
  name: "window-restore",
  title: "Restore",
  tags: ["window", "restore", "unmaximize", "title bar"],
  motionNote: "The back window folds into the front, which grows into one.",
  parts: [
    { p: "back", d: "M4.25 3.25 V3.1 A1.35 1.35 0 0 1 5.6 1.75 H8.9 A1.35 1.35 0 0 1 10.25 3.1 V6.4 A1.35 1.35 0 0 1 8.9 7.75 H8.75" },
    { p: "front", d: "M3.2 4.25 H6.8 A1.45 1.45 0 0 1 8.25 5.7 V9.3 A1.45 1.45 0 0 1 6.8 10.75 H3.2 A1.45 1.45 0 0 1 1.75 9.3 V5.7 A1.45 1.45 0 0 1 3.2 4.25 Z" },
  ],
  motion: {
    back: { to: { transform: "translate(-1.6px,1.6px)", opacity: 0 } },
    front: { to: { transform: "translate(.8px,-.8px) scale(1.14)" } },
  },
};

export const windowClose: IconDef = {
  ...base,
  name: "window-close",
  title: "Close window",
  tags: ["window", "close", "x", "quit", "title bar"],
  motionNote: "It turns a quarter while its arms draw in and back out.",
  parts: [{ p: "x", d: "M2.75 2.75 L9.25 9.25 M9.25 2.75 L2.75 9.25" }],
  motion: {
    root: { to: { transform: "rotate(90deg)" }, duration: 500 },
    x: { animation: "mi-arms .5s cubic-bezier(.22,1,.36,1)" },
  },
  keyframes: "@keyframes mi-arms{40%{transform:scale(.72)}}",
};
