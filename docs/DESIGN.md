# FireVoice landing page: design contract (v2)

## The job
Make a visitor *hear* FireVoice in the first seconds, feel that it is premium and private, and press
"Download for Windows". Everything else supports that.

## Direction: "cinematic, alive, fire"
Dark, film-like, full-bleed. One living WebGL scene carries the page; the rest is calm and confident.

References studied (structure only, nothing copied): award-winning WebGL studios (full-viewport scenes,
scroll-driven cameras, particles, grain), Cartesia (a playable voice persona in the hero), ElevenLabs (voice
picker with play buttons), Linear (cinematic product reveal, light beams), Apple product pages (scroll-scrubbed
text that lights up line by line).

## Signature moments
1. **Hero: the voice field.** ~100k glowing particles form a 3D waveform terrain across the whole screen,
   receding to a horizon. It breathes at rest, ripples under the cursor, and when you press **Hear FireVoice**
   it is driven by the *real audio's* frequency bands while the words appear as live captions.
2. **Manifesto, scrubbed by scroll.** One giant paragraph about privacy that lights up word by word.
3. **Hear the range.** A gallery of real FireVoice renders (designed, synthetic voices), each card with its
   real waveform, character avatar and one-tap play. Playing any clip also drives the hero field.
4. **Product reveal.** The app window rises out of a beam of fire light and flattens as you scroll.
5. **Feature chapters.** Sticky scrolling: the chapter list on the left advances while one stage on the right
   swaps live demos (Speak, Clone, Design, Dictate, Dialogue, Dub, Transcribe, Sound).
6. **15 engines, all fire.** The app's own engine brands (Inferno, Torch, Beacon, Forge...) as a grid with
   real quality/speed/VRAM tiers. Never the underlying model names.
7. **Finale.** The field returns behind a giant "Download" call.

## Rules
- Typography: Inter Tight-like tight display (Inter, -0.05em), Instrument Serif italic for one accent phrase
  per heading, JetBrains Mono for labels. Display sizes up to 9rem.
- Color: near-black (#050507) stage, fire gradient #ff8a4c -> #ff4d2e -> #ff2e63 for light only, warm white ink.
  Light theme kept for the content sections; the hero, manifesto and finale stay dark (they are "stages").
- Motion: Lenis smooth scroll + GSAP ScrollTrigger for pinned/scrubbed scenes; everything respects
  prefers-reduced-motion (static frames, no scrubbing, no smooth scroll).
- Performance: the WebGL chunk loads after first paint (desktop: idle; touch: first interaction); particle count
  scales with device; frames stop when off screen. LCP is the headline, never the canvas.
- Reject: small decorative objects beside text, card grids of equal weight, fake audio, gradients on body text.
