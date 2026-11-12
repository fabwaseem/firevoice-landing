"use client";

import { useEffect, useId, useInsertionEffect, useState } from "react";
import { baseCss, iconCss } from "./motion";
import { draw, type DrawOptions } from "./render";
import type { IconDef } from "./types";

/** The CSS each icon needs, added to the page once, the first time the icon is drawn. */
const added = new Set<string>();
function useIconStyles(def: IconDef) {
  useInsertionEffect(() => {
    if (typeof document === "undefined" || added.has(def.name)) return;
    let tag = document.getElementById("motion-icons") as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "motion-icons";
      tag.textContent = baseCss();
      document.head.appendChild(tag);
    }
    tag.appendChild(document.createTextNode("\n" + iconCss(def)));
    added.add(def.name);
  }, [def]);
}

export interface MotionIconProps extends Omit<DrawOptions, "uid"> {
  icon: IconDef;
  /** "loop": how long one beat is (ms), its motion included */
  loopEvery?: number;
}

/**
 * An animated icon. By default it moves when pointed at or focused, itself or the nearest element with the class
 * `mi-trigger` (put it on the button the icon is in, so the whole button triggers it).
 *
 *   <button className="mi-trigger"><MotionIcon icon={home} /> Home</button>
 *   <MotionIcon icon={mic} variant="duotone" size={20} />
 *   <MotionIcon icon={play} trigger="manual" active={playing} />
 */
export function MotionIcon({ icon, loopEvery = 1800, ...o }: MotionIconProps) {
  useIconStyles(icon);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [beat, setBeat] = useState(false);
  useEffect(() => {
    if (o.trigger !== "loop") return;
    let on = false;
    const id = window.setInterval(() => {
      on = !on;
      setBeat(on);
    }, loopEvery / 2);
    return () => window.clearInterval(id);
  }, [o.trigger, loopEvery]);
  const loop = o.trigger === "loop";
  return draw(icon, { ...o, uid, trigger: loop ? "manual" : o.trigger, active: loop ? beat : o.active });
}
