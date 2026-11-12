import { circle } from "../geometry";
import type { IconDef } from "../types";

/**
 * Play and pause share their commands, so one morphs into the other. The triangle is one closed shape (so its outline
 * has no seam) and becomes the left bar; the second bar grows out of a point hidden at the triangle's tip.
 */
const PLAY = "M7.5 5.9 L7.5 18.1 L18.6 12 L18.6 12 Z M18.6 12 L18.6 12 L18.6 12 L18.6 12 Z";
const PAUSE = "M7 5.5 L7 18.5 L10 18.5 L10 5.5 Z M14 5.5 L14 18.5 L17 18.5 L17 5.5 Z";

export const play: IconDef = {
  name: "play",
  title: "Play / pause",
  category: "media",
  tags: ["play", "pause", "start", "resume", "audio"],
  motionNote: "The rounded triangle splits into two bars (set it active while playing).",
  // a body like any other: outline strokes it, duotone tints it, filled makes it solid (round joins round its corners)
  parts: [{ p: "shape", role: "body", d: PLAY }],
  motion: { shape: { to: { d: `path("${PAUSE}")` } } },
};

export const volume: IconDef = {
  name: "volume",
  title: "Volume",
  category: "media",
  tags: ["sound", "speaker", "audio", "loud"],
  motionNote: "The speaker pulses and its waves go out in turn.",
  parts: [
    {
      p: "speaker",
      role: "body",
      d: "M11 5.1 a.8.8 0 0 0 -1.37 -.57 L6.66 7.5 A1.6 1.6 0 0 1 5.53 8 H4 a1.25 1.25 0 0 0 -1.25 1.25 v5.5 A1.25 1.25 0 0 0 4 16 h1.53 a1.6 1.6 0 0 1 1.13 .47 l2.97 2.97 A.8.8 0 0 0 11 18.9 Z",
    },
    { p: "w1", d: "M15.25 9.25 a4.25 4.25 0 0 1 0 5.5" },
    { p: "w2", d: "M18.25 6.5 a8.25 8.25 0 0 1 0 11" },
  ],
  motion: {
    speaker: { origin: "100% 50%", to: { transform: "scale(1.06)" } },
    w1: { from: { opacity: 0.55 }, to: { opacity: 1, transform: "translateX(1px)" } },
    w2: { from: { opacity: 0.35 }, to: { opacity: 1, transform: "translateX(1.5px)" }, delay: 70 },
  },
};

export const bell: IconDef = {
  name: "bell",
  title: "Notifications",
  category: "status",
  tags: ["alert", "notify", "ring", "alarm"],
  motionNote: "It rings: the bell swings and the clapper follows.",
  parts: [
    {
      p: "bell",
      role: "body",
      d: "M6.25 10.75 a5.75 5.75 0 0 1 11.5 0 V14.6 a2 2 0 0 0 .44 1.25 l.86 1.07 a.6.6 0 0 1 -.47 .98 H5.42 a.6.6 0 0 1 -.47 -.98 l.86 -1.07 A2 2 0 0 0 6.25 14.6 Z",
    },
    { p: "bell", d: "M12 3 V5" },
    { p: "clapper", d: "M10 20.5 a2.25 2.25 0 0 0 4 0" },
  ],
  motion: {
    bell: { origin: "50% 0%", animation: "mi-ring .8s cubic-bezier(.36,0,.66,1)" },
    clapper: { origin: "50% -300%", animation: "mi-ring .8s cubic-bezier(.36,0,.66,1) .06s" },
  },
  keyframes: "@keyframes mi-ring{15%{transform:rotate(14deg)}35%{transform:rotate(-11deg)}55%{transform:rotate(7deg)}75%{transform:rotate(-3deg)}100%{transform:none}}",
};

export const heart: IconDef = {
  name: "heart",
  title: "Favorite",
  category: "status",
  tags: ["like", "love", "favourite", "save"],
  motionNote: "It beats twice.",
  parts: [
    {
      p: "heart",
      role: "body",
      d: "M12 20 C 12 20 3.5 15.2 3.5 9.2 A4.7 4.7 0 0 1 12 6.6 A4.7 4.7 0 0 1 20.5 9.2 C 20.5 15.2 12 20 12 20 Z",
    },
  ],
  motion: { heart: { animation: "mi-beat .8s cubic-bezier(.22,1,.36,1)" } },
  keyframes: "@keyframes mi-beat{20%{transform:scale(1.14)}40%{transform:scale(.98)}60%{transform:scale(1.1)}100%{transform:none}}",
};

