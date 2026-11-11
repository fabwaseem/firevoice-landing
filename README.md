# FireVoice landing page

The marketing site for FireVoice, the desktop app that makes natural voices on your own computer.

Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Three.js through React Three Fiber, GSAP ScrollTrigger + Lenis,
and Motion. The design direction is written down in [`docs/DESIGN.md`](docs/DESIGN.md).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

Set `NEXT_PUBLIC_SITE_URL` to the real domain before deploying, so canonical links, Open Graph and the sitemap use it.

## What makes it move

- **The voice field** (`src/components/three/VoiceField.tsx`): ~100k glowing particles forming a 3D waveform landscape
  behind the whole page. A fixed backdrop: "stage" sections (`data-stage`: hero, manifesto, finale, footer) are
  transparent windows onto it; the content band in between is opaque and melts into it with long gradients.
- **One audio engine** (`src/lib/audio-engine.ts`): plays the real FireVoice renders, runs the background score, and
  analyses both into 32 frequency bands that drive the field and every live waveform. Music ducks under a voice clip.
- **The background score** (`src/lib/music.ts`): an original generative ambient piece composed live with Web Audio
  (pads, heartbeat pulse, bass, bell arpeggios, reverb). No audio files, nothing to license. It starts on the
  visitor's first click or key press; the "Sound" toggle in the nav turns it off, and that choice is remembered.
- **Real renders**: `public/audio/*.mp3` were rendered by FireVoice itself (flagship engine, designed synthetic
  voices); `src/data/clips.json` holds their waveform peaks and word timings (from FireVoice's own transcription).
  Avatars in `public/avatars` come from the app's voice library.

### When the 3D is skipped or deferred

- Its code is a separate chunk. Desktops load it when the browser is idle; phones and tablets on the first touch,
  scroll or key press. Particle count is lower on phones and smaller CPUs.
- Skipped (a still SVG wave and glow remain) for reduced motion, data saver, fewer than 4 CPU cores or under 4 GB of
  memory, or no WebGL 2. Frames stop whenever no stage section is on screen.
- Reduced motion also turns off smooth scrolling, the scrubbed manifesto and the entrance animations.

### Engine names

The site never names the underlying open-source models. It uses the app's own engine brands (Inferno, Torch,
Beacon, Forge, Hearth, Firebrand, Firestorm, Candle, Magma, Smoulder, Flare, Flicker, Spark, Phoenix, Flash) from
`src/data/engines.json`.

## Checked

Lighthouse (production build, local): desktop 100 performance / 100 accessibility / 100 best practices / 100 SEO;
mobile 89 / 100 / 100 / 100. Screenshots are in `docs/screenshots/`.
