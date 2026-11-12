import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { requireAdmin } from "./auth";
import { json, route } from "./http";
import { client } from "./request";

/** An admin route: signed-in admin only, errors as JSON. */
export const adminRoute = <A extends unknown[]>(fn: (req: Request, ...rest: A) => Promise<Response>) =>
  route(async (req: Request, ...rest: A) => {
    await requireAdmin(req);
    return fn(req, ...rest);
  });

export function audit(req: Request, action: string, target?: string, meta?: Prisma.InputJsonValue) {
  return db()
    .auditLog.create({ data: { action, target, meta, ip: client(req).ip } })
    .catch(() => {});
}

/** ?page= and ?q= from a list request; pages of 50. */
export function paging(req: Request) {
  const u = new URL(req.url);
  const page = Math.max(1, Math.min(10_000, Number(u.searchParams.get("page")) || 1));
  const q = (u.searchParams.get("q") ?? "").trim().slice(0, 100);
  return { page, q, take: 50, skip: (page - 1) * 50, params: u.searchParams };
}

export const list = (rows: unknown[], total: number, page: number) => json({ rows, total, page, pages: Math.max(1, Math.ceil(total / 50)) });

/** Turns rows into CSV (for the waitlist export), quoting every cell and defusing spreadsheet formulas. */
export function csv(rows: Record<string, unknown>[], name: string) {
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const cell = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const text = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
  return new Response(text, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
