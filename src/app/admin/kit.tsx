"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// The dashboard's small toolkit: data loading, cards, numbers, charts and tables, in the site's own colours.

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const r = await fetch(path, {
    method: init?.method ?? "GET",
    headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = (await r.json().catch(() => ({}))) as { message?: string };
  if (!r.ok) {
    if (r.status === 401) window.dispatchEvent(new Event("fv-admin-signed-out"));
    throw new ApiError(r.status, data.message ?? `Request failed (${r.status})`);
  }
  return data as T;
}

/** Loads `path` (again whenever it changes, or on reload()); keeps the last data while the next loads, and drops
 * answers that arrive after a newer request. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const seq = useRef(0);
  useEffect(() => {
    if (!path) return;
    const mine = ++seq.current;
    api<T>(path).then(
      (d) => {
        if (mine !== seq.current) return;
        setData(d);
        setError(null);
      },
      (e: Error) => mine === seq.current && setError(e.message),
    );
  }, [path, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, reload };
}

export const fmt = (n: number) => new Intl.NumberFormat("en", { notation: n >= 100_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
export const when = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const t = new Date(d);
  const s = (Date.now() - t.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86_400) return `${Math.floor(s / 86_400)} d ago`;
  return t.toLocaleDateString("en", { day: "numeric", month: "short", year: t.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
};
export const stamp = (d: string | Date | null | undefined) => (d ? new Date(d).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "—");

export function flag(cc: string | null | undefined) {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

export function Card({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-4 shadow-[var(--edge)] sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-[13px] font-semibold tracking-wide text-muted uppercase">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-[var(--edge)]">
      <div className="text-[12.5px] font-medium text-muted">{label}</div>
      <div className={`mt-1 text-[26px] leading-none font-semibold tracking-tight tabular-nums ${accent ? "text-fire-ink" : ""}`}>{value}</div>
      {hint && <div className="mt-1.5 text-[12px] text-faint">{hint}</div>}
    </div>
  );
}

/** Ranked bars: label, bar, count. */
export function Ranked({ rows, empty = "Nothing yet" }: { rows: { label: string; n: number }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.length) return <p className="py-6 text-center text-[13px] text-faint">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.label} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-2.5 py-1.5 text-[13.5px]">
          <span className="absolute inset-y-0 left-0 rounded-lg bg-fire-soft" style={{ width: `${(r.n / max) * 100}%` }} aria-hidden />
          <span className="relative truncate">{r.label}</span>
          <span className="relative tabular-nums text-ink-2">{fmt(r.n)}</span>
        </li>
      ))}
    </ul>
  );
}

/** An area chart of one series over days, with a hover readout. */
export function Trend({ points, label }: { points: { day: string; v: number }[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 160;
  const max = Math.max(1, ...points.map((p) => p.v));
  const x = (i: number) => (points.length < 2 ? W / 2 : (i / (points.length - 1)) * W);
  const y = (v: number) => H - 8 - (v / max) * (H - 24);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
  const h = hover !== null ? points[hover] : null;
  return (
    <div className="relative">
      <div className="mb-2 flex items-baseline justify-between text-[12.5px]">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums text-ink-2">{h ? `${new Date(h.day).toLocaleDateString("en", { day: "numeric", month: "short" })}: ${fmt(h.v)}` : `peak ${fmt(max)}`}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-40 w-full touch-none"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} per day`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--fire)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--fire)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--line)" vectorEffect="non-scaling-stroke" />
        ))}
        {points.length > 0 && <path d={`${line}L${W},${H}L0,${H}Z`} fill={`url(#g-${label})`} />}
        <path d={line} fill="none" stroke="var(--fire)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {h && hover !== null && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--line-strong)" vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  );
}

/** Where installs are: dots on an equirectangular world (no map tiles, nothing loaded from elsewhere). */
export function WorldDots({ points }: { points: { latitude: number | null; longitude: number | null }[] }) {
  const pts = points.filter((p) => p.latitude !== null && p.longitude !== null);
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-surface-2">
      <svg viewBox="0 0 360 180" className="absolute inset-0 h-full w-full" aria-label={`${pts.length} installs with a known location`} role="img">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={i * 36} x2={i * 36} y1="0" y2="180" stroke="var(--line)" strokeWidth="0.3" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} y1={i * 36} y2={i * 36} x1="0" x2="360" stroke="var(--line)" strokeWidth="0.3" />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p.longitude! + 180} cy={90 - p.latitude!} r="1.6" fill="var(--fire)" fillOpacity="0.7" />
        ))}
      </svg>
      {!pts.length && (
        <p className="absolute inset-0 grid place-items-center px-6 text-center text-[12.5px] text-faint">
          No coordinates yet. Turn on Cloudflare&rsquo;s &ldquo;Add visitor location headers&rdquo; to get cities and coordinates.
        </p>
      )}
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[640px] text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-line text-[12px] text-muted">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="py-10 text-center text-[13px] text-faint">Nothing here yet</p>}
    </div>
  );
}

export const td = "px-3 py-2.5 align-top";

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-[13px]">
      <button className={ghost} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span className="tabular-nums text-muted">
        {page} / {pages}
      </span>
      <button className={ghost} disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}

export const ghost =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink-2 transition hover:bg-surface-2 disabled:opacity-40";
export const input =
  "h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-[13.5px] outline-none placeholder:text-faint focus:border-fire focus:ring-4 focus:ring-fire-soft";

export function Badge({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "fire" | "ok" | "warn" }) {
  const tones = {
    plain: "bg-surface-3 text-ink-2",
    fire: "bg-fire-soft text-fire-ink",
    ok: "bg-[color-mix(in_oklab,var(--ok)_14%,transparent)] text-ok",
    warn: "bg-[color-mix(in_oklab,#eab308_16%,transparent)] text-[#a16207] dark:text-[#facc15]",
  };
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11.5px] font-medium ${tones[tone]}`}>{children}</span>;
}

/** A search box that waits a moment after typing before it asks. */
export function SearchBox({ onSearch, placeholder }: { onSearch: (q: string) => void; placeholder: string }) {
  const [v, setV] = useState("");
  const cb = useRef(onSearch);
  useEffect(() => {
    cb.current = onSearch;
  });
  useEffect(() => {
    const t = setTimeout(() => cb.current(v.trim()), 300);
    return () => clearTimeout(t);
  }, [v]);
  return <input className={`${input} max-w-xs`} value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} aria-label={placeholder} />;
}
