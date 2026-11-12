"use client";

import { useState, type FormEvent } from "react";
import { api, Badge, Card, ghost, input, Pager, Table, td, useApi, when } from "../kit";

type Row = {
  id: string;
  keyLast4: string;
  plan: "PRO" | "TEAM";
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  seats: number;
  note: string | null;
  expiresAt: string | null;
  createdAt: string;
  user: { email: string } | null;
  _count: { activations: number };
};

export function Licenses() {
  const [page, setPage] = useState(1);
  const { data, error, reload } = useApi<{ rows: Row[]; total: number; page: number; pages: number; licensing: boolean }>(`/api/admin/licenses?page=${page}`);
  const [made, setMade] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const d = await api<{ key: string }>("/api/admin/licenses", {
        method: "POST",
        body: {
          plan: f.get("plan"),
          seats: Number(f.get("seats")) || 1,
          days: Number(f.get("days")) || null,
          email: String(f.get("email") ?? "").trim() || null,
          note: String(f.get("note") ?? "").trim() || null,
        },
      });
      setMade(d.key);
      e.currentTarget?.reset();
      reload();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight">Licences</h1>
        <p className="text-[13.5px] text-muted">
          {data?.licensing
            ? "Licensing is on: the app checks keys."
            : "Licensing is off (LICENSING_ENABLED=false): FireVoice is free for everyone and the app does not ask for a key. Keys made here start working when it is turned on."}
        </p>
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <Card title="Make a key">
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-6">
          <select name="plan" className={`${input} sm:col-span-1`} aria-label="Plan">
            <option value="PRO">Pro</option>
            <option value="TEAM">Team</option>
          </select>
          <input name="seats" type="number" min={1} max={1000} defaultValue={1} className={input} aria-label="Seats" placeholder="Seats" />
          <input name="days" type="number" min={1} max={3650} className={input} aria-label="Days valid (empty for no end)" placeholder="Days (no end)" />
          <input name="email" type="email" className={input} aria-label="For account (email)" placeholder="Account email" />
          <input name="note" className={input} aria-label="Note" placeholder="Note" />
          <button className="h-9 rounded-lg bg-fire px-3 text-[13.5px] font-semibold text-white disabled:opacity-60" disabled={busy}>
            Make key
          </button>
        </form>
        {made && (
          <div role="status" className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-fire-soft p-3 text-[13.5px]">
            <code className="font-mono text-[14px] font-semibold">{made}</code>
            <button className={ghost} onClick={() => void navigator.clipboard.writeText(made)}>
              Copy
            </button>
            <span className="text-muted">Shown only now: only its hash is kept.</span>
          </div>
        )}
      </Card>
      <Card>
        <Table head={["Key", "Plan", "Seats used", "Account", "Ends", "Made", "State", ""]} empty={data?.rows.length === 0}>
          {data?.rows.map((l) => (
            <tr key={l.id}>
              <td className={`${td} font-mono`}>…{l.keyLast4}</td>
              <td className={td}>{l.plan.toLowerCase()}</td>
              <td className={`${td} tabular-nums`}>
                {l._count.activations} / {l.seats}
              </td>
              <td className={td}>{l.user?.email ?? "—"}</td>
              <td className={`${td} text-muted`}>{l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : "never"}</td>
              <td className={`${td} text-muted`}>{when(l.createdAt)}</td>
              <td className={td}>
                <Badge tone={l.status === "ACTIVE" ? "ok" : "plain"}>{l.status.toLowerCase()}</Badge>
                {l.note && <div className="text-[12px] text-faint">{l.note}</div>}
              </td>
              <td className={td}>
                <button
                  className={ghost}
                  onClick={async () => {
                    await api(`/api/admin/licenses/${l.id}`, { method: "PATCH", body: { status: l.status === "ACTIVE" ? "REVOKED" : "ACTIVE" } }).catch((e: Error) =>
                      alert(e.message),
                    );
                    reload();
                  }}
                >
                  {l.status === "ACTIVE" ? "Revoke" : "Restore"}
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </div>
  );
}
