"use client";

import { useState } from "react";
import { Card, fmt, flag, Ranked, Stat, Trend, useApi, when, WorldDots } from "../kit";

type Row = { label: string; n: number };
type Data = {
  days: number;
  totals: Record<"installs" | "newInstalls" | "dau" | "wau" | "mau" | "users" | "newUsers" | "events" | "words" | "hours" | "feedbackNew" | "waitlist" | "crashes", number>;
  daily: { day: string; active: number; events: number; words: number; minutes: number; new: number }[];
  versions: Row[];
  systems: Row[];
  countries: Row[];
  cities: Row[];
  events: Row[];
  recent: { id: string; os: string; appVersion: string; country: string | null; city: string | null; firstSeenAt: string; user: { email: string } | null }[];
  points: { latitude: number | null; longitude: number | null }[];
};

const RANGES = [7, 30, 90, 365];

export function Overview() {
  const [days, setDays] = useState(30);
  const { data, error } = useApi<Data>(`/api/admin/overview?days=${days}`);
  const t = data?.totals;
  const series = (k: "active" | "events" | "words" | "minutes" | "new") => (data?.daily ?? []).map((d) => ({ day: d.day, v: d[k] }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Overview</h1>
          <p className="text-[13.5px] text-muted">The last {days} days, live from the database.</p>
        </div>
        <div className="flex rounded-lg border border-line-strong bg-surface p-0.5" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className="h-7 rounded-md px-2.5 text-[12.5px] font-medium text-muted aria-pressed:bg-surface-3 aria-pressed:text-ink"
            >
              {r === 365 ? "1 y" : `${r} d`}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Stat label="Installs" value={t ? fmt(t.installs) : "…"} hint={t ? `+${fmt(t.newInstalls)} in range` : " "} accent />
        <Stat label="Active today" value={t ? fmt(t.dau) : "…"} hint={t ? `${fmt(t.wau)} this week · ${fmt(t.mau)} month` : " "} />
        <Stat label="Accounts" value={t ? fmt(t.users) : "…"} hint={t ? `+${fmt(t.newUsers)} in range` : " "} />
        <Stat label="Words dictated" value={t ? fmt(t.words) : "…"} hint={t ? `${fmt(t.hours)} h in use` : " "} />
        <Stat label="Events" value={t ? fmt(t.events) : "…"} hint="in range" />
        <Stat label="To read" value={t ? fmt(t.feedbackNew) : "…"} hint={t ? `feedback · ${fmt(t.crashes)} crashes · ${fmt(t.waitlist)} waitlist` : " "} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Active installs">
          <Trend points={series("active")} label="active" />
        </Card>
        <Card title="New installs">
          <Trend points={series("new")} label="new" />
        </Card>
        <Card title="Words dictated">
          <Trend points={series("words")} label="words" />
        </Card>
        <Card title="Minutes in use">
          <Trend points={series("minutes")} label="minutes" />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Top events">
          <Ranked rows={data?.events ?? []} />
        </Card>
        <Card title="App versions">
          <Ranked rows={data?.versions ?? []} />
        </Card>
        <Card title="Systems">
          <Ranked rows={data?.systems ?? []} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Where" className="lg:col-span-2">
          <WorldDots points={data?.points ?? []} />
        </Card>
        <Card title="Countries">
          <Ranked rows={(data?.countries ?? []).map((r) => ({ ...r, label: `${flag(r.label)} ${r.label}` }))} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Cities">
          <Ranked rows={data?.cities ?? []} empty="No cities yet (needs Cloudflare's location headers)" />
        </Card>
        <Card title="Newest installs">
          <ul className="divide-y divide-line">
            {(data?.recent ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-[13.5px]">
                <span className="truncate">
                  {flag(r.country)} {r.city ?? r.country ?? "Unknown place"} · {r.os} {r.appVersion}
                  {r.user && <span className="text-muted"> · {r.user.email}</span>}
                </span>
                <span className="shrink-0 text-[12.5px] text-faint">{when(r.firstSeenAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
