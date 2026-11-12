"use client";

import { useState } from "react";
import { api, Badge, Card, fmt, flag, ghost, Pager, SearchBox, stamp, Table, td, useApi, when } from "../kit";

type Row = {
  id: string;
  email: string;
  name: string | null;
  emailVerifiedAt: string | null;
  disabledAt: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  signupCountry: string | null;
  signupCity: string | null;
  signupIp: string | null;
  _count: { installs: number; feedback: number; sessions: number };
};

export function Users() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const { data, error } = useApi<{ rows: Row[]; total: number; page: number; pages: number }>(`/api/admin/users?page=${page}&q=${encodeURIComponent(q)}`);
  if (open) return <UserDetail id={open} onBack={() => setOpen(null)} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Accounts</h1>
          <p className="text-[13.5px] text-muted">{data ? `${fmt(data.total)} accounts, newest first` : " "}</p>
        </div>
        <SearchBox
          placeholder="Email or name"
          onSearch={(v) => {
            setQ(v);
            setPage(1);
          }}
        />
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <Card>
        <Table head={["Person", "Signed up from", "Installs", "Feedback", "Joined", "Last seen"]} empty={data?.rows.length === 0}>
          {data?.rows.map((u) => (
            <tr key={u.id} className="cursor-pointer transition hover:bg-surface-2" onClick={() => setOpen(u.id)}>
              <td className={td}>
                <div className="font-medium">
                  {u.email} {!u.emailVerifiedAt && <Badge tone="warn">unconfirmed</Badge>} {u.disabledAt && <Badge tone="fire">off</Badge>}
                </div>
                <div className="text-[12px] text-faint">{u.name ?? ""}</div>
              </td>
              <td className={td}>
                {flag(u.signupCountry)} {u.signupCity ?? u.signupCountry ?? "—"}
                <div className="text-[12px] text-faint">{u.signupIp ?? ""}</div>
              </td>
              <td className={`${td} tabular-nums`}>{u._count.installs}</td>
              <td className={`${td} tabular-nums`}>{u._count.feedback}</td>
              <td className={`${td} whitespace-nowrap text-muted`}>{when(u.createdAt)}</td>
              <td className={`${td} whitespace-nowrap text-muted`}>{when(u.lastSeenAt)}</td>
            </tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </div>
  );
}

type Detail = {
  user: Row & {
    installs: { id: string; os: string; appVersion: string; country: string | null; city: string | null; lastSeenAt: string }[];
    sessions: { id: string; ip: string | null; country: string | null; city: string | null; userAgent: string | null; createdAt: string; lastUsedAt: string; revokedAt: string | null; expiresAt: string }[];
    feedback: { id: string; kind: string; message: string; createdAt: string }[];
  };
};

function UserDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { data, error, reload } = useApi<Detail>(`/api/admin/users/${id}`);
  const [busy, setBusy] = useState(false);
  const u = data?.user;
  return (
    <div className="space-y-4">
      <button className={ghost} onClick={onBack}>
        ← All accounts
      </button>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      {u && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">{u.email}</h1>
              <p className="text-[13px] text-muted">
                {u.name ?? "No name"} · joined {stamp(u.createdAt)} from {flag(u.signupCountry)} {u.signupCity ?? u.signupCountry ?? "?"} ({u.signupIp ?? "?"}) ·{" "}
                {u.emailVerifiedAt ? "email confirmed" : "email not confirmed"}
              </p>
            </div>
            <button
              className={ghost}
              disabled={busy}
              onClick={async () => {
                if (!u.disabledAt && !confirm(`Turn off ${u.email}? They are signed out everywhere.`)) return;
                setBusy(true);
                await api(`/api/admin/users/${id}`, { method: "PATCH", body: { disabled: !u.disabledAt } }).catch((e: Error) => alert(e.message));
                setBusy(false);
                reload();
              }}
            >
              {u.disabledAt ? "Turn account back on" : "Turn account off"}
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Installs">
              <ul className="divide-y divide-line text-[13.5px]">
                {u.installs.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3 py-2">
                    <span>
                      {flag(i.country)} {i.city ?? i.country ?? "?"} · {i.os} {i.appVersion}
                    </span>
                    <span className="text-faint">{when(i.lastSeenAt)}</span>
                  </li>
                ))}
                {!u.installs.length && <li className="py-2 text-faint">None</li>}
              </ul>
            </Card>
            <Card title="Feedback">
              <ul className="divide-y divide-line text-[13.5px]">
                {u.feedback.map((f) => (
                  <li key={f.id} className="py-2">
                    <Badge>{f.kind.toLowerCase()}</Badge> {f.message}
                  </li>
                ))}
                {!u.feedback.length && <li className="py-2 text-faint">None</li>}
              </ul>
            </Card>
          </div>
          <Card title="Sign-ins">
            <Table head={["Where", "Device", "Started", "Last used", "State"]}>
              {u.sessions.map((s) => (
                <tr key={s.id}>
                  <td className={td}>
                    {flag(s.country)} {s.city ?? s.country ?? "—"} <span className="text-faint">{s.ip}</span>
                  </td>
                  <td className={`${td} max-w-xs truncate text-[12.5px] text-muted`}>{s.userAgent}</td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{when(s.createdAt)}</td>
                  <td className={`${td} whitespace-nowrap text-muted`}>{when(s.lastUsedAt)}</td>
                  <td className={td}>
                    {s.revokedAt ? <Badge>signed out</Badge> : new Date(s.expiresAt) < new Date() ? <Badge>expired</Badge> : <Badge tone="ok">active</Badge>}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
