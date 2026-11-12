import { circle, rr } from "../geometry";
import type { IconDef } from "../types";

export const trash: IconDef = {
  name: "trash",
  title: "Delete",
  category: "actions",
  tags: ["trash", "bin", "remove", "delete"],
  motionNote: "The lid lifts and tips while the can settles.",
  parts: [
    {
      p: "can",
      role: "body",
      d: "M6 7.25 L6.85 18.6 a2 2 0 0 0 2 1.85 h6.3 a2 2 0 0 0 2 -1.85 L18 7.25",
      area: "M6 7.25 L6.85 18.6 a2 2 0 0 0 2 1.85 h6.3 a2 2 0 0 0 2 -1.85 L18 7.25 Z",
    },
    { p: "can", role: "detail", d: "M10 11 V16.5 M14 11 V16.5" },
    { p: "lid", d: "M4 7.25 H20 M9 7.25 V5.25 a1.5 1.5 0 0 1 1.5 -1.5 h3 a1.5 1.5 0 0 1 1.5 1.5 V7.25" },
  ],
  motion: {
    lid: { origin: "100% 100%", to: { transform: "translateY(-1.6px) rotate(12deg)" } },
    can: { origin: "50% 100%", to: { transform: "scaleY(.97)" }, delay: 40 },
  },
};

export const download: IconDef = {
  name: "download",
  title: "Download",
  category: "actions",
  tags: ["save", "export", "arrow down", "get"],
  motionNote: "The arrow drops into the tray, which gives a little.",
  parts: [
    { p: "arrow", d: "M12 3.75 V14 M7.75 10 L12 14.25 L16.25 10" },
    {
      p: "tray",
      role: "body",
      d: "M4 16.25 V18 a2.5 2.5 0 0 0 2.5 2.5 h11 A2.5 2.5 0 0 0 20 18 V16.25",
      area: "M4 16.75 V18 a2.5 2.5 0 0 0 2.5 2.5 h11 A2.5 2.5 0 0 0 20 18 V16.75 Z",
    },
  ],
  motion: {
    arrow: { animation: "mi-drop .7s cubic-bezier(.22,1,.36,1)" },
    tray: { origin: "50% 100%", animation: "mi-give .7s cubic-bezier(.22,1,.36,1)" },
  },
  keyframes:
    "@keyframes mi-drop{35%{transform:translateY(3.5px);opacity:0}36%{transform:translateY(-5px);opacity:0}100%{transform:none;opacity:1}}\n@keyframes mi-give{30%{transform:none}42%{transform:scaleY(.82)}62%{transform:none}}",
};

export const upload: IconDef = {
  name: "upload",
  title: "Upload",
  category: "actions",
  tags: ["import", "send", "arrow up", "share"],
  motionNote: "The arrow lifts out of the tray and comes back in.",
  parts: [
    { p: "arrow", d: "M12 14.25 V4 M7.75 8 L12 3.75 L16.25 8" },
    {
      p: "tray",
      role: "body",
      d: "M4 16.25 V18 a2.5 2.5 0 0 0 2.5 2.5 h11 A2.5 2.5 0 0 0 20 18 V16.25",
      area: "M4 16.75 V18 a2.5 2.5 0 0 0 2.5 2.5 h11 A2.5 2.5 0 0 0 20 18 V16.75 Z",
    },
  ],
  motion: {
    arrow: { animation: "mi-rise .7s cubic-bezier(.22,1,.36,1)" },
  },
  keyframes: "@keyframes mi-rise{35%{transform:translateY(-3.5px);opacity:0}36%{transform:translateY(5px);opacity:0}100%{transform:none;opacity:1}}",
};

export const copy: IconDef = {
  name: "copy",
  title: "Copy",
  category: "actions",
  tags: ["duplicate", "clipboard", "clone"],
  motionNote: "The sheets fan apart.",
  parts: [
    { p: "back", d: "M15.5 8.25 V6 a2.5 2.5 0 0 0 -2.5 -2.5 H6 A2.5 2.5 0 0 0 3.5 6 v7 a2.5 2.5 0 0 0 2.5 2.5 H8.25" },
    { p: "front", role: "body", d: rr(8.5, 8.5, 12, 12, 2.75) },
  ],
  motion: {
    back: { to: { transform: "translate(-1.6px,-1.6px)" } },
    front: { to: { transform: "translate(1.4px,1.4px)" }, delay: 30 },
  },
};

