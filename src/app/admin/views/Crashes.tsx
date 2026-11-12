"use client";

import { useState } from "react";
import { Badge, Card, fmt, Pager, SearchBox, stamp, useApi } from "../kit";

type Row = { id: string; installId: string; appVersion: string; os: string | null; kind: string; message: string; stack: string | null; context: Record<string, unknown> | null; createdAt: string };

export function Crashes() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, error } = useApi<{ rows: Row[]; total: number; page: number; pages: number }>(`/api/admin/crashes?page=${page}&q=${encodeURIComponent(q)}`);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Crashes</h1>
          <p className="text-[13.5px] text-muted">{data ? `${fmt(data.total)} reports` : " "}</p>
        </div>
        <SearchBox
          placeholder="Message or version"
          onSearch={(v) => {
            setQ(v);
            setPage(1);
          }}
        />
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <div className="space-y-3">
        {data?.rows.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
              <Badge tone="fire">{c.kind}</Badge>
              <span>
                {c.appVersion} on {c.os ?? "?"}
              </span>
              <span>· {stamp(c.createdAt)}</span>
              <span className="font-mono">· {c.installId.slice(0, 12)}…</span>
            </div>
            <p className="mt-2 font-mono text-[13px] break-words">{c.message}</p>
            {c.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[12.5px] text-muted">Stack</summary>
                <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-surface-2 p-3 text-[11.5px] leading-relaxed">{c.stack}</pre>
              </details>
            )}
          </Card>
        ))}
        {data?.rows.length === 0 && <p className="py-10 text-center text-[13px] text-faint">No crashes</p>}
      </div>
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </div>
  );
}
