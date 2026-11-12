"use client";

/**
 * The site's icons: the Motion Icons kit (src/vendor/motion-icons, copied from the kit by its `pnpm sync`), under the
 * names the site always used, as in the FireVoice app (its src/components/icons.tsx). Every icon moves when the
 * button, link, summary or card (`mi-trigger`) it sits in is pointed at or focused; reduced motion keeps them still.
 *
 *   import { Mic, Check } from "@/components/icons";
 *   <Mic className="size-4" />                   outline (default)
 *   <Mic variant="duotone" />                    duotone; `fill` set to a colour gives the filled style
 *   <Play trigger="manual" active={playing} />   moves while something is on
 */
import type { CSSProperties, SVGProps } from "react";
import * as K from "@/vendor/motion-icons";
import { MotionIcon } from "@/vendor/motion-icons/MotionIcon";
import { preset } from "@/vendor/motion-icons/presets";
import type { IconDef, Trigger, Variant } from "@/vendor/motion-icons/types";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "fill" | "strokeWidth" | "style"> {
  size?: number | string;
  strokeWidth?: number | string;
  /** "currentColor" (or any colour) draws the filled style */
  fill?: string;
  variant?: Variant;
  trigger?: Trigger;
  active?: boolean;
  style?: CSSProperties;
}

export type Icon = (props: IconProps) => React.ReactElement;

function make(def: IconDef, name: string): Icon {
  const C = ({ size, strokeWidth, fill, variant, trigger, active, className, style, ...rest }: IconProps) => (
    <MotionIcon
      icon={def}
      size={size === undefined ? undefined : Number(size)}
      strokeWidth={strokeWidth === undefined ? undefined : Number(strokeWidth)}
      variant={variant ?? (fill && fill !== "none" ? "filled" : "outline")}
      trigger={trigger}
      active={active}
      className={className}
      style={style}
      svgProps={rest}
    />
  );
  C.displayName = name;
  return C;
}

/* a few the kit does not have yet, drawn on its 24 grid in its style */
const menuDef: IconDef = {
  name: "site-menu",
  title: "Menu",
  category: "navigation",
  tags: ["menu", "hamburger"],
  motionNote: "The lines slide apart.",
  parts: [
    { p: "p0", role: "line", d: "M4 6h16" },
    { p: "p1", role: "line", d: "M4 12h16" },
    { p: "p2", role: "line", d: "M4 18h16" },
  ],
  motion: {
    p0: { to: { transform: "translateX(-2px)" } },
    p1: { to: { transform: "translateX(2px)" }, delay: 40 },
    p2: { to: { transform: "translateX(-2px)" }, delay: 80 },
  },
};

const arrowDownDef: IconDef = {
  name: "site-arrow-down",
  title: "Arrow down",
  category: "navigation",
  tags: ["down", "scroll"],
  motionNote: "It drops a step.",
  parts: [
    { p: "p0", role: "line", d: "M12 5v14" },
    { p: "p1", role: "line", d: "m19 12-7 7-7-7" },
  ],
  ...preset("nudge-down", 2),
};

const botDef: IconDef = {
  name: "site-bot",
  title: "Agent",
  category: "app",
  tags: ["bot", "agent", "ai"],
  motionNote: "Its eyes blink and its antenna perks up.",
  parts: [
    { p: "head", role: "body", d: "M6 8 H18 A2 2 0 0 1 20 10 V18 A2 2 0 0 1 18 20 H6 A2 2 0 0 1 4 18 V10 A2 2 0 0 1 6 8 Z" },
    { p: "antenna", role: "line", d: "M12 8V4H8" },
    { p: "ears", role: "line", d: "M2 14h2M20 14h2" },
    { p: "eyes", role: "detail", d: "M15 13v2M9 13v2" },
  ],
  motion: {
    antenna: { origin: "0% 100%", to: { transform: "rotate(-8deg) translateY(-1px)" } },
    eyes: { animation: "mi-site-blink .5s ease-in-out" },
  },
  keyframes: "@keyframes mi-site-blink{50%{transform:scaleY(.15)}}",
};

export const ArrowDown = make(arrowDownDef, "ArrowDown");
export const ArrowRight = make(K.arrowRight, "ArrowRight");
export const AudioLines = make(K.speak, "AudioLines");
export const Bell = make(K.bell, "Bell");
export const BookA = make(K.dictionary, "BookA");
export const BookOpen = make(K.bookOpen, "BookOpen");
export const Bot = make(botDef, "Bot");
export const Captions = make(K.captions, "Captions");
export const Check = make(K.check, "Check");
export const CheckCircle2 = make(K.checkCircle, "CheckCircle2");
export const ChevronDown = make(K.chevronDown, "ChevronDown");
export const Clock = make(K.clock, "Clock");
export const Copy = make(K.copy, "Copy");
export const FileAudio = make(K.fileAudio, "FileAudio");
export const FileJson = make(K.fileJson, "FileJson");
export const Flame = make(K.flame, "Flame");
export const Gauge = make(K.gauge, "Gauge");
export const History = make(K.history, "History");
export const Home = make(K.home, "Home");
export const Keyboard = make(K.keyboard, "Keyboard");
export const Languages = make(K.languages, "Languages");
export const Library = make(K.voices, "Library");
export const Loader2 = make(K.loader, "Loader2");
export const Lock = make(K.lock, "Lock");
export const Mail = make(K.mail, "Mail");
export const Menu = make(menuDef, "Menu");
export const MessageCircle = make(K.messageCircle, "MessageCircle");
export const MessagesSquare = make(K.messages, "MessagesSquare");
export const Mic = make(K.mic, "Mic");
export const Monitor = make(K.monitor, "Monitor");
export const Moon = make(K.moon, "Moon");
export const Music = make(K.music, "Music");
export const Pause = make(K.pause, "Pause");
export const Play = make(K.playOutline, "Play");
export const Plug = make(K.plug, "Plug");
export const Plus = make(K.plus, "Plus");
export const Power = make(K.power, "Power");
export const Radio = make(K.radio, "Radio");
export const ScrollText = make(K.fileText, "ScrollText");
export const Search = make(K.search, "Search");
export const ShieldCheck = make(K.shieldCheck, "ShieldCheck");
export const Sparkles = make(K.sparkles, "Sparkles");
export const Sun = make(K.sun, "Sun");
export const Trash2 = make(K.trash, "Trash2");
export const Upload = make(K.upload, "Upload");
export const Users = make(K.users, "Users");
export const Wand2 = make(K.wand, "Wand2");
export const X = make(K.close, "X");
export const Zap = make(K.zap, "Zap");
