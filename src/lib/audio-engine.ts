"use client";

import clipsData from "@/data/clips.json";
import { AmbientScore } from "./music";

export type Clip = (typeof clipsData)[number];
export const clips: Clip[] = clipsData;
export const heroClip = clips.find((c) => c.slug === "trailer") ?? clips[0];

/**
 * The page's one audio engine. It plays real FireVoice renders, analyses them with WebAudio, and exposes:
 *  - `bands`: 32 smoothed frequency bands (0..1) for the voice field shader,
 *  - `level`: overall loudness (0..1),
 *  - the playing clip and its time, for captions and progress.
 * It also runs the site's background score (an original generative piece, see music.ts) through the same analyser,
 * so the 3D field moves to the music, and the music ducks under any voice clip.
 * With nothing playing it produces a gentle, speech-like idle rhythm so the page always breathes.
 */
export const BANDS = 32;

type State = {
  clip: Clip | null;
  playing: boolean;
  music: boolean;
};

const MUSIC_VOL = 0.42;
const MUSIC_DUCKED = 0.1;
const PREF_KEY = "fv-sound";

const state: State = { clip: null, playing: false, music: false };
const bands = new Float32Array(BANDS);
let level = 0;

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let freq: Uint8Array<ArrayBuffer> | null = null;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
let snapshot = { ...state };
export const getSnapshot = () => snapshot;
const serverSnapshot = { clip: null, playing: false, music: false } as State;
export const getServerSnapshot = () => serverSnapshot;
function set(p: Partial<State>) {
  Object.assign(state, p);
  snapshot = { ...state };
  emit();
}

let score: AmbientScore | null = null;

function ensureContext() {
  if (ctx) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.74;
  analyser.connect(ctx.destination);
  freq = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
}

function ensureGraph() {
  ensureContext();
  if (audio || !ctx || !analyser) return;
  audio = new Audio();
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";
  const onStop = () => {
    set({ playing: false });
    score?.setLevel(MUSIC_VOL, 1.4);
  };
  audio.addEventListener("ended", onStop);
  audio.addEventListener("pause", onStop);
  audio.addEventListener("play", () => {
    set({ playing: true });
    score?.setLevel(MUSIC_DUCKED, 0.4);
  });
  ctx.createMediaElementSource(audio).connect(analyser);
}

/* ------------------------------------------------------------ background music */
const pref = () => {
  try {
    return localStorage.getItem(PREF_KEY);
  } catch {
    return null;
  }
};
const savePref = (v: "on" | "off") => {
  try {
    localStorage.setItem(PREF_KEY, v);
  } catch {}
};

export async function startMusic() {
  ensureContext();
  if (!ctx || !analyser) return;
  if (ctx.state === "suspended") await ctx.resume();
  if (!score) {
    score = new AmbientScore(ctx);
    score.out.connect(analyser);
  }
  score.start(state.playing ? MUSIC_DUCKED : MUSIC_VOL);
  set({ music: true });
}

export function stopMusic() {
  score?.stop();
  set({ music: false });
}

export function toggleMusic() {
  if (state.music) {
    stopMusic();
    savePref("off");
  } else {
    savePref("on");
    void startMusic();
  }
}

/** Start the score on the visitor's first click, tap or key press, unless they turned it off before. */
export function armMusic() {
  if (typeof window === "undefined" || pref() === "off") return () => {};
  const events = ["pointerdown", "keydown", "touchend"] as const;
  const go = (e: Event) => {
    // the sound toggle handles its own click
    if ((e.target as HTMLElement | null)?.closest?.("[data-sound-toggle]")) return;
    cleanup();
    if (!state.music && pref() !== "off") void startMusic();
  };
  const cleanup = () => events.forEach((n) => window.removeEventListener(n, go, true));
  events.forEach((n) => window.addEventListener(n, go, true));
  return cleanup;
}

export async function play(clip: Clip) {
  ensureGraph();
  if (!audio || !ctx) return;
  if (ctx.state === "suspended") await ctx.resume();
  if (state.clip?.slug === clip.slug && state.playing) {
    audio.pause();
    return;
  }
  if (state.clip?.slug !== clip.slug) {
    audio.src = `/audio/${clip.slug}.mp3`;
    set({ clip });
  } else if (audio.ended) {
    audio.currentTime = 0;
  }
  try {
    await audio.play();
  } catch {
    set({ playing: false });
  }
}

export function stop() {
  audio?.pause();
}

export const currentTime = () => audio?.currentTime ?? 0;

/* ------------------------------------------------------------ per-frame sampling */
const idleT = new Float32Array(BANDS);
function idleTargets(t: number) {
  // a slow, phrase-like breathing that never fully stops
  const phrase = 0.5 + 0.5 * Math.sin(t * 0.7);
  for (let i = 0; i < BANDS; i++) {
    const x = i / (BANDS - 1);
    const formant = Math.exp(-((x - 0.28) ** 2) / 0.02) * 0.8 + Math.exp(-((x - 0.55) ** 2) / 0.03) * 0.45;
    const flicker = 0.5 + 0.5 * Math.sin(t * (2.1 + i * 0.37) + i);
    idleT[i] = 0.14 + formant * (0.32 + 0.3 * phrase) * (0.6 + 0.4 * flicker);
  }
}
function idle() {
  for (let i = 0; i < BANDS; i++) bands[i] += (idleT[i] - bands[i]) * 0.06;
}

function live() {
  if (!analyser || !freq) return;
  analyser.getByteFrequencyData(freq);
  // speech energy lives in the low and mid bins; map ~80 Hz..8 kHz onto 32 bands, log-spaced
  const n = freq.length;
  const nyquist = (ctx?.sampleRate ?? 48000) / 2;
  for (let i = 0; i < BANDS; i++) {
    const f0 = 80 * Math.pow(8000 / 80, i / BANDS);
    const f1 = 80 * Math.pow(8000 / 80, (i + 1) / BANDS);
    const a = Math.max(0, Math.floor((f0 / nyquist) * n));
    const b = Math.min(n - 1, Math.max(a + 1, Math.ceil((f1 / nyquist) * n)));
    let s = 0;
    for (let k = a; k < b; k++) s += freq[k];
    const gain = state.playing ? 1.15 + i * 0.03 : 1.2 + i * 0.05; // music sits lower than a voice; lift it
    const v = Math.max(idleT[i] * 0.5, Math.min(1, (s / (b - a) / 255) * gain));
    const k = v > bands[i] ? 0.5 : 0.12;
    bands[i] += (v - bands[i]) * k;
  }
}

const frameSubs = new Set<(t: number) => void>();
let raf = 0;
function tick(ts: number) {
  const t = ts / 1000;
  idleTargets(t);
  if (state.playing || state.music) live();
  else idle();
  let sum = 0;
  for (let i = 0; i < BANDS; i++) sum += bands[i];
  const target = Math.min(1, (sum / BANDS) * 2.4);
  level += (target - level) * 0.2;
  frameSubs.forEach((f) => f(t));
  raf = frameSubs.size ? requestAnimationFrame(tick) : 0;
}
/** Run `fn` every frame after the bands are updated. Returns an unsubscribe function. */
export function onFrame(fn: (t: number) => void) {
  frameSubs.add(fn);
  if (!raf) raf = requestAnimationFrame(tick);
  return () => {
    frameSubs.delete(fn);
  };
}
export const getBands = () => bands;
export const getLevel = () => level;
