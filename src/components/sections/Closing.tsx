import { Logo } from "../ui";
import { nav, site } from "@/lib/site";


export function Footer() {
  return (
    <footer className="relative z-10">
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
      <div className="container-x border-t border-white/10 py-6 text-[12px] text-faint">
        © 2026 FireVoice. Made for people who care where their voice goes.
      </div>
    </footer>
  );
}
