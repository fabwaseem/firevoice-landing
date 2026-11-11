import { site } from "@/lib/site";

// A direct download of the latest version: the release files carry the version in their names, so a fixed link cannot
// name them. The version comes from the latest release's latest.json (the app's own update feed: a plain file, not
// GitHub's rate-limited API, cached here for five minutes), and the file name follows from it.
//   /download/windows       the installer (.exe)
//   /download/windows-msi   the MSI package
//   /download/linux         the AppImage (runs on any distribution and updates itself)
//   /download/linux-deb     the .deb (Ubuntu, Debian, Mint)
//   /download/linux-rpm     the .rpm (Fedora, openSUSE)
const FILES: Record<string, (v: string) => string> = {
  windows: (v) => `FireVoice_${v}_x64-setup.exe`,
  "windows-msi": (v) => `FireVoice_${v}_x64_en-US.msi`,
  linux: (v) => `FireVoice_${v}_amd64.AppImage`,
  "linux-deb": (v) => `FireVoice_${v}_amd64.deb`,
  "linux-rpm": (v) => `FireVoice-${v}-1.x86_64.rpm`,
};

export async function GET(_req: Request, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;
  const file = FILES[platform];
  if (!file) return Response.redirect(site.releases, 302);
  try {
    const r = await fetch(`https://github.com/${site.releasesRepo}/releases/latest/download/latest.json`, { next: { revalidate: 300 } });
    const version = r.ok ? String(((await r.json()) as { version?: string }).version ?? "") : "";
    if (/^\d+\.\d+\.\d+$/.test(version)) {
      return Response.redirect(`https://github.com/${site.releasesRepo}/releases/download/v${version}/${file(version)}`, 302);
    }
  } catch {
    // GitHub unreachable: fall through to the release page, which always lists the files
  }
  return Response.redirect(site.download, 302);
}
