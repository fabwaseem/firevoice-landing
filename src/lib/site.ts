export const site = {
  name: "FireVoice",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://firevoice.fabwaseem.com",
  title: "FireVoice: natural voices that run on your own computer",
  description:
    "Expressive text to speech, voice cloning, dictation in any program, dialogue, dubbing and transcription. FireVoice runs on your own computer, so nothing you write or say is uploaded.",
  // the release page (every file); the buttons use the direct downloads below (src/app/download/[platform]/route.ts)
  download: "https://github.com/fabwaseem/firevoice-releases/releases/latest",
  downloadWindows: "/download/windows",
  downloadLinux: "/download/linux",
  downloadMac: "/download/macos",
  releasesRepo: "fabwaseem/firevoice-releases",
  releases: "https://github.com/fabwaseem/firevoice-releases/releases",
};
