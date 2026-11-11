import { LiveBars } from "../LiveBars";
import { GitHubIcon, Logo, WindowsIcon } from "../ui";
import { nav, site } from "@/lib/site";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] blur-2xl" />
        <div className="grid-bg absolute inset-0 opacity-60" />
      </div>
      <div className="container-x relative text-center">
        <div className="mx-auto mb-8 w-fit text-fire">
          <LiveBars n={24} className="h-12" gain={2.6} />
        </div>
        <h2 id="cta-title" className="h-display mx-auto max-w-4xl text-balance">
          Give your words a <span className="accent">voice.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted">
          Download FireVoice for Windows and make your first voice in about a minute.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={site.download} className="btn-fire !h-12 w-full !px-7 !text-base sm:w-auto">
            <WindowsIcon className="size-4" /> Download for Windows
          </a>
          <a href={site.releases} className="btn-ghost !h-12 w-full !px-6 !text-base sm:w-auto">
            <GitHubIcon className="size-4" /> Release notes
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-8 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a href="#top" className="flex items-center gap-2.5 font-semibold text-ink">
            <Logo size={24} /> FireVoice
          </a>
          <p className="mt-2 text-[13px] text-faint">Natural voices that run on your own computer.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-ink">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.releases} className="hover:text-ink">
                Releases
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container-x border-t border-line py-6 text-[12px] text-faint">
        © 2026 FireVoice. Made for people who care where their voice goes.
      </div>
    </footer>
  );
}
