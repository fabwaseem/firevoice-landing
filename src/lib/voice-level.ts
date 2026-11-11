"use client";

/**
 * One shared "how loud is the voice right now" value (0..1), read every frame by the 3D orb and the HTML
 * waveforms. Sources: an idle "speech-like" pattern, a scripted demo utterance, or the visitor's microphone
 * (analysed in this tab only; nothing is recorded or sent).
 */
type Source = "idle" | "demo" | "mic";

const state = {
  level: 0,
  source: "idle" as Source,
  demoUntil: 0,
  analyser: null as AnalyserNode | null,
  stream: null as MediaStream | null,
  ctx: null as AudioContext | null,
  buf: null as Uint8Array<ArrayBuffer> | null,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribeSource(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export const getSource = () => state.source;

/** syllable-like envelope: bursts of energy with short gaps, like a sentence being spoken */
function speechEnvelope(t: number, strength: number) {
  const syll = Math.max(0, Math.sin(t * 9.3) * 0.6 + Math.sin(t * 5.1 + 1.3) * 0.4);
  const phrase = Math.max(0, Math.sin(t * 0.9) * 0.7 + 0.45);
  const jitter = (Math.sin(t * 31.7) + Math.sin(t * 17.3)) * 0.06;
  return Math.min(1, Math.max(0, (syll * phrase + jitter) * strength));
}

/** call once per frame; returns the smoothed level */
export function sampleLevel(timeSec: number) {
  let target = 0;
  const now = performance.now();
  if (state.source === "mic" && state.analyser && state.buf) {
    state.analyser.getByteTimeDomainData(state.buf);
    let sum = 0;
    for (let i = 0; i < state.buf.length; i++) {
      const v = (state.buf[i] - 128) / 128;
      sum += v * v;
    }
    target = Math.min(1, Math.sqrt(sum / state.buf.length) * 5.5);
  } else if (state.source === "demo" && now < state.demoUntil) {
    target = speechEnvelope(timeSec, 1);
  } else {
    if (state.source === "demo") {
      state.source = "idle";
      emit();
    }
    target = speechEnvelope(timeSec * 0.8, 0.32);
  }
  const k = target > state.level ? 0.35 : 0.12;
  state.level += (target - state.level) * k;
  return state.level;
}

export const currentLevel = () => state.level;

/* one rAF loop samples the level once per frame for every reader */
const frameSubs = new Set<(level: number, t: number) => void>();
let raf = 0;
function tick(ts: number) {
  const t = ts / 1000;
  const level = sampleLevel(t);
  frameSubs.forEach((f) => f(level, t));
  raf = frameSubs.size ? requestAnimationFrame(tick) : 0;
}
export function subscribeFrame(fn: (level: number, t: number) => void) {
  frameSubs.add(fn);
  if (!raf) raf = requestAnimationFrame(tick);
  return () => {
    frameSubs.delete(fn);
  };
}

export function playDemo(seconds = 4) {
  if (state.source === "mic") return;
  state.source = "demo";
  state.demoUntil = performance.now() + seconds * 1000;
  emit();
}

export async function startMic(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    src.connect(analyser);
    state.stream = stream;
    state.ctx = ctx;
    state.analyser = analyser;
    state.buf = new Uint8Array(new ArrayBuffer(analyser.fftSize));
    state.source = "mic";
    emit();
    return true;
  } catch {
    return false;
  }
}

export function stopMic() {
  state.stream?.getTracks().forEach((t) => t.stop());
  state.ctx?.close().catch(() => {});
  state.stream = null;
  state.ctx = null;
  state.analyser = null;
  state.buf = null;
  state.source = "idle";
  emit();
}
