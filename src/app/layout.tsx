import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// the app's typeface (Urbanist), everywhere
const sans = Urbanist({ variable: "--font-urbanist", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s · FireVoice" },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "text to speech",
    "local TTS",
    "voice cloning",
    "dictation",
    "speech to text",
    "AI voices",
    "dubbing",
    "transcription",
    "private",
    "offline",
    "Windows",
    "Linux",
    "GPU",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f7" },
    { media: "(prefers-color-scheme: dark)", color: "#f3f4f7" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Windows, Linux",
  description: site.description,
  downloadUrl: site.download,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={sans.variable}
    >
      <body className="min-h-dvh">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
