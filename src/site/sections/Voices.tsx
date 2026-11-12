"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";
import { gsap } from "gsap";
import clipsData from "@/data/clips.json";
import { Heading } from "@/site/ui";
import { Reveal, useInView, useScene } from "@/site/motion";

// The voice studio: a long row of real clips on tilted, coloured cards that slides sideways as you scroll (pinned on
// desktop; a swipeable strip on phones and with reduced motion). Each card plays its clip; one plays at a time.

type Clip = { slug: string; name: string; voice: string; role: string; text: string; duration: number; peaks: number[] };
const clips = clipsData as Clip[];

/** Card colours: paper, soft fire, deep red, sand, amber, sage, coral, cream. Text colour chosen for AA contrast. */
const TONES = [
  { bg: "#f6efe6", ink: "#17130f", sub: "#5e554c", wave: "rgba(23,19,15,.18)", fill: "#e2461b", btn: "#17130f", btnInk: "#fff" },
  { bg: "#ffd8c4", ink: "#2a1309", sub: "#6b3a24", wave: "rgba(42,19,9,.2)", fill: "#c63b10", btn: "#2a1309", btnInk: "#fff" },
  { bg: "#7a1f12", ink: "#fff3ea", sub: "#f2c4ae", wave: "rgba(255,243,234,.25)", fill: "#ffb38a", btn: "#fff3ea", btnInk: "#7a1f12" },
  { bg: "#e9dfcf", ink: "#17130f", sub: "#5c5246", wave: "rgba(23,19,15,.18)", fill: "#c63b10", btn: "#17130f", btnInk: "#fff" },
  { bg: "#f4b04a", ink: "#2a1606", sub: "#5a3410", wave: "rgba(42,22,6,.22)", fill: "#8a2a0a", btn: "#2a1606", btnInk: "#fff" },
  { bg: "#a7b596", ink: "#18200f", sub: "#3c4730", wave: "rgba(24,32,15,.2)", fill: "#7a1f12", btn: "#18200f", btnInk: "#fff" },
  { bg: "#ff8a5c", ink: "#2a0f05", sub: "#5c2410", wave: "rgba(42,15,5,.22)", fill: "#5a1608", btn: "#2a0f05", btnInk: "#fff" },
  { bg: "#fff6e8", ink: "#17130f", sub: "#5e554c", wave: "rgba(23,19,15,.18)", fill: "#e2461b", btn: "#17130f", btnInk: "#fff" },
];
const TILT = [-4, 3, -2.5, 4.5, -3.5, 2, -4.5, 3];
const LIFT = [0, 26, -10, 18, -4, 30, -14, 12];

const FEATURES = ["Text to speech", "Voice cloning", "Voice design", "Dialogue", "Dubbing", "Voice changer", "Sound effects", "Transcription and captions"];

/** Every second peak, so the bars stay readable on a card. */
function bars(peaks: number[]) {
  return peaks.filter((_, i) => i % 2 === 0);
}

const Wave = memo(function Wave({ clip, tone, fillRef }: { clip: Clip; tone: (typeof TONES)[number]; fillRef: (el: HTMLDivElement | null) => void }) {
  const b = bars(clip.peaks);
  const row = (color: string) => (
    <div className="flex h-full items-center gap-[2px]" aria-hidden>
      {b.map((v, i) => (
        <span key={i} className="w-full rounded-full" style={{ height: `${Math.max(8, Math.round(v * 100))}%`, background: color }} />
      ))}
    </div>
  );
  return (
    <div className="relative h-9 min-w-0 flex-1">
      {row(tone.wave)}
      <div ref={fillRef} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
        {row(tone.fill)}
      </div>
    </div>
  );
});

const Card = memo(function Card({ clip, i, playing, onToggle, fillRef }: { clip: Clip; i: number; playing: boolean; onToggle: (slug: string) => void; fillRef: (el: HTMLDivElement | null) => void }) {
  const tone = TONES[i % TONES.length];
  const role = clip.role
    .split(" ")
    .map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase()))
    .join(" ");
  const label = `${playing ? "Pause" : "Play"} ${clip.name}, ${role}`;
  return (
    <li
      className="v-card shrink-0 snap-center"
      style={{ ["--r" as string]: `${TILT[i % TILT.length]}deg`, ["--y" as string]: `${LIFT[i % LIFT.length]}px` }}
    >
      <article
        className="v-face flex h-full flex-col rounded-[28px] p-6 shadow-[0_40px_70px_-36px_rgba(0,0,0,.75),0_10px_24px_-14px_rgba(0,0,0,.45)]"
        style={{ background: tone.bg, color: tone.ink }}
      >
        <div className="flex items-center gap-3">
          <Image
            src={`/avatars/${clip.voice}.webp`}
            alt=""
            width={52}
            height={52}
            loading="lazy"
            className="size-[52px] shrink-0 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 3px ${tone.bg}, 0 0 0 4px ${tone.wave}` }}
          />
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{clip.name}</h3>
            <p className="text-[13px]" style={{ color: tone.sub }}>
              {clip.role}
            </p>
          </div>
        </div>
        <blockquote className="mt-5 flex-1 font-serif text-[23px] leading-[1.16] tracking-[-0.01em] sm:text-[26px]">
          &ldquo;{clip.text}&rdquo;
        </blockquote>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(clip.slug)}
            aria-label={label}
            aria-pressed={playing}
            className="grid size-12 shrink-0 place-items-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{ background: tone.btn, color: tone.btnInk }}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                <rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5">
                <path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l11.6-7.2a1 1 0 0 0 0-1.72L8.5 3.94A1 1 0 0 0 7 4.8z" />
              </svg>
            )}
          </button>
          <Wave clip={clip} tone={tone} fillRef={fillRef} />
          <span className="w-9 shrink-0 text-right font-mono text-[11.5px] tabular-nums" style={{ color: tone.sub }}>
            0:{String(Math.round(clip.duration)).padStart(2, "0")}
          </span>
        </div>
      </article>
    </li>
  );
});

