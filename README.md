# FireVoice site and cloud

The website for FireVoice (firevoice.fabwaseem.com) and the small backend the desktop app talks to.

Next.js 16 (App Router, TypeScript), Tailwind CSS 4, GSAP ScrollTrigger + Lenis for the scroll scenes, Prisma 7 on
Postgres.

```bash
pnpm install
pnpm dev                       # http://localhost:3000
pnpm db:migrate                # apply schema changes in development
node scripts/api-check.mjs http://localhost:3000 <admin password>   # walks the whole API
```

Settings are in `.env.example` (database, `AUTH_SECRET`, `ADMIN_PASSWORD`, optional Google sign-in and SMTP).

## The site

- `src/site/`: the home page. `ui.tsx` (the FireVoice pill, the download button, headings), `motion.tsx` (smooth
  scroll, `useScene` for pinned scroll scenes, `Reveal`), `Nav.tsx`, `Footer.tsx`, and one file per section in
  `sections/`: Hero, Apps, Speed, HowItWorks, Features, Privacy, Voices, Faq, Closing.
- The look: warm paper, serif headings with an italic word, the app's fire orange, and big rounded sheets that slide
  over each other. Light only. All art is CSS/SVG; the voice cards play real FireVoice renders from `public/audio`.
- Reduced motion turns off smooth scrolling, pinning and loops; every scene has a still, finished layout.
- Never name the underlying models: use the app's engine brands (`src/data/engines.json`). No testimonials, logos or
  numbers we cannot back.

## Accounts

- `/signin`: "Get started": Google, or an email that then asks for its password, Google, or a new account.
- `/account`: name, password, delete. `/link?code=...`: the desktop app signing in through the browser.
- `/admin`: the private dashboard (installs, accounts, events, feedback, waitlist, crashes, licences).

## Deploying

Coolify builds the Dockerfile; the container applies database migrations on start. Push `main`, then Deploy.
