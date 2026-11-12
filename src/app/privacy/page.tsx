import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What FireVoice collects, why, how long it is kept, and how to turn it off or have it deleted.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "12 November 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[15.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <PageShell>
      <p className="text-[13px] font-medium tracking-wide text-fire-ink uppercase">Privacy</p>
      <h1 className="mt-2 text-[34px] leading-tight font-semibold tracking-tight sm:text-[42px]">What FireVoice collects, and why</h1>
      <p className="mt-3 text-[13.5px] text-muted">Last updated {UPDATED}</p>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 text-[15.5px] leading-relaxed text-ink-2 shadow-[var(--edge)]">
        <strong className="text-ink">The short version.</strong> Your voices, recordings, dictated text, documents and
        transcripts are made on your computer and never sent to us. To improve the app, FireVoice sends usage statistics,
        app and device details and your approximate location. You choose this when the app first opens, and you can turn
        it off at any time in Settings, then Privacy.
      </div>

      <Section title="Never collected">
        <p>
          The words you dictate or type, audio from your microphone, voices you clone or design, files you open or make,
          and anything the speech models produce. These stay on your computer. Listening for &ldquo;Hey FireVoice&rdquo; also
          happens on your computer.
        </p>
      </Section>

      <Section title="Collected when usage sharing is on">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink">The install:</strong> a random id for this copy of the app, a one-way hash of
            the computer&rsquo;s id (so a reinstall is recognised), app version, operating system and version, processor,
            memory, graphics card, screen size, language, time zone and computer name.
          </li>
          <li>
            <strong className="text-ink">Usage:</strong> what features were used and when, for example &ldquo;a dictation
            of 42 words went into Notepad&rdquo;, &ldquo;speech was made with the Inferno engine&rdquo;, pages opened, time
            in use, and settings changed. These are counts and names, never the content.
          </li>
          <li>
            <strong className="text-ink">Errors:</strong> crash reports with the error message and where it happened in
            the code.
          </li>
          <li>
            <strong className="text-ink">Network and location:</strong> the IP address the app connects from, and the
            country, region, city and approximate coordinates our network provider (Cloudflare) derives from it.
          </li>
        </ul>
      </Section>

      <Section title="Accounts (optional)">
        <p>
          A FireVoice account is not needed to use the app. If you make one we keep your email, name, a scrypt hash of
          your password (never the password), when and where (IP, country, city) you signed up and signed in, and which
          installs you are signed in on. Your usage is then linked to your account.
        </p>
      </Section>

      <Section title="Feedback and the waitlist">
        <p>
          Feedback keeps what you write, your email if you give it, the app version, and the IP address, country and city
          it came from. The waitlist keeps your email, what you asked to hear about, and where you signed up from.
        </p>
      </Section>

      <Section title="Why">
        <p>
          To learn which features people use and where the app struggles, fix crashes, plan versions for the systems people
          actually have, keep accounts secure, answer feedback, and tell you about what you signed up for. We do not sell
          data, show ads, or share it with anyone except the services that run this site (hosting and email delivery).
        </p>
      </Section>

      <Section title="How long">
        <p>
          Usage events are kept for up to two years and then deleted; daily totals without details may be kept longer.
          Account data is kept until you delete the account. Waitlist entries are kept until you ask to be removed.
        </p>
      </Section>

      <Section title="Your choices">
        <ul className="list-disc space-y-2 pl-5">
          <li>Turn usage sharing off in the app: Settings, then Privacy. Nothing more is sent.</li>
          <li>
            Erase what this computer sent: Settings, then Privacy, then &ldquo;Delete my usage data&rdquo;. It is removed
            from our servers at once.
          </li>
          <li>Delete your account in the app: Account, then Delete account.</li>
          <li>
            For a copy of your data, a correction, or anything else, write to us through the{" "}
            <a className="text-fire-ink underline underline-offset-4" href="/feedback">
              feedback page
            </a>{" "}
            and include your account email.
          </li>
        </ul>
      </Section>

      <Section title="Security">
        <p>
          Everything travels over HTTPS. Passwords are hashed with scrypt, and sign-in, install and email tokens are kept
          only as SHA-256 hashes. Access to the data is limited to the people who run FireVoice.
        </p>
      </Section>
    </PageShell>
  );
}
