import { circle, rr } from "../geometry";
import type { IconDef } from "../types";

const GEAR =
  "M12.22 2.5h-.44a1.9 1.9 0 0 0-1.9 1.9v.17a1.9 1.9 0 0 1-.95 1.64l-.41.24a1.9 1.9 0 0 1-1.9 0l-.14-.08a1.9 1.9 0 0 0-2.6.7l-.21.36a1.9 1.9 0 0 0 .7 2.6l.14.09a1.9 1.9 0 0 1 .95 1.64v.48a1.9 1.9 0 0 1-.95 1.65l-.14.08a1.9 1.9 0 0 0-.7 2.6l.21.36a1.9 1.9 0 0 0 2.6.7l.14-.08a1.9 1.9 0 0 1 1.9 0l.41.24a1.9 1.9 0 0 1 .95 1.64v.17a1.9 1.9 0 0 0 1.9 1.9h.44a1.9 1.9 0 0 0 1.9-1.9v-.17a1.9 1.9 0 0 1 .95-1.64l.41-.24a1.9 1.9 0 0 1 1.9 0l.14.08a1.9 1.9 0 0 0 2.6-.7l.21-.37a1.9 1.9 0 0 0-.7-2.6l-.14-.08a1.9 1.9 0 0 1-.95-1.65v-.47a1.9 1.9 0 0 1 .95-1.65l.14-.09a1.9 1.9 0 0 0 .7-2.6l-.21-.36a1.9 1.9 0 0 0-2.6-.7l-.14.08a1.9 1.9 0 0 1-1.9 0l-.41-.24a1.9 1.9 0 0 1-.95-1.64V4.4a1.9 1.9 0 0 0-1.9-1.9z";

export const home: IconDef = {
  name: "home",
  title: "Home",
  category: "app",
  tags: ["house", "start", "dashboard"],
  motionNote: "The roof lifts and the arched door opens.",
  parts: [
    {
      p: "walls",
      role: "body",
      d: "M5.75 9.25 V17.75 a2.5 2.5 0 0 0 2.5 2.5 h7.5 a2.5 2.5 0 0 0 2.5 -2.5 V9.25",
      area: "M5.75 9.75 L12 4.75 L18.25 9.75 V17.75 a2.5 2.5 0 0 1 -2.5 2.5 h-7.5 a2.5 2.5 0 0 1 -2.5 -2.5 Z",
    },
    { p: "roof", d: "M3.75 10.75 L10.6 5.05 a2.2 2.2 0 0 1 2.8 0 L20.25 10.75" },
    { p: "door", role: "detail", d: "M10 20.25 V16.5 a2 2 0 0 1 4 0 V20.25" },
  ],
  motion: {
    roof: { to: { transform: "translateY(-1.6px)" } },
    door: { origin: "50% 100%", to: { transform: "scaleY(1.22)" }, delay: 50 },
  },
};

export const mic: IconDef = {
  name: "mic",
  title: "Microphone",
  category: "app",
  tags: ["dictation", "record", "voice", "speak"],
  motionNote: "It rises and sends out sound in two waves.",
  parts: [
    { p: "cap", role: "body", d: rr(9, 3, 6, 11, 3) },
    { p: "cap", role: "detail", d: "M11.25 6.75 H12.75" },
    { d: "M5.75 11 a6.25 6.25 0 0 0 12.5 0" },
    { d: "M12 17.25 V20.5 M9.25 20.5 H14.75" },
    { p: "wave-l", d: "M2.75 9.25 a6 6 0 0 0 0 3.5" },
    { p: "wave-r", d: "M21.25 9.25 a6 6 0 0 1 0 3.5" },
    { p: "wave-l2", d: "M.25 8 a9 9 0 0 0 0 6" },
    { p: "wave-r2", d: "M23.75 8 a9 9 0 0 1 0 6" },
  ],
  motion: {
    cap: { to: { transform: "translateY(-1.2px)" } },
    "wave-l": { from: { opacity: 0, transform: "translateX(2.5px) scale(.7)" }, to: { opacity: 1, transform: "none" } },
    "wave-r": { from: { opacity: 0, transform: "translateX(-2.5px) scale(.7)" }, to: { opacity: 1, transform: "none" } },
    "wave-l2": { from: { opacity: 0, transform: "translateX(2.5px) scale(.7)" }, to: { opacity: 1, transform: "none" }, delay: 80 },
    "wave-r2": { from: { opacity: 0, transform: "translateX(-2.5px) scale(.7)" }, to: { opacity: 1, transform: "none" }, delay: 80 },
  },
};

