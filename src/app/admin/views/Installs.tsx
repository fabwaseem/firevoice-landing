"use client";

import { useState } from "react";
import { Badge, Card, fmt, flag, ghost, Pager, Ranked, SearchBox, stamp, Table, td, useApi, when } from "../kit";

type Row = {
  id: string;
  appVersion: string;
  os: string;
  osVersion: string | null;
  country: string | null;
  city: string | null;
  lastIp: string | null;
  hostname: string | null;
  launches: number;
  consent: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  user: { id: string; email: string } | null;
};

export function Installs() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const { data, error } = useApi<{ rows: Row[]; total: number; page: number; pages: number }>(
    `/api/admin/installs?page=${page}&q=${encodeURIComponent(q)}`,
  );

  if (open) return <InstallDetail id={open} onBack={() => setOpen(null)} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Installs</h1>
          <p className="text-[13.5px] text-muted">{data ? `${fmt(data.total)} installs, most recently seen first` : " "}</p>
        </div>
        <SearchBox
          placeholder="Id, version, city, IP, computer, email"
          onSearch={(v) => {
            setQ(v);
            setPage(1);
          }}
        />
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <Card>
        <Table head={["Where", "App", "Computer", "Person", "Launches", "First seen", "Last seen"]} empty={data?.rows.length === 0}>
          {data?.rows.map((r) => (
            <tr key={r.id} className="cursor-pointer transition hover:bg-surface-2" onClick={() => setOpen(r.id)}>
              <td className={td}>
                {flag(r.country)} {r.city ?? r.country ?? "—"}
                <div className="text-[12px] text-faint">{r.lastIp ?? ""}</div>
              </td>
              <td className={td}>
                {r.appVersion} {!r.consent && <Badge tone="warn">sharing off</Badge>}
              </td>
              <td className={td}>
                {r.os} {r.osVersion}
                <div className="text-[12px] text-faint">{r.hostname ?? ""}</div>
              </td>
              <td className={td}>{r.user?.email ?? <span className="text-faint">—</span>}</td>
              <td className={`${td} tabular-nums`}>{fmt(r.launches)}</td>
              <td className={`${td} whitespace-nowrap text-muted`}>{when(r.firstSeenAt)}</td>
              <td className={`${td} whitespace-nowrap text-muted`}>{when(r.lastSeenAt)}</td>
            </tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </div>
  );
}

type Detail = {
  install: Record<string, unknown> & {
    id: string;
    user: { email: string; name: string | null } | null;
    events: { id: string; name: string; at: string; props: Record<string, unknown> | null; country: string | null; ip: string | null }[];
    daily: { day: string; events: number; words: number; seconds: number }[];
    crashes: { id: string; kind: string; message: string; createdAt: string }[];
    feedback: { id: string; kind: string; message: string; createdAt: string }[];
  };
  totals: { label: string; n: number }[];
};

const FIELDS: [string, string][] = [
  ["appVersion", "App version"],
  ["channel", "Channel"],
  ["os", "System"],
  ["osVersion", "System version"],
  ["arch", "Architecture"],
  ["cpu", "Processor"],
  ["cores", "Cores"],
  ["ramGb", "Memory (GB)"],
  ["gpu", "Graphics"],
  ["screen", "Screen"],
  ["hostname", "Computer name"],
  ["locale", "Language"],
  ["timezone", "Time zone"],
  ["firstIp", "First IP"],
  ["lastIp", "Last IP"],
  ["country", "Country"],
  ["region", "Region"],
  ["city", "City"],
  ["latitude", "Latitude"],
  ["longitude", "Longitude"],
  ["launches", "Launches"],
  ["consent", "Sharing usage"],
  ["firstSeenAt", "First seen"],
  ["lastSeenAt", "Last seen"],
];

function InstallDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { data, error } = useApi<Detail>(`/api/admin/installs/${id}`);
  const i = data?.install;
  const show = (k: string) => {
    const v = i?.[k];
    if (v === null || v === undefined || v === "") return "—";
    if (k.endsWith("At")) return stamp(v as string);
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return String(v);
  };
  return (
    <div className="space-y-4">
      <button className={ghost} onClick={onBack}>
        ← All installs
      </button>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          {flag(i?.country as string)} {(i?.city as string) ?? (i?.country as string) ?? "Install"} · {(i?.os as string) ?? ""}
        </h1>
        <p className="font-mono text-[12.5px] text-muted">
          {id}
          {i?.user && ` · ${i.user.email}`}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Computer and place" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-2">
            {FIELDS.map(([k, label]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5">
                <dt className="text-muted">{label}</dt>
                <dd className="truncate text-right">{show(k)}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card title="What it does most">
          <Ranked rows={data?.totals ?? []} />
        </Card>
      </div>
      <Card title="Last 100 events">
        <Table head={["Event", "Details", "Where", "When"]} empty={i?.events.length === 0}>
          {i?.events.map((e) => (
            <tr key={e.id}>
              <td className={`${td} font-medium`}>{e.name}</td>
              <td className={`${td} max-w-md font-mono text-[12px] break-all text-ink-2`}>{e.props ? JSON.stringify(e.props) : ""}</td>
              <td className={`${td} whitespace-nowrap text-muted`}>
                {flag(e.country)} {e.ip}
              </td>
              <td className={`${td} whitespace-nowrap text-muted`}>{stamp(e.at)}</td>
            </tr>
          ))}
        </Table>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Crashes">
          {i?.crashes.length ? (
            <ul className="divide-y divide-line text-[13.5px]">
              {i.crashes.map((c) => (
                <li key={c.id} className="py-2">
                  <Badge tone="fire">{c.kind}</Badge> {c.message} <span className="text-faint">· {when(c.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-faint">None</p>
          )}
        </Card>
        <Card title="Feedback">
          {i?.feedback.length ? (
            <ul className="divide-y divide-line text-[13.5px]">
              {i.feedback.map((f) => (
                <li key={f.id} className="py-2">
                  <Badge>{f.kind.toLowerCase()}</Badge> {f.message} <span className="text-faint">· {when(f.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-faint">None</p>
          )}
        </Card>
      </div>
    </div>
  );
}
