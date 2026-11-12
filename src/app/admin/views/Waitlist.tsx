"use client";

import { useState } from "react";
import { Badge, Card, fmt, flag, ghost, Pager, Ranked, SearchBox, Table, td, useApi, when } from "../kit";

type Row = { id: string; email: string; interest: string; source: string; country: string | null; city: string | null; referrer: string | null; createdAt: string };
const LABEL: Record<string, string> = { mac: "macOS version", pro: "Pro features", news: "Product news" };

export function Waitlist() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, error } = useApi<{ rows: Row[]; total: number; page: number; pages: number; interests: { label: string; n: number }[] }>(
    `/api/admin/waitlist?page=${page}&q=${encodeURIComponent(q)}`,
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Waitlist</h1>
          <p className="text-[13.5px] text-muted">{data ? `${fmt(data.total)} people` : " "}</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchBox
            placeholder="Email"
            onSearch={(v) => {
              setQ(v);
              setPage(1);
            }}
          />
          <a className={ghost} href="/api/admin/waitlist?format=csv">
            Download CSV
          </a>
        </div>
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Interested in">
          <Ranked rows={(data?.interests ?? []).map((i) => ({ label: LABEL[i.label] ?? i.label, n: i.n }))} />
        </Card>
        <Card className="lg:col-span-2">
          <Table head={["Email", "Wants", "From", "Joined"]} empty={data?.rows.length === 0}>
            {data?.rows.map((r) => (
              <tr key={r.id}>
                <td className={`${td} font-medium`}>{r.email}</td>
                <td className={td}>
                  <Badge>{LABEL[r.interest] ?? r.interest}</Badge>
                </td>
                <td className={`${td} text-muted`}>
                  {flag(r.country)} {r.city ?? r.country ?? "—"} · {r.source}
                </td>
                <td className={`${td} whitespace-nowrap text-muted`}>{when(r.createdAt)}</td>
              </tr>
            ))}
          </Table>
          {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
        </Card>
      </div>
    </div>
  );
}
