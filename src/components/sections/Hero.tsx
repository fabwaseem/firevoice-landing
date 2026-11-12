import { ArrowDown } from "@/components/icons";
import { WindowsIcon } from "../ui";
import { site } from "@/lib/site";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

export function Hero() {
  return (
    <section id="top" data-stage className="stage relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* a soft darkening behind the words, with no edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_42%_at_50%_44%,rgba(5,5,7,0.78),rgba(5,5,7,0.35)_55%,transparent_80%)]"
      />
      <div className="container-x relative z-10 flex flex-1 flex-col items-center justify-center pb-[6vh] pt-36 text-center">
        <a
          href="#dictation"
          style={i(0)}
          className="enter inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] py-1 pl-1 pr-3.5 text-[13px] text-white/75 backdrop-blur-md transition-colors hover:text-white"
        >
          <span className="rounded-full fire-gradient px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
          Just say &ldquo;Hey FireVoice&rdquo;
          <span aria-hidden>→</span>
        </a>

        <h1 style={i(1)} className="enter h-hero mt-7 text-balance">
          Human voices.
          <br />
          Made on <span className="accent">your</span> machine.
        </h1>

        <p
          style={i(2)}
          className="enter mt-7 max-w-[34rem] text-pretty text-[17px] leading-relaxed text-white/65 sm:text-lg"
        >
          Lifelike speech, voice cloning and dictation that run entirely on your own computer. Nothing you write or say is
          ever uploaded.
        </p>

        <div style={i(3)} className="enter mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a href={site.downloadWindows} className="btn-fire !h-14 !px-7 !text-[16px]">
            <WindowsIcon className="size-4" /> Download for Windows
          </a>
          <a
            href={site.downloadLinux}
            className="inline-flex h-14 items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-6 text-[16px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/[0.12]"
          >
            Download for Linux
          </a>
          <a
            href="#voices"
            className="group inline-flex h-14 items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-6 text-[16px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/[0.12]"
          >
            Hear the voices
            <ArrowDown className="size-4" />
          </a>
        </div>
        <p style={i(4)} className="enter mt-5 text-[13px] text-white/45">
          Windows and Linux · Runs on your GPU, or your processor without one · Ready in minutes
        </p>
      </div>
    </section>
  );
}
