"use client";

import { useEffect, useState } from "react";
import { api, Card, flag, ghost, input, stamp, Table, td } from "../kit";

type Row = { id: string; name: string; at: string; props: Record<string, unknown> | null; installId: string; country: string | null; appVersion: string | null; user: { email: string } | null };

/** The live stream of events, newest first, loading older ones on demand. */
export function Events() {
  const [name, setName] = useState("");
  const [applied, setApplied] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const fetchPage = (before?: string | null) => {
    const qs = new URLSearchParams();
    if (applied) qs.set("name", applied);
    if (before) qs.set("before", before);
    return api<{ rows: Row[]; next: string | null }>(`/api/admin/events?${qs}`);
  };

  // the newest page, again when the filter changes or on Refresh
  useEffect(() => {
    let live = true;
    const qs = new URLSearchParams(applied ? { name: applied } : {});
    api<{ rows: Row[]; next: string | null }>(`/api/admin/events?${qs}`).then(
      (d) => {
        if (!live) return;
        setRows(d.rows);
        setNext(d.next);
        setError(null);
      },
      (e: Error) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [applied, tick]);

  const older = async () => {
    setBusy(true);
    try {
      const d = await fetchPage(next);
      setRows((r) => [...r, ...d.rows]);
      setNext(d.next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Events</h1>
          <p className="text-[13.5px] text-muted">Everything the apps report, newest first. End a name with * for a prefix (dictation.*).</p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(name.trim());
          }}
        >
          <input className={`${input} w-56`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Event name" aria-label="Event name" />
          <button className={ghost}>Filter</button>
          <button type="button" className={ghost} onClick={() => setTick((t) => t + 1)}>
            Refresh
          </button>
        </form>
      </div>
      {error && <p className="text-[14px] text-fire-ink">{error}</p>}
      <Card>
        <Table head={["Event", "Details", "Install", "When"]} empty={rows.length === 0}>
          {rows.map((e) => (
            <tr key={e.id}>
              <td className={`${td} font-medium whitespace-nowrap`}>{e.name}</td>
              <td className={`${td} max-w-md font-mono text-[12px] break-all text-ink-2`}>{e.props ? JSON.stringify(e.props) : ""}</td>
              <td className={`${td} text-[12.5px] whitespace-nowrap text-muted`}>
                {flag(e.country)} {e.user?.email ?? `${e.installId.slice(0, 10)}…`} · {e.appVersion}
              </td>
              <td className={`${td} whitespace-nowrap text-muted`}>{stamp(e.at)}</td>
            </tr>
          ))}
        </Table>
        {next && (
          <div className="mt-4 flex justify-center">
            <button className={ghost} disabled={busy} onClick={() => void older()}>
              {busy ? "Loading…" : "Older events"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
