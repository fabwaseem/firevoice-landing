/** Motion Icons: rounded, animated icons in outline, duotone and filled. */
import * as app from "./icons/app";
import * as actions from "./icons/actions";
import * as media from "./icons/media";
import * as win from "./icons/window";
import * as more from "./icons/lucide";
import type { IconDef } from "./types";

export * from "./icons/app";
export * from "./icons/actions";
export * from "./icons/media";
export * from "./icons/window";
export * from "./icons/lucide";
export { preset, type Preset } from "./presets";
export { MotionIcon, type MotionIconProps } from "./MotionIcon";
export { draw, type DrawOptions } from "./render";
export { baseCss, iconCss, stylesheet, TOKENS } from "./motion";
export * from "./types";

/** Every icon, by name. */
export const ICONS: IconDef[] = [...Object.values(app), ...Object.values(actions), ...Object.values(media), ...Object.values(win), ...Object.values(more)];
export const byName = (name: string) => ICONS.find((i) => i.name === name);
