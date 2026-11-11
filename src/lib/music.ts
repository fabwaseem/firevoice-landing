"use client";

/**
 * An original, generative ambient score, composed live with Web Audio (no audio files, nothing to license).
 * Warm detuned pads move through a slow four-chord loop, a soft heartbeat pulses on the beat, a sine bass anchors it,
 * and bell-like arpeggio notes sparkle through a long reverb and delay.
 */

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const BARS_PER_CHORD = 2;

// Am9 - Fmaj7(#11) - Cmaj7 - G6/B : warm, hopeful, a little cinematic
const CHORDS: number[][] = [
  [57, 60, 64, 67, 71], // A C E G B
  [53, 57, 60, 64, 71], // F A C E B
  [48, 55, 59, 64, 67], // C G B E G
  [47, 55, 59, 62, 64], // B G B D E
];
const ROOTS = [33, 29, 36, 31]; // A1 F1 C2 G1
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function impulse(ctx: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

export class AmbientScore {
  private ctx: AudioContext;
  readonly out: GainNode;
  private padBus: GainNode;
  private fxBus: GainNode;
  private filter: BiquadFilterNode;
  private timer = 0;
  private nextBar = 0;
  private bar = 0;
  private running = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0;

    const reverb = ctx.createConvolver();
    reverb.buffer = impulse(ctx, 4.5, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(this.out);

    const delay = ctx.createDelay(2);
    delay.delayTime.value = BEAT * 0.75;
    const fb = ctx.createGain();
    fb.gain.value = 0.38;
    const delayTone = ctx.createBiquadFilter();
    delayTone.type = "lowpass";
    delayTone.frequency.value = 2600;
    delay.connect(delayTone).connect(fb).connect(delay);
    delayTone.connect(this.out);
    delayTone.connect(reverb);

    // pads: one shared, slowly breathing low-pass
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 900;
    this.filter.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 520;
    lfo.connect(lfoAmt).connect(this.filter.frequency);
    lfo.start();

    this.padBus = ctx.createGain();
    this.padBus.gain.value = 0.9;
    this.padBus.connect(this.filter);
    this.filter.connect(this.out);
    this.filter.connect(reverb);

    this.fxBus = ctx.createGain();
    this.fxBus.gain.value = 1;
    this.fxBus.connect(delay);
    this.fxBus.connect(reverb);
    this.fxBus.connect(this.out);
  }

  start(volume = 0.5) {
    if (this.running) return;
    this.running = true;
    const t = this.ctx.currentTime;
    this.nextBar = t + 0.08;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setValueAtTime(this.out.gain.value, t);
    this.out.gain.linearRampToValueAtTime(volume, t + 3.5);
    this.timer = window.setInterval(() => this.schedule(), 120);
    this.schedule();
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    const t = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setValueAtTime(this.out.gain.value, t);
    this.out.gain.linearRampToValueAtTime(0, t + 1.2);
    window.clearInterval(this.timer);
  }

  /** duck under a voice clip, then come back */
  setLevel(volume: number, seconds = 0.6) {
    if (!this.running) return;
    const t = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setValueAtTime(this.out.gain.value, t);
    this.out.gain.linearRampToValueAtTime(volume, t + seconds);
  }

  private schedule() {
    while (this.nextBar < this.ctx.currentTime + 1.5) {
      this.playBar(this.bar, this.nextBar);
      this.nextBar += BAR;
      this.bar++;
    }
  }

  private playBar(bar: number, t: number) {
    const ci = Math.floor(bar / BARS_PER_CHORD) % CHORDS.length;
    const chord = CHORDS[ci];
    const firstOfChord = bar % BARS_PER_CHORD === 0;
    if (firstOfChord) {
      const len = BAR * BARS_PER_CHORD;
      chord.forEach((m, i) => this.pad(hz(m), t, len + 1.5, i));
      this.bass(hz(ROOTS[ci]), t, len);
    }
    for (let b = 0; b < 4; b++) this.heartbeat(t + b * BEAT, b === 0 ? 1 : 0.6);
    // sparkles: a few chord tones up high, on eighth notes, not every slot
    for (let s = 0; s < 8; s++) {
      const seed = Math.sin((bar * 8 + s) * 12.9898) * 43758.5453;
      const r = seed - Math.floor(seed);
      if (r < 0.42) {
        const note = chord[Math.floor(r * 100) % chord.length] + 24 + (r < 0.12 ? 12 : 0);
        this.bell(hz(note), t + s * (BEAT / 2), 0.05 + r * 0.06);
      }
    }
  }

  private pad(f: number, t: number, len: number, i: number) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 2.4);
    g.gain.setValueAtTime(0.05, t + len - 2.2);
    g.gain.linearRampToValueAtTime(0, t + len);
    g.connect(this.padBus);
    for (const det of [-7, 6]) {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "sawtooth" : "triangle";
      o.frequency.value = f;
      o.detune.value = det + i;
      o.connect(g);
      o.start(t);
      o.stop(t + len + 0.1);
    }
  }

  private bass(f: number, t: number, len: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 1.2);
    g.gain.setValueAtTime(0.16, t + len - 1);
    g.gain.linearRampToValueAtTime(0, t + len);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + len + 0.1);
  }

  private heartbeat(t: number, accent: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22 * accent, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.42);
  }

  private bell(f: number, t: number, vol: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = f * 2.01;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(this.fxBus);
    o.start(t);
    o2.start(t);
    o.stop(t + 1.7);
    o2.stop(t + 1.7);
  }
}