export const speak: IconDef = {
  name: "speak",
  title: "Speak",
  category: "app",
  tags: ["audio", "waveform", "equalizer", "voice", "tts"],
  motionNote: "The rounded bars move like a voice while it is pointed at.",
  parts: [
    { p: "bar1", d: "M4.5 10.25 V13.75" },
    { p: "bar2", d: "M8.25 6.75 V17.25" },
    { p: "bar3", d: "M12 3.75 V20.25" },
    { p: "bar4", d: "M15.75 7.75 V16.25" },
    { p: "bar5", d: "M19.5 10.5 V13.5" },
  ],
  stroke: 2.25,
  motion: {
    bar1: { animation: "mi-eq .9s cubic-bezier(.45,0,.55,1) -.3s infinite" },
    bar2: { animation: "mi-eq .9s cubic-bezier(.45,0,.55,1) -.18s infinite" },
    bar3: { animation: "mi-eq .9s cubic-bezier(.45,0,.55,1) -.42s infinite" },
    bar4: { animation: "mi-eq .9s cubic-bezier(.45,0,.55,1) -.6s infinite" },
    bar5: { animation: "mi-eq .9s cubic-bezier(.45,0,.55,1) -.1s infinite" },
  },
  keyframes: "@keyframes mi-eq{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.42)}}",
};

export const voices: IconDef = {
  name: "voices",
  title: "Voices",
  category: "app",
  tags: ["voice", "speaker", "person", "talk", "library", "tts"],
  motionNote: "The head lifts as if to speak, and the sound waves ripple out one after the other.",
  parts: [
    // a person: the head and the shoulders are bodies, so duotone and filled give them a soft or solid fill
    { p: "head", role: "body", d: circle(8.75, 8, 3.5) },
    { p: "torso", role: "body", d: "M3.25 19.75 C3.25 16.4 5.7 14.25 8.75 14.25 C11.8 14.25 14.25 16.4 14.25 19.75 Z" },
    // the voice: two arcs from the mouth, the outer one larger
    { p: "w1", d: "M16.6 7.6 a2.9 2.9 0 0 1 0 4.8" },
    { p: "w2", d: "M19.2 5.2 a6.2 6.2 0 0 1 0 9.6" },
  ],
  motion: {
    head: { to: { transform: "translateY(-0.8px) rotate(-4deg)" }, origin: "50% 100%" },
    torso: { to: { transform: "translateY(-0.3px)" } },
    // each wave comes back in from the mouth and settles a touch further out; the outer one follows
    w1: { origin: "0% 50%", animation: "mi-voices-wave .62s cubic-bezier(.22,1,.36,1) 40ms both" },
    w2: { origin: "0% 50%", animation: "mi-voices-wave .62s cubic-bezier(.22,1,.36,1) 130ms both" },
  },
  keyframes:
    "@keyframes mi-voices-wave{0%{opacity:.15;transform:translateX(-2.2px) scale(.82)}55%{opacity:1;transform:translateX(.9px) scale(1.04)}100%{opacity:1;transform:translateX(.5px)}}",
};

