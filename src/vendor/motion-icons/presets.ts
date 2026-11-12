import type { IconDef } from "./types";

/**
 * Motions any icon can take, for icons without a motion of their own: each a small, purposeful movement in the same
 * spring-in, smooth-out feel. `parts` is how many parts the icon has (p0, p1, …), for the ones that move part by part.
 */
export type Preset =
  | "pop"
  | "nudge-right"
  | "nudge-left"
  | "nudge-up"
  | "nudge-down"
  | "wiggle"
  | "swing"
  | "spin-90"
  | "spin-180"
  | "spin"
  | "spin-back"
  | "tilt"
  | "bounce"
  | "float"
  | "shake"
  | "blink"
  | "flash"
  | "launch"
  | "pulse"
  | "wave"
  | "draw"
  | "none";

const SMOOTH = "cubic-bezier(.22,1,.36,1)";
const SPRING = "cubic-bezier(.34,1.56,.64,1)";

type Motion = Pick<IconDef, "motion" | "keyframes">;

export function preset(name: Preset, parts = 1): Motion {
  switch (name) {
    case "pop":
      return { motion: { root: { to: { transform: "scale(1.14)" } } } };
    case "nudge-right":
      return { motion: { root: { to: { transform: "translateX(2px)" } } } };
    case "nudge-left":
      return { motion: { root: { to: { transform: "translateX(-2px)" } } } };
    case "nudge-up":
      return { motion: { root: { to: { transform: "translateY(-2px)" } } } };
    case "nudge-down":
      return { motion: { root: { to: { transform: "translateY(2px)" } } } };
    case "float":
      return { motion: { root: { to: { transform: "translateY(-1.8px)" } } } };
    case "tilt":
      return { motion: { root: { to: { transform: "rotate(-8deg) scale(1.05)" } } } };
    case "spin-90":
      return { motion: { root: { to: { transform: "rotate(90deg)" }, duration: 600, ease: "smooth" } } };
    case "spin-180":
      return { motion: { root: { to: { transform: "rotate(180deg)" }, duration: 650, ease: "smooth" } } };
    case "spin":
      return { motion: { root: { to: { transform: "rotate(360deg)" }, duration: 750, ease: "smooth" } } };
    case "spin-back":
      return { motion: { root: { to: { transform: "rotate(-360deg)" }, duration: 750, ease: "smooth" } } };
    case "wiggle":
      return {
        motion: { root: { animation: `mi-wiggle .6s ${SMOOTH}` } },
        keyframes: "@keyframes mi-wiggle{20%{transform:rotate(-10deg)}40%{transform:rotate(9deg)}60%{transform:rotate(-6deg)}80%{transform:rotate(3deg)}100%{transform:none}}",
      };
    case "swing":
      return {
        motion: { root: { origin: "50% 15%", animation: `mi-swing .7s ${SMOOTH}` } },
        keyframes: "@keyframes mi-swing{20%{transform:rotate(16deg)}45%{transform:rotate(-10deg)}70%{transform:rotate(5deg)}100%{transform:none}}",
      };
    case "bounce":
      return {
        motion: { root: { animation: `mi-bounce .65s ${SMOOTH}` } },
        keyframes: "@keyframes mi-bounce{30%{transform:translateY(-3px)}55%{transform:none}75%{transform:translateY(-1px)}100%{transform:none}}",
      };
    case "shake":
      return {
        motion: { root: { animation: `mi-shake .5s ${SMOOTH}` } },
        keyframes: "@keyframes mi-shake{15%{transform:translateX(-1.6px)}35%{transform:translateX(1.4px)}55%{transform:translateX(-1px)}75%{transform:translateX(.6px)}100%{transform:none}}",
      };
    case "blink":
      return {
        motion: { root: { animation: `mi-blink .45s ${SMOOTH}` } },
        keyframes: "@keyframes mi-blink{40%{transform:scaleY(.12)}100%{transform:none}}",
      };
    case "flash":
      return {
        motion: { root: { animation: `mi-flash .7s ${SPRING}` } },
        keyframes: "@keyframes mi-flash{25%{opacity:.35;transform:scale(.9)}55%{opacity:1;transform:scale(1.1)}100%{transform:none}}",
      };
    case "launch":
      return {
        motion: { root: { animation: `mi-launch .85s ${SMOOTH}` } },
        keyframes: "@keyframes mi-launch{40%{transform:translate(4px,-4px);opacity:0}41%{transform:translate(-4px,4px);opacity:0}100%{transform:none;opacity:1}}",
      };
    case "pulse":
      return {
        motion: { root: { animation: `mi-pulse2 .7s ${SPRING}` } },
        keyframes: "@keyframes mi-pulse2{30%{transform:scale(1.12)}60%{transform:scale(.97)}100%{transform:none}}",
      };
    case "wave": {
      const motion: NonNullable<IconDef["motion"]> = {};
      for (let i = 0; i < parts; i++) motion[`p${i}`] = { animation: `mi-wave .7s ${SMOOTH} ${i * 70}ms` };
      return { motion, keyframes: "@keyframes mi-wave{40%{transform:translateX(2px)}100%{transform:none}}" };
    }
    case "draw": {
      // every part draws itself in, one after another (parts are given pathLength 1)
      const motion: NonNullable<IconDef["motion"]> = {};
      for (let i = 0; i < parts; i++) motion[`p${i}`] = { from: { strokeDasharray: 1 }, animation: `mi-trace .5s ${SMOOTH} ${i * 60}ms backwards` };
      return { motion, keyframes: "@keyframes mi-trace{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}" };
    }
    case "none":
      return { motion: {} };
  }
}
