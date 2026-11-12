"use client";

import { useState } from "react";
import { api, Badge, Card, fmt, flag, ghost, Pager, SearchBox, useApi, when } from "../kit";

type Row = {
  id: string;
  kind: "BUG" | "IDEA" | "PRAISE" | "OTHER";
  message: string;
  email: string | null;
  rating: number | null;
  status: "NEW" | "SEEN" | "DONE";
  source: string;
  appVersion: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  installId: string | null;
  createdAt: string;
  user: { email: string } | null;
};

const STATUSES = ["", "NEW", "SEEN", "DONE"] as const;
const TONE = { BUG: "fire", IDEA: "plain", PRAISE: "ok", OTHER: "plain" } as const;

export function Feedback() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("NEW");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, reload } = useApi<{ rows: Row[]; total: number; page: number; pages: number }>(
    `/api/admin/feedback?page=${page}&status=${status}&q=${encodeURIComponent(q)}`,
  );
  const set = async (id: string, s: Row["status"]) => {
    await api(`/api/admin/feedback/${id}`, { method: "PATCH", body: { status: s } }).catch((e: Error) => alert(e.message));
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Feedback</h1>
          <p className="text-[13.5px] text-muted">{data ? `${fmt(data.total)} messages` : " "}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-line-strong bg-surface p-0.5" role="group" aria-label="Status">
            {STATUSES.map((s) => (
              <button
                key={s}
                aria-pressed={status === s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className="h-7 rounded-md px-2.5 text-[12.5px] font-medium text-muted aria-pressed:bg-surface-3 aria-pressed:text-ink"
              >
                {s ? s[0] + s.slice(1).toLowerCase() : "All"}
              </button>
            ))}
          </div>
          <SearchBox
            placeholder="Search messages"
            onSearch={(v) => {
              setQ(v);
              setPage(1);
            }}
          />
        </div>
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <div className="space-y-3">
        {data?.rows.map((f) => (
          <Card key={f.id}>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
              <Badge tone={TONE[f.kind]}>{f.kind.toLowerCase()}</Badge>
              {f.rating && <span>{"★".repeat(f.rating)}</span>}
              <span>{f.source === "app" ? `App ${f.appVersion ?? ""} on ${f.os ?? "?"}` : "Website"}</span>
              <span>
                · {flag(f.country)} {f.city ?? f.country ?? ""}
              </span>
              <span>· {when(f.createdAt)}</span>
              {(f.email || f.user) && (
                <a className="text-fire-ink underline-offset-4 hover:underline" href={`mailto:${f.email ?? f.user?.email}`}>
                  · {f.email ?? f.user?.email}
                </a>
              )}
            </div>
            <p className="mt-2 text-[14.5px] leading-relaxed whitespace-pre-wrap">{f.message}</p>
            <div className="mt-3 flex gap-2">
              {f.status !== "SEEN" && (
                <button className={ghost} onClick={() => void set(f.id, "SEEN")}>
                  Mark seen
                </button>
              )}
              {f.status !== "DONE" && (
                <button className={ghost} onClick={() => void set(f.id, "DONE")}>
                  Done
                </button>
              )}
              {f.status !== "NEW" && (
                <button className={ghost} onClick={() => void set(f.id, "NEW")}>
                  Back to new
                </button>
              )}
            </div>
          </Card>
        ))}
        {data?.rows.length === 0 && <p className="py-10 text-center text-[13px] text-faint">Nothing here</p>}
      </div>
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </div>
  );
}
