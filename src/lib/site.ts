export const site = {
  name: "FireVoice",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  title: "FireVoice: natural voices that run on your own computer",
  description:
    "Expressive text to speech, voice cloning, dictation in any program, dialogue, dubbing and transcription. FireVoice runs on your own GPU, so nothing you write or say is uploaded.",
  download: "https://github.com/fabwaseem/firevoice-releases/releases/latest",
  releases: "https://github.com/fabwaseem/firevoice-releases/releases",
};

export const nav = [
  { href: "#voices", label: "Voices" },
  { href: "#chapters", label: "Features" },
  { href: "#dictation", label: "Dictation" },
  { href: "#engines", label: "Engines" },
  { href: "#developers", label: "Developers" },
  { href: "#faq", label: "FAQ" },
];