// One player for the page (one clip plays at a time) and each card's waveform fill, reached outside React's render.
let player: HTMLAudioElement | null = null;
const fills = new Map<string, HTMLDivElement>();
const fillRefs = Object.fromEntries(
  clips.map((c) => [
    c.slug,
    (el: HTMLDivElement | null) => {
      if (el) fills.set(c.slug, el);
      else fills.delete(c.slug);
    },
  ]),
) as Record<string, (el: HTMLDivElement | null) => void>;

function setFill(slug: string, p: number) {
  const el = fills.get(slug);
  if (el) el.style.clipPath = `inset(0 ${(100 - Math.min(1, Math.max(0, p)) * 100).toFixed(2)}% 0 0)`;
}

function getPlayer() {
  if (!player) {
    player = new Audio();
    player.preload = "auto";
  }
  return player;
}

export function Voices() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [viewRef, inView] = useInView<HTMLDivElement>("0px");

  const stop = useCallback(() => {
    if (player && !player.paused) player.pause();
    setPlaying(null);
  }, []);

  const onToggle = useCallback((slug: string) => {
    const a = getPlayer();
    const current = a.dataset.slug;
    if (current === slug && !a.paused) {
      a.pause();
      setPlaying(null);
      return;
    }
    if (current !== slug) {
      if (current) setFill(current, 0);
      a.src = `/audio/${slug}.mp3`;
      a.dataset.slug = slug;
    }
    a.play().then(
      () => setPlaying(slug),
      () => setPlaying(null),
    );
  }, []);

  // the played part of the waveform follows the audio, frame by frame
  useEffect(() => {
    const a = player;
    if (!playing || !a) return;
    let raf = 0;
    const tick = () => {
      if (a.duration) setFill(playing, a.currentTime / a.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const ended = () => {
      setFill(playing, 0);
      setPlaying(null);
    };
    // timeupdate keeps the fill moving where frames are throttled (a background tab)
    const update = () => a.duration && setFill(playing, a.currentTime / a.duration);
    a.addEventListener("ended", ended);
    a.addEventListener("timeupdate", update);
    return () => {
      cancelAnimationFrame(raf);
      a.removeEventListener("ended", ended);
      a.removeEventListener("timeupdate", update);
    };
  }, [playing]);

  // scrolled away: stop talking
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!inView) stop();
  }, [inView, stop]);
  useEffect(() => () => player?.pause(), []);

  const ref = useScene<HTMLElement>(({ mm }) => {
    mm.add("(min-width: 768px)", () => {
      const strip = document.querySelector<HTMLElement>("#voices .v-strip");
      const track = document.querySelector<HTMLElement>("#voices .v-track");
      if (!strip || !track) return;
      gsap.set(strip, { overflow: "visible" });
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "#voices .v-stage", start: "top top", end: "+=200%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
      });
      tl.fromTo(track, { x: () => window.innerWidth * 0.18 }, { x: () => -distance(), ease: "none" }, 0);
      // the cards sway a little as they pass, like a carousel catching the light
      gsap.utils.toArray<HTMLElement>("#voices .v-face").forEach((face, i) => {
        tl.fromTo(face, { rotate: (i % 2 ? 1 : -1) * 2.5 }, { rotate: (i % 2 ? -1 : 1) * 2.5, ease: "none" }, 0);
      });
    });
  });

  return (
    <section
      ref={ref}
      id="voices"
      aria-labelledby="voices-title"
      className="bg-ember on-dark relative z-[7] -mt-[var(--sheet-r)] overflow-x-clip rounded-[var(--sheet-r)] pt-28 pb-20 sm:pt-36 sm:pb-24 md:pb-12"
    >
      <style>{`
        #voices .v-card { width: min(82vw, 340px); height: 410px; transform: translateY(var(--y)) rotate(var(--r)); }
        @media (max-width: 767px) { #voices .v-card { height: 370px; transform: rotate(calc(var(--r) * .5)); } }
        #voices .v-strip { scrollbar-width: none; }
        #voices .v-strip::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="container-x">
        <Reveal>
          <Heading eyebrow="Voice studio" lede="Natural speech in a library of voices, your own voice cloned from a short sample, dialogue, dubbing and captions. On your computer too.">
            <span id="voices-title">
              And a whole studio <em>of voices.</em>
            </span>
          </Heading>
        </Reveal>
      </div>

      <div ref={viewRef} className="v-stage flex flex-col justify-center md:min-h-[100svh] md:pt-14">
        <div className="v-strip snap-x snap-mandatory overflow-x-auto py-14 md:py-16" tabIndex={-1}>
          <ul className="v-track flex w-max gap-5 px-[max(16px,calc((100vw-1180px)/2+32px))] md:gap-7" aria-label="Voice clips">
            {clips.map((c, i) => (
              <Card key={c.slug} clip={c} i={i} playing={playing === c.slug} onToggle={onToggle} fillRef={fillRefs[c.slug]} />
            ))}
          </ul>
        </div>
        <div className="container-x">
          <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2.5" aria-label="What the voice studio does">
            {FEATURES.map((f) => (
              <li key={f} className="rounded-full border border-line-strong bg-surface/60 px-4 py-2 text-[14px] text-ink-2">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