export const refresh: IconDef = {
  name: "refresh",
  title: "Refresh",
  category: "actions",
  tags: ["reload", "sync", "update", "rotate", "retry"],
  motionNote: "One full turn, easing out.",
  parts: [{ d: "M20.25 12 a8.25 8.25 0 1 1 -2.42 -5.83 M20.5 4 V8 H16.5" }],
  motion: { root: { to: { transform: "rotate(360deg)" }, duration: 750, ease: "smooth" } },
};

export const plus: IconDef = {
  name: "plus",
  title: "Add",
  category: "actions",
  tags: ["add", "new", "create", "plus"],
  motionNote: "It turns a quarter and grows a touch.",
  parts: [{ d: "M12 5 V19 M5 12 H19" }],
  motion: { root: { to: { transform: "rotate(90deg) scale(1.08)" } } },
};

export const close: IconDef = {
  name: "close",
  title: "Close",
  category: "actions",
  tags: ["x", "dismiss", "cancel", "remove"],
  motionNote: "It turns a quarter while its arms draw in and back out.",
  parts: [{ p: "x", d: "M6 6 L18 18 M18 6 L6 18" }],
  motion: {
    root: { to: { transform: "rotate(90deg)" }, duration: 500 },
    x: { animation: "mi-arms .5s cubic-bezier(.22,1,.36,1)" },
  },
  keyframes: "@keyframes mi-arms{40%{transform:scale(.72)}}",
};

export const send: IconDef = {
  name: "send",
  title: "Send",
  category: "actions",
  tags: ["paper plane", "message", "submit", "share"],
  motionNote: "The plane flies off the corner and glides back in.",
  parts: [
    {
      p: "plane",
      role: "body",
      d: "M14.54 20.7 a.6.6 0 0 0 1.12 -.03 l5.53 -16.17 a.6.6 0 0 0 -.76 -.76 L4.26 9.27 a.6.6 0 0 0 -.03 1.12 l6.75 2.71 a1.9 1.9 0 0 1 1.06 1.06 Z",
    },
    { p: "plane", role: "detail", d: "M20.9 3.75 L11.2 13.45" },
  ],
  motion: { plane: { animation: "mi-fly .8s cubic-bezier(.22,1,.36,1)" } },
  keyframes: "@keyframes mi-fly{40%{transform:translate(7px,-7px) scale(.6);opacity:0}41%{transform:translate(-7px,7px) scale(.6);opacity:0}100%{transform:none;opacity:1}}",
};

export const arrowRight: IconDef = {
  name: "arrow-right",
  title: "Arrow right",
  category: "navigation",
  tags: ["next", "forward", "go", "continue"],
  motionNote: "It steps forward and its tip leads.",
  parts: [
    { p: "shaft", d: "M4.75 12 H18.75" },
    { p: "tip", d: "M13.25 6.5 L18.75 12 L13.25 17.5" },
  ],
  motion: {
    shaft: { origin: "0% 50%", to: { transform: "translateX(1px) scaleX(1.06)" } },
    tip: { to: { transform: "translateX(2px)" } },
  },
};

export const external: IconDef = {
  name: "external",
  title: "Open outside",
  category: "navigation",
  tags: ["external link", "new window", "open"],
  motionNote: "The arrow leaves the box and comes back.",
  parts: [
    { role: "body", d: "M18.5 13.5 V17.5 a2.5 2.5 0 0 1 -2.5 2.5 H6.5 A2.5 2.5 0 0 1 4 17.5 V8 a2.5 2.5 0 0 1 2.5 -2.5 H10.5", area: rr(4, 5.5, 14.5, 14.5, 2.5) },
    { p: "arrow", d: "M14.5 3.75 H20.25 V9.5 M20.25 3.75 L11.5 12.5" },
  ],
  motion: { arrow: { animation: "mi-out .7s cubic-bezier(.22,1,.36,1)" } },
  keyframes: "@keyframes mi-out{35%{transform:translate(3px,-3px);opacity:0}36%{transform:translate(-3px,3px);opacity:0}100%{transform:none;opacity:1}}",
};

export const checkCircle: IconDef = {
  name: "check-circle",
  title: "Done",
  category: "status",
  tags: ["success", "complete", "ok", "tick"],
  motionNote: "The ring swells and the tick draws itself.",
  parts: [
    { p: "ring", role: "body", d: circle(12, 12, 8.75) },
    { p: "tick", role: "detail", d: "M8.25 12.25 L10.9 14.9 L15.9 9.5" },
  ],
  motion: {
    ring: { to: { transform: "scale(1.06)" } },
    tick: { from: { strokeDasharray: 16 }, animation: "mi-draw .45s cubic-bezier(.22,1,.36,1) .06s backwards" },
  },
  keyframes: "@keyframes mi-draw{from{stroke-dashoffset:16}to{stroke-dashoffset:0}}",
};
