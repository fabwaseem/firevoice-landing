"use client";

/**
 * FireVoice's icons: the Motion Icons kit (src/vendor/motion-icons, copied from the kit by its `pnpm sync`), under the
 * names the app has always used. Every icon moves when the button, link or tab it is in is pointed at or focused.
 *
 *   import { Trash2, Mic } from "@/components/icons";
 *   <Trash2 className="size-4" />                 outline (default)
 *   <Mic variant="duotone" />                     duotone; `fill` set to a colour gives the filled style
 *   <Play trigger="manual" active={playing} />    moves while something is on
 */
import type { CSSProperties, SVGProps } from "react";
import * as K from "@/vendor/motion-icons";
import { MotionIcon } from "@/vendor/motion-icons/MotionIcon";
import type { IconDef, Trigger, Variant } from "@/vendor/motion-icons/types";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "fill" | "strokeWidth" | "style"> {
  size?: number | string;
  strokeWidth?: number | string;
  /** "currentColor" (or any colour) draws the filled style, as the old icons did with a fill */
  fill?: string;
  variant?: Variant;
  trigger?: Trigger;
  active?: boolean;
  style?: CSSProperties;
}

export type Icon = (props: IconProps) => React.ReactElement;
/** Kept for code that typed icon props the Lucide way. */
export type LucideIcon = Icon;

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

