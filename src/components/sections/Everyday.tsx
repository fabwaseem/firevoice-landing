import type { ReactNode } from "react";
import {
  AudioLines,
  BookA,
  Check,
  Flame,
  History,
  Home,
  Mic,
  Power,
  Search,
  Trash2,
  Users,
} from "@/components/icons";
import type { Icon } from "@/components/icons";
import { Reveal } from "../Reveal";
import { Logo, SectionHeader } from "../ui";

/* The app's everyday features, as a bento of product UI. Example numbers and words, drawn like the app shows them. */

function Card({
  icon: I,
  label,
  title,
  children,
  visual,
  className = "",
  delay = 0,
}: {
  icon: Icon;
  label: string;
  title: ReactNode;
  children: ReactNode;
  visual?: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={`card mi-trigger flex flex-col overflow-hidden p-6 transition-colors hover:border-line-strong sm:p-7 ${className}`}>
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fire-ink">
        <I className="size-4" variant="duotone" /> {label}
      </p>
      <h3 className="mt-4 text-balance text-[22px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[24px]">
        {title}
      </h3>
      <p className="mt-2.5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted">{children}</p>
      {visual && <div className="mt-7 flex-1">{visual}</div>}
    </Reveal>
  );
}

const stats = [
  { label: "Words dictated", value: "48,210", sub: "+3,140 this week" },
  { label: "Time saved", value: "14h 20m", sub: "vs typing it" },
  { label: "Speaking speed", value: "148", unit: "wpm", sub: "3.5× your typing" },
  { label: "Daily streak", value: "12", unit: "days", sub: "Best: 21", flame: true },
];
const apps = [
  { name: "Mail", pct: 38 },
  { name: "Slack", pct: 24 },
  { name: "VS Code", pct: 17 },
  { name: "Word", pct: 11 },
];

