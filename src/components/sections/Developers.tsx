"use client";

import { useState } from "react";
import { Bot, Check, Copy, FileJson, Plug, Radio } from "@/components/icons";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui";

const tabs = {
  curl: `# OpenAI-style speech, served by FireVoice on your machine
curl http://localhost:8787/v1/audio/speech \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "tts-1",
    "voice": "nova",
    "input": "Hello from my own GPU.",
    "response_format": "wav"
  }' \\
  --output hello.wav`,
  python: `# Point the OpenAI SDK at FireVoice. Same code, no cloud.
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8787/v1", api_key="local")

with client.audio.speech.with_streaming_response.create(
    model="tts-1",
    voice="nova",
    input="Hello from my own GPU.",
) as res:
    res.stream_to_file("hello.mp3")`,
  javascript: `// FireVoice's own API: every engine, voice and style
const res = await fetch("http://localhost:8787/api/v1/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "The storm came in low. [pause 400ms] She smiled.",
    voice: "default",
    style: "storyteller",
  }),
});
const audio = await res.blob(); // wav or mp3, ready to play`,
} as const;
type Tab = keyof typeof tabs;

/** a tiny highlighter: comments, strings, numbers and a few keywords */
function highlight(code: string) {
  const re = /(#[^\n]*|\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(from|import|with|as|const|await|async|true|false|None)\b|\b(\d+)\b/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = m[1] ? "text-faint italic" : m[2] ? "text-[#ffb184]" : m[3] ? "text-[#a5b4ff]" : "text-[#7ee0b5]";
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

const points = [
  { icon: FileJson, t: "OpenAPI docs built in", d: "Every route is described at /docs, ready to try in the browser." },
  { icon: Plug, t: "Drop-in compatible", d: "OpenAI- and ElevenLabs-style routes, so existing code just works." },
  { icon: Bot, t: "Made for AI agents", d: "Agents read the schema and call voices, dubbing and transcription on their own." },
  { icon: Radio, t: "Streams and jobs", d: "Stream audio as it is made, or queue long jobs and follow their progress." },
];

export function Developers() {
  const [tab, setTab] = useState<Tab>("curl");
  const [copied, setCopied] = useState(false);
  return (
    <section id="developers" className="relative py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.15fr] [&>*]:min-w-0">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Developers and agents"
            title={
              <>
                A local voice API, <span className="accent">no keys</span> required.
              </>
            }
          >
            FireVoice runs an HTTP API on your computer. Your scripts, apps and AI agents get the same voices you use in
            the app, with no usage bills and no rate limits.
          </SectionHeader>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {points.map(({ icon: Icon, t, d }, i) => (
              <Reveal as="li" key={t} delay={i * 0.06}>
                <Icon className="size-5 text-fire" />
                <p className="mt-3 font-medium text-ink">{t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{d}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal>
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0b0c10] shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 px-2">
              <div role="tablist" aria-label="Code examples" className="flex">
                {(Object.keys(tabs) as Tab[]).map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    aria-controls="code-panel"
                    onClick={() => setTab(t)}
                    className={`relative px-3.5 py-3 font-mono text-[12px] transition-colors ${
                      tab === t ? "text-white" : "text-white/45 hover:text-white/75"
                    }`}
                  >
                    {t}
                    {tab === t && <span className="absolute inset-x-3 bottom-0 h-px bg-[#ff7a45]" />}
                  </button>
                ))}
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(tabs[tab]);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {}
                }}
                className="mr-1 grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
                aria-label="Copy code"
              >
                {copied ? <Check className="size-4 text-[#7ee0b5]" /> : <Copy className="size-4" />}
              </button>
            </div>
            <pre
              id="code-panel"
              role="tabpanel"
              tabIndex={0}
              className="min-h-[300px] overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75] text-white/85 sm:text-[13px]"
            >
              <code>{highlight(tabs[tab])}</code>
            </pre>
            <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3 font-mono text-[11px] text-white/45">
              <span className="size-1.5 rounded-full bg-[#3dd08f]" /> localhost:8787 · OpenAPI at /docs
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