export const dictionary: IconDef = {
  name: "dictionary",
  title: "Dictionary",
  category: "app",
  tags: ["book", "words", "read", "open book"],
  motionNote: "The book opens wider and a page turns.",
  parts: [
    {
      role: "body",
      area: "M12 6.4 C10 5 7.2 4.5 4 4.9 a1 1 0 0 0 -.85 1 V17.6 a1 1 0 0 0 1.12 1 C7.3 18.2 10 18.8 12 20.2 C14 18.8 16.7 18.2 19.73 18.6 a1 1 0 0 0 1.12 -1 V5.9 a1 1 0 0 0 -.85 -1 C16.8 4.5 14 5 12 6.4 Z",
    },
    { p: "left", d: "M12 6.4 C10 5 7.2 4.5 4 4.9 a1 1 0 0 0 -.85 1 V17.6 a1 1 0 0 0 1.12 1 C7.3 18.2 10 18.8 12 20.2" },
    { p: "right", d: "M12 6.4 C14 5 16.8 4.5 20 4.9 a1 1 0 0 1 .85 1 V17.6 a1 1 0 0 1 -1.12 1 C16.7 18.2 14 18.8 12 20.2" },
    { role: "detail", d: "M12 6.4 V20.2" },
    { p: "page", role: "detail", d: "M12 6.8 C13.8 5.7 16 5.4 18.5 5.6 V16.8 C16 16.7 13.8 17.2 12 18.4" },
  ],
  motion: {
    left: { origin: "100% 50%", to: { transform: "rotate(-4deg) scaleX(1.05)" } },
    right: { origin: "0% 50%", to: { transform: "rotate(4deg) scaleX(1.05)" } },
    page: { origin: "0% 50%", from: { opacity: 0 }, animation: "mi-turn .7s cubic-bezier(.22,1,.36,1) .05s" },
  },
  keyframes: "@keyframes mi-turn{0%{opacity:1;transform:scaleX(1)}60%{opacity:1;transform:scaleX(-1)}100%{opacity:0;transform:scaleX(-1)}}",
};

export const history: IconDef = {
  name: "history",
  title: "History",
  category: "app",
  tags: ["clock", "time", "recent", "undo", "past"],
  motionNote: "It winds back while the hands sweep a full turn backwards.",
  parts: [
    { role: "body", area: circle(12, 12, 8.25) },
    { p: "ring", d: "M3.75 12 a8.25 8.25 0 1 0 2.42 -5.83 M3.5 4 V8 H7.5" },
    { p: "hands", role: "detail", d: "M12 7.75 V12 L14.75 13.75" },
  ],
  motion: {
    ring: { box: "view-box", origin: "12px 12px", to: { transform: "rotate(-35deg)" } },
    hands: { box: "view-box", origin: "12px 12px", to: { transform: "rotate(-360deg)" }, duration: 700, ease: "smooth" },
  },
};

export const settings: IconDef = {
  name: "settings",
  title: "Settings",
  category: "app",
  tags: ["gear", "cog", "preferences", "options"],
  motionNote: "The gear turns a sixth while its hub breathes.",
  parts: [
    { p: "teeth", role: "body", d: GEAR },
    { p: "hub", role: "detail", d: circle(12, 12, 2.75) },
  ],
  motion: {
    teeth: { to: { transform: "rotate(60deg)" }, duration: 600 },
    hub: { to: { transform: "scale(.82)" } },
  },
};

export const search: IconDef = {
  name: "search",
  title: "Search",
  category: "app",
  tags: ["find", "magnifier", "lens", "look"],
  motionNote: "The lens leans in and a glint crosses it.",
  parts: [
    { role: "body", d: circle(10.75, 10.75, 6.5) },
    { d: "M15.6 15.6 L20.25 20.25" },
    { p: "glint", role: "detail", d: "M8 8.5 a3.5 3.5 0 0 1 2.5 -1.6" },
  ],
  motion: {
    root: { to: { transform: "rotate(-10deg) scale(1.06)" } },
    glint: { from: { opacity: 0 }, to: { opacity: 1 }, delay: 80 },
  },
};
