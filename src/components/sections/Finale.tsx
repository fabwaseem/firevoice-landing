import { GitHubIcon, WindowsIcon } from "../ui";
import { site } from "@/lib/site";

export function Finale() {
  return (
    <section
      data-stage
      aria-labelledby="finale-title"
      className="stage relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_45%_at_50%_50%,rgba(5,5,7,0.82),rgba(5,5,7,0.4)_55%,transparent_80%)]"
      />
      <div className="container-x relative z-10 text-center">
        <p className="eyebrow !text-[#ff9c6e]">Your turn</p>
        <h2 id="finale-title" className="h-hero mx-auto mt-6 max-w-5xl text-balance">
          Give your words <span className="accent">a voice.</span>
        </h2>
        <p className="mx-auto mt-7 max-w-xl text-pretty text-lg text-white/65">
          Download FireVoice for Windows or Linux. You&apos;ll hear your first line in about a minute, and it never leaves your
          computer.
        </p>
        <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={site.downloadWindows} className="btn-fire !h-14 !px-8 !text-[17px]">
            <WindowsIcon className="size-4" /> Download for Windows
          </a>
          <a
            href={site.downloadLinux}
            className="inline-flex h-14 items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 text-[16px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/[0.1]"
          >
            Download for Linux
          </a>
          <a
            href={site.releases}
            className="inline-flex h-14 items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 text-[16px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/[0.1]"
          >
            <GitHubIcon className="size-4" /> Release notes
          </a>
        </div>
      </div>
    </section>
  );
}