export const Activity = make(K.activity, "Activity");
export const AlertTriangle = make(K.alert, "AlertTriangle");
export const TriangleAlert = AlertTriangle;
export const ArrowDownToLine = make(K.arrowDownLine, "ArrowDownToLine");
export const ArrowLeft = make(K.arrowLeft, "ArrowLeft");
export const ArrowRight = make(K.arrowRight, "ArrowRight");
export const AudioLines = make(K.speak, "AudioLines");
export const AudioWaveform = make(K.waveform, "AudioWaveform");
export const Ban = make(K.ban, "Ban");
export const BookA = make(K.dictionary, "BookA");
export const BookOpen = make(K.bookOpen, "BookOpen");
export const Briefcase = make(K.briefcase, "Briefcase");
export const Building2 = make(K.building, "Building2");
export const CalendarDays = make(K.calendar, "CalendarDays");
export const Captions = make(K.captions, "Captions");
export const Check = make(K.check, "Check");
export const CheckCircle2 = make(K.checkCircle, "CheckCircle2");
export const CheckSquare = make(K.checkSquare, "CheckSquare");
export const ChevronDown = make(K.chevronDown, "ChevronDown");
export const ChevronRight = make(K.chevronRight, "ChevronRight");
export const ChevronUp = make(K.chevronUp, "ChevronUp");
export const CircleSlash = make(K.circleSlash, "CircleSlash");
export const Clapperboard = make(K.clapperboard, "Clapperboard");
export const ClipboardCheck = make(K.clipboardCheck, "ClipboardCheck");
export const ClipboardPaste = make(K.clipboardPaste, "ClipboardPaste");
export const Clock = make(K.clock, "Clock");
export const Code2 = make(K.code, "Code2");
export const Coffee = make(K.coffee, "Coffee");
export const Compass = make(K.compass, "Compass");
export const Copy = make(K.copy, "Copy");
export const Cpu = make(K.cpu, "Cpu");
export const Dices = make(K.dice, "Dices");
export const Download = make(K.download, "Download");
export const Ear = make(K.ear, "Ear");
export const Eraser = make(K.eraser, "Eraser");
export const ExternalLink = make(K.external, "ExternalLink");
export const Eye = make(K.eye, "Eye");
export const FileAudio = make(K.fileAudio, "FileAudio");
export const FileCheck2 = make(K.fileCheck, "FileCheck2");
export const FileDown = make(K.fileDown, "FileDown");
export const FileJson = make(K.fileJson, "FileJson");
export const FileText = make(K.fileText, "FileText");
export const Film = make(K.film, "Film");
export const FilterX = make(K.filterX, "FilterX");
export const Flame = make(K.flame, "Flame");
export const FolderOpen = make(K.folderOpen, "FolderOpen");
export const Frown = make(K.frown, "Frown");
export const Gauge = make(K.gauge, "Gauge");
export const Globe = make(K.globe, "Globe");
export const GraduationCap = make(K.graduationCap, "GraduationCap");
export const Hammer = make(K.hammer, "Hammer");
export const Hand = make(K.hand, "Hand");
export const HardDrive = make(K.drive, "HardDrive");
export const HardDriveDownload = make(K.driveDownload, "HardDriveDownload");
export const Heart = make(K.heart, "Heart");
export const HelpCircle = make(K.help, "HelpCircle");
export const History = make(K.history, "History");
export const Home = make(K.home, "Home");
export const ImageOff = make(K.imageOff, "ImageOff");
export const ImagePlus = make(K.imagePlus, "ImagePlus");
export const Keyboard = make(K.keyboard, "Keyboard");
export const Languages = make(K.languages, "Languages");
export const Layers = make(K.layers, "Layers");
export const Library = make(K.voices, "Library");
export const Lightbulb = make(K.lightbulb, "Lightbulb");
export const ListChecks = make(K.listChecks, "ListChecks");
export const ListOrdered = make(K.listOrdered, "ListOrdered");
export const ListPlus = make(K.listPlus, "ListPlus");
export const Loader2 = make(K.loader, "Loader2");
export const Lock = make(K.lock, "Lock");
export const LockOpen = make(K.lockOpen, "LockOpen");
export const Mail = make(K.mail, "Mail");
export const Meh = make(K.meh, "Meh");
export const MessageCircle = make(K.messageCircle, "MessageCircle");
export const MessageSquareQuote = make(K.messageQuote, "MessageSquareQuote");
export const MessageSquareText = make(K.messageText, "MessageSquareText");
export const MessageSquareHeart = make(K.messageHeart, "MessageSquareHeart");
export const CircleUser = make(K.circleUser, "CircleUser");
export const LogOut = make(K.logOut, "LogOut");
export const LogIn = make(K.logIn, "LogIn");
export const Bug = make(K.bug, "Bug");
export const MessagesSquare = make(K.messages, "MessagesSquare");
export const Mic = make(K.mic, "Mic");
export const Mic2 = make(K.micVocal, "Mic2");
export const Monitor = make(K.monitor, "Monitor");
export const Moon = make(K.moon, "Moon");
export const MousePointerClick = make(K.click, "MousePointerClick");
export const Music = make(K.music, "Music");
export const Newspaper = make(K.newspaper, "Newspaper");
export const Package = make(K.packageIcon, "Package");
export const PackageOpen = make(K.packageOpen, "PackageOpen");
export const Palette = make(K.palette, "Palette");
export const PanelLeftClose = make(K.panelClose, "PanelLeftClose");
export const PanelLeftOpen = make(K.panelOpen, "PanelLeftOpen");
export const Pause = make(K.pause, "Pause");
export const PenLine = make(K.penLine, "PenLine");
export const Pencil = make(K.pencil, "Pencil");
export const PencilLine = make(K.pencilLine, "PencilLine");
export const Play = make(K.playOutline, "Play");
export const PlugZap = make(K.plug, "PlugZap");
export const Plus = make(K.plus, "Plus");
export const Power = make(K.power, "Power");
export const PowerOff = make(K.powerOff, "PowerOff");
export const Radio = make(K.radio, "Radio");
export const RefreshCw = make(K.refresh, "RefreshCw");
export const Repeat = make(K.repeatLoop, "Repeat");
export const Repeat2 = make(K.repeat, "Repeat2");
export const Rocket = make(K.rocket, "Rocket");
export const RotateCcw = make(K.rotateCcw, "RotateCcw");
export const RotateCw = make(K.rotateCw, "RotateCw");
export const Save = make(K.save, "Save");
export const ScanSearch = make(K.scanSearch, "ScanSearch");
export const Scissors = make(K.scissors, "Scissors");
export const Search = make(K.search, "Search");
export const Settings = make(K.settings, "Settings");
export const Settings2 = make(K.settings2, "Settings2");
export const ShieldAlert = make(K.shieldAlert, "ShieldAlert");
export const ShieldCheck = make(K.shieldCheck, "ShieldCheck");
export const ShieldQuestion = make(K.shieldQuestion, "ShieldQuestion");
export const Shuffle = make(K.shuffle, "Shuffle");
export const Skull = make(K.skull, "Skull");
export const SlidersHorizontal = make(K.sliders, "SlidersHorizontal");
export const Sparkles = make(K.sparkles, "Sparkles");
export const Square = make(K.stop, "Square");
export const SquareDashed = make(K.squareDashed, "SquareDashed");
export const Star = make(K.star, "Star");
export const Sun = make(K.sun, "Sun");
export const Tag = make(K.tag, "Tag");
export const Tags = make(K.tags, "Tags");
export const Timer = make(K.timer, "Timer");
export const Trash2 = make(K.trash, "Trash2");
export const Trophy = make(K.trophy, "Trophy");
export const Type = make(K.type, "Type");
export const Undo2 = make(K.undo, "Undo2");
export const Upload = make(K.upload, "Upload");
export const UploadCloud = make(K.cloudUpload, "UploadCloud");
export const Users = make(K.users, "Users");
export const Volume1 = make(K.volumeLow, "Volume1");
export const Volume2 = make(K.volume, "Volume2");
export const VolumeX = make(K.volumeOff, "VolumeX");
export const Wand2 = make(K.wand, "Wand2");
export const Waves = make(K.waves, "Waves");
export const Wind = make(K.wind, "Wind");
export const Wrench = make(K.wrench, "Wrench");
export const X = make(K.close, "X");
export const Zap = make(K.zap, "Zap");
// added for the website (and kept in step here)
export const Menu = make(K.menu, "Menu");
export const ArrowDown = make(K.arrowDown, "ArrowDown");
export const Bot = make(K.bot, "Bot");
export const WifiOff = make(K.wifiOff, "WifiOff");
export const Cloud = make(K.cloud, "Cloud");
export const CloudOff = make(K.cloudOff, "CloudOff");
export const Laptop = make(K.laptop, "Laptop");
export const ChartColumn = make(K.chart, "ChartColumn");
export const BarChart3 = make(K.chart, "BarChart3");
export const Command = make(K.command, "Command");
export const Video = make(K.video, "Video");
export const Quote = make(K.quote, "Quote");
export const MailCheck = make(K.mailCheck, "MailCheck");
export const Shield = make(K.shield, "Shield");
export const MessageSquare = make(K.messageSquare, "MessageSquare");
export const Hash = make(K.hash, "Hash");
export const UserPlus = make(K.userPlus, "UserPlus");
