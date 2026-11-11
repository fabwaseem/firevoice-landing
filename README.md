# FireVoice landing page

The marketing site for FireVoice, the desktop app that makes natural voices on your own computer.

Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Three.js through React Three Fiber and drei, and Motion.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

Set `NEXT_PUBLIC_SITE_URL` to the real domain before deploying, so canonical links, Open Graph and the sitemap use it.

## How it is put together

| where                                 | what                                                                                   |
|---------------------------------------|----------------------------------------------------------------------------------------|
| `src/app/page.tsx`                    | the page: sections in order, plus FAQ structured data                                  |
| `src/app/layout.tsx`                  | fonts, metadata, theme provider (light, dark, follows the system), app structured data |
| `src/app/opengraph-image.tsx`         | the 1200x630 share image, generated at build time                                      |
| `src/components/sections/*`           | one file per section                                                                   |
| `src/components/three/OrbScene.tsx`   | the 3D hero: a shader orb, a waveform ring, orbiting dots                              |
| `src/components/three/HeroVisual.tsx` | decides if and when the 3D loads, and shows a CSS orb before and instead of it         |
| `src/lib/voice-level.ts`              | one shared "voice level" that drives the orb and every live waveform                   |
| `src/lib/site.ts`                     | name, URLs (download link), navigation                                                 |

### The 3D, and when it is skipped

- The 3D code is its own chunk and is never part of the first load.
- Desktops load it when the browser is idle. Phones and tablets load it on the first touch, scroll or key press.
- It is skipped entirely (the CSS orb stays) when the visitor prefers reduced motion, has data saver on, has fewer
  than 4 CPU cores or less than 4 GB of memory, or the browser has no WebGL.
- It stops drawing frames while the hero is off screen, and lowers its resolution if the frame rate drops.
- "Talk to the orb" lets the orb react to the visitor's microphone. The audio is analysed in the tab only; nothing is
  recorded or sent.

### Engine names

The site never names the underlying open-source models. It uses FireVoice's own engine names (Ember, Blaze, Flint,
Cinder, Kindle, Hearth, Spark, Forge, Pyre) in `src/components/sections/Engines.tsx` and the product mockup.

## Checked

Lighthouse (production build, local): mobile 90 performance, 100 accessibility, 100 best practices, 100 SEO;
desktop 97 / 100 / 100 / 100. Screenshots are in `docs/screenshots/`.