function StatsVisual() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface-2 p-4">
            <p className="text-[12px] text-faint">{s.label}</p>
            <p className="mt-1.5 flex items-baseline gap-1 whitespace-nowrap text-[22px] font-semibold sm:text-[26px] tabular-nums tracking-[-0.03em] text-ink">
              {s.value}
              {s.unit && <span className="text-[13px] font-medium tracking-normal text-muted">{s.unit}</span>}
              {s.flame && <Flame className="ml-0.5 size-4 self-center text-fire" fill="currentColor" />}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-line bg-surface-2 p-4">
        <p className="text-[12px] text-faint">Top apps</p>
        <ul className="mt-3 space-y-2.5">
          {apps.map((a) => (
            <li key={a.name} className="grid grid-cols-[64px_1fr_36px] items-center gap-3 text-[13px]">
              <span className="text-ink-2">{a.name}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full fire-gradient" style={{ width: `${a.pct * 2.2}%` }} />
              </span>
              <span className="text-right tabular-nums text-faint">{a.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const words = [
  { term: "Siobhan", say: "shi-VAWN", not: "Chevonne" },
  { term: "Kubernetes", say: "koo-ber-NET-eez", not: "cooper netties" },
  { term: "Nguyen", say: "win", not: "new gen" },
];

function DictionaryVisual() {
  return (
    <div className="space-y-2.5">
      {words.map((w) => (
        <div key={w.term} className="rounded-2xl border border-line bg-surface-2 px-4 py-3">
          <p className="font-medium text-ink">{w.term}</p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px]">
            <span className="text-fire-ink">says &ldquo;{w.say}&rdquo;</span>
            <span className="text-faint line-through decoration-faint/60">{w.not}</span>
          </p>
        </div>
      ))}
      <ul className="flex flex-wrap gap-1.5 pt-2 text-[12px]">
        {["Voices say it", "Dictation spells it", "Transcripts too"].map((t) => (
          <li key={t} className="flex items-center gap-1 rounded-full bg-fire-soft px-2.5 py-1 text-fire-ink">
            <Check className="size-3" strokeWidth={2.4} /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

const history = [
  {
    day: "Today",
    items: [
      { kind: "dictated", text: "Hi Sam, thanks for the notes. I moved the launch to Thursday…", meta: "Mail · 09:41", checked: false },
      { kind: "made", text: "Chapter 3 narration, Atticus", meta: "Speak · 08:12", checked: true },
    ],
  },
  {
    day: "Yesterday",
    items: [
      { kind: "dictated", text: "Fix the tray menu so it opens on the first click", meta: "VS Code · 17:05", checked: true },
      { kind: "made", text: "Trailer intro, three takes", meta: "Speak · 11:30", checked: false },
    ],
  },
];

function HistoryVisual() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-[13px] text-faint">
        <Search className="size-4" /> Search everything you made and said
      </div>
      <div className="px-2 py-2">
        {history.map((g) => (
          <div key={g.day}>
            <p className="px-2 pb-1 pt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">{g.day}</p>
            <ul>
              {g.items.map((it) => {
                const I = it.kind === "dictated" ? Mic : AudioLines;
                return (
                  <li
                    key={it.text}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 ${it.checked ? "bg-fire-soft" : ""}`}
                  >
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded-[5px] border ${
                        it.checked ? "border-transparent fire-gradient text-white" : "border-line-strong"
                      }`}
                    >
                      {it.checked && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface text-muted">
                      <I className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink">{it.text}</span>
                      <span className="block text-[11.5px] text-faint">{it.meta}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[12.5px]">
        <span className="text-muted">2 selected</span>
        <span className="flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1 text-ink-2">
          <Trash2 className="size-3.5" /> Delete
        </span>
      </div>
    </div>
  );
}

function TrayVisual() {
  return (
    <div className="flex items-center justify-end gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
      <span className="mr-auto text-[12px] text-faint">Ready in the tray</span>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-3.5 rounded-[4px] bg-line-strong" />
      ))}
      <span className="relative grid place-items-center">
        <span className="absolute size-7 rounded-lg bg-fire-soft" />
        <span className="relative">
          <Logo size={18} />
        </span>
      </span>
      <span className="font-mono text-[11.5px] tabular-nums text-muted">09:41</span>
    </div>
  );
}

function AccountVisual() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
      <span className="rounded-full fire-gradient px-3 py-1 font-medium text-white">Free for everyone</span>
      <span className="rounded-full border border-line-strong px-3 py-1 text-ink-2">Account optional</span>
    </div>
  );
}

export function Everyday() {
  return (
    <section id="everyday" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader
          eyebrow="Every day"
          title={
            <>
              It learns your words. <span className="accent">And keeps score.</span>
            </>
          }
        >
          One dictionary for every feature, a home screen with your numbers, and a history of everything you made and
          said. All of it on your computer.
        </SectionHeader>

        <div className="mt-16 grid gap-4 lg:grid-cols-6 [&>*]:min-w-0">
          <Card
            className="lg:col-span-4"
            icon={Home}
            label="Home"
            title="See how much talking saves you."
            visual={<StatsVisual />}
          >
            Words dictated, time saved compared with typing, how fast you speak, your daily streak and the apps you dictate
            into most.
          </Card>
          <Card
            className="lg:col-span-2"
            icon={BookA}
            label="Dictionary"
            title="Your names and terms, right everywhere."
            visual={<DictionaryVisual />}
            delay={0.06}
          >
            Add a word once. The voices pronounce it right, and dictation and transcription spell it right.
          </Card>
          <Card
            className="lg:col-span-3"
            icon={History}
            label="History"
            title="Everything you made and dictated."
            visual={<HistoryVisual />}
          >
            Grouped by day and searchable. Find last week&apos;s mail or this morning&apos;s narration, or clear out several
            at once.
          </Card>
          <div className="grid gap-4 lg:col-span-3 [&>*]:min-w-0">
            <Card icon={Power} label="Always ready" title="Starts with Windows, quietly." visual={<TrayVisual />} delay={0.06}>
              FireVoice waits in the tray, so &ldquo;Hey FireVoice&rdquo; and your shortcut work the moment you sit down.
              Turn it off in Settings any time.
            </Card>
            <Card icon={Users} label="Account" title="A free account, if you want one." visual={<AccountVisual />} delay={0.12}>
              Sign in to keep your installs together and send feedback from the app. Everything works without one, and
              FireVoice is free for everyone right now.
            </Card>
          </div>
        </div>
        <p className="mt-6 text-center text-[12.5px] text-faint">
          Example numbers and words, shown the way the app shows yours.
        </p>
      </div>
    </section>
  );
}