export const star: IconDef = {
  name: "star",
  title: "Star",
  category: "status",
  tags: ["favorite", "rate", "bookmark", "important"],
  motionNote: "It turns a fifth and shines a moment larger.",
  parts: [
    {
      role: "body",
      d: "M11.5 3.06 a.55 .55 0 0 1 1 0 l2.28 4.62 a2.1 2.1 0 0 0 1.58 1.15 l5.1 .74 a.55 .55 0 0 1 .3 .94 l-3.69 3.6 a2.1 2.1 0 0 0 -.6 1.86 l.87 5.08 a.55 .55 0 0 1 -.8 .58 l-4.56 -2.4 a2.1 2.1 0 0 0 -1.96 0 l-4.56 2.4 a.55 .55 0 0 1 -.8 -.58 l.87 -5.08 a2.1 2.1 0 0 0 -.6 -1.86 l-3.69 -3.6 a.55 .55 0 0 1 .3 -.94 l5.1 -.74 a2.1 2.1 0 0 0 1.58 -1.15 Z",
    },
  ],
  motion: { root: { to: { transform: "rotate(72deg) scale(1.08)" }, duration: 600 } },
};

export const sparkles: IconDef = {
  name: "sparkles",
  title: "Sparkles",
  category: "status",
  tags: ["ai", "magic", "new", "assistant", "polish"],
  motionNote: "They twinkle in turn.",
  parts: [
    { p: "s1", role: "body", d: "M10 3.5 C10.6 7.6 12.4 9.4 16.5 10 C12.4 10.6 10.6 12.4 10 16.5 C9.4 12.4 7.6 10.6 3.5 10 C7.6 9.4 9.4 7.6 10 3.5 Z" },
    { p: "s2", d: "M18.5 3 V6.5 M16.75 4.75 H20.25" },
    { p: "s3", d: "M18 16.5 V20.5 M16 18.5 H20" },
  ],
  motion: {
    s1: { animation: "mi-twinkle .75s cubic-bezier(.34,1.56,.64,1)" },
    s2: { animation: "mi-twinkle .75s cubic-bezier(.34,1.56,.64,1) .1s" },
    s3: { animation: "mi-twinkle .75s cubic-bezier(.34,1.56,.64,1) .2s" },
  },
  keyframes: "@keyframes mi-twinkle{40%{transform:scale(.45) rotate(30deg)}100%{transform:none}}",
};

export const theme: IconDef = {
  name: "theme",
  title: "Light / dark",
  category: "status",
  tags: ["sun", "moon", "dark mode", "light mode", "appearance"],
  motionNote: "The rays draw in one by one and the sun becomes a moon.",
  parts: [
    { p: "core", role: "body", d: "M12 7.5 A4.5 4.5 0 1 1 12 16.5 A4.5 4.5 0 1 1 12 7.5 Z" },
    { p: "ray1", d: "M12 2.5 V3.75 M12 20.25 V21.5" },
    { p: "ray2", d: "M21.5 12 H20.25 M3.75 12 H2.5" },
    { p: "ray3", d: "M18.7 5.3 L17.85 6.15 M6.15 17.85 L5.3 18.7" },
    { p: "ray4", d: "M18.7 18.7 L17.85 17.85 M6.15 6.15 L5.3 5.3" },
  ],
  motion: {
    core: { to: { d: 'path("M14.5 4 A8 8 0 1 0 20 13.6 A6.2 6.2 0 0 1 14.5 4 Z")' } },
    ray1: { box: "view-box", origin: "12px 12px", to: { transform: "scale(.3)", opacity: 0 } },
    ray2: { box: "view-box", origin: "12px 12px", to: { transform: "scale(.3)", opacity: 0 }, delay: 25 },
    ray3: { box: "view-box", origin: "12px 12px", to: { transform: "scale(.3)", opacity: 0 }, delay: 50 },
    ray4: { box: "view-box", origin: "12px 12px", to: { transform: "scale(.3)", opacity: 0 }, delay: 75 },
  },
};

export const record: IconDef = {
  name: "record",
  title: "Record",
  category: "media",
  tags: ["rec", "capture", "live"],
  motionNote: "The dot pulses inside its ring.",
  parts: [
    { role: "line", d: circle(12, 12, 8.75) },
    // a body, so outline draws it as a ring, duotone tints it and filled makes it solid
    { p: "dot", role: "body", d: circle(12, 12, 4.25) },
  ],
  motion: { dot: { animation: "mi-pulse 1s cubic-bezier(.45,0,.55,1) infinite" } },
  keyframes: "@keyframes mi-pulse{50%{transform:scale(.72);opacity:.75}}",
};
