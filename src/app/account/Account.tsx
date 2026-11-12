"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { button, field } from "@/components/PageShell";
import { post, useMe, type WebUser } from "@/components/auth/client";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--edge)] sm:p-6">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const ghost = "inline-flex h-10 items-center rounded-xl border border-line-strong px-4 text-[14px] font-medium text-ink-2 transition hover:bg-surface-2 disabled:opacity-60";

/** The account on the web: name, email, password, sign out, delete. */
export function Account() {
  const router = useRouter();
  const { me, setMe } = useMe();
  useEffect(() => {
    if (me === null) router.replace("/signin?next=/account");
  }, [me, router]);
  if (!me) return <div className="h-96" aria-busy />;
  const u = me.user;
  const update = (user: WebUser) => setMe({ ...me, user });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {u.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.avatarUrl} alt="" width={56} height={56} referrerPolicy="no-referrer" className="size-14 rounded-full" />
          ) : (
            <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-fire-2 to-fire text-[22px] font-semibold text-white">
              {(u.name || u.email).slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight">{u.name || "Your account"}</h1>
            <p className="text-[14.5px] text-muted">
              {u.email} · {u.verified ? "confirmed" : "not confirmed yet"}
              {u.google && " · Google"}
            </p>
          </div>
        </div>
        <button
          className={ghost}
          onClick={async () => {
            await post("/api/v1/auth/logout").catch(() => {});
            router.replace("/signin");
          }}
        >
          Sign out
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--edge)]">
          <div className="text-[12.5px] font-medium text-muted">Plan</div>
          <div className="mt-1 text-[22px] font-semibold">Free</div>
          <p className="mt-1 text-[13.5px] text-ink-2">FireVoice is free for everyone right now, every feature included.</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--edge)]">
          <div className="text-[12.5px] font-medium text-muted">Computers</div>
          <div className="mt-1 text-[22px] font-semibold tabular-nums">{me.installs}</div>
          <p className="mt-1 text-[13.5px] text-ink-2">Signed in to this account. Sign in from the app with the person button at the top.</p>
        </div>
      </div>

      {!u.verified && <Resend />}
      <NameForm user={u} onSaved={update} />
      <PasswordForm user={u} onSaved={update} />
      <DeleteForm user={u} onDeleted={() => router.replace("/")} />
    </div>
  );
}

function Resend() {
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-fire-soft px-5 py-4 text-[14px] text-ink-2">
      <span>Confirm your email with the link we sent you.</span>
      <button className={ghost} disabled={state === "sent"} onClick={() => post("/api/v1/auth/resend").then(() => setState("sent"), () => setState("error"))}>
        {state === "sent" ? "Sent" : state === "error" ? "Try again later" : "Send again"}
      </button>
    </div>
  );
}

function NameForm({ user, onSaved }: { user: WebUser; onSaved: (u: WebUser) => void }) {
  const [name, setName] = useState(user.name ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <Section title="Name">
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const r = await post<{ user: WebUser }>("/api/v1/auth/me", { name: name.trim() || null }, "PATCH");
            onSaved(r.user);
            setMsg("Saved");
          } catch (er) {
            setMsg((er as Error).message);
          }
        }}
      >
        <input aria-label="Name" value={name} maxLength={80} onChange={(e) => (setName(e.target.value), setMsg(null))} className={field} />
        <button className={ghost} disabled={name.trim() === (user.name ?? "")}>
          Save
        </button>
      </form>
      <p aria-live="polite" className="mt-2 min-h-5 text-[13px] text-muted">
        {msg}
      </p>
    </Section>
  );
}

function PasswordForm({ user, onSaved }: { user: WebUser; onSaved: (u: WebUser) => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const next = String(f.get("next") ?? "");
    if (next !== String(f.get("again") ?? "")) return setMsg("The two new passwords are not the same.");
    setBusy(true);
    try {
      const r = await post<{ user: WebUser }>("/api/v1/auth/me", { currentPassword: String(f.get("current") ?? "") || undefined, newPassword: next }, "PATCH");
      onSaved(r.user);
      form.reset();
      setMsg("Password saved. Every other app and browser was signed out.");
    } catch (er) {
      setMsg((er as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Section title={user.hasPassword ? "Password" : "Add a password"}>
      {!user.hasPassword && <p className="mb-4 text-[14px] text-ink-2">You sign in with Google. Add a password to also sign in with your email.</p>}
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
        {user.hasPassword && (
          <input name="current" type="password" required autoComplete="current-password" placeholder="Current password" aria-label="Current password" className={field} />
        )}
        <input name="next" type="password" required minLength={10} maxLength={200} autoComplete="new-password" placeholder="New (10+ characters)" aria-label="New password" className={field} />
        <input name="again" type="password" required minLength={10} maxLength={200} autoComplete="new-password" placeholder="New, again" aria-label="New password again" className={field} />
        <div className="sm:col-span-3">
          <button className={button} disabled={busy}>
            {user.hasPassword ? "Change password" : "Add password"}
          </button>
        </div>
      </form>
      <p aria-live="polite" className="mt-2 min-h-5 text-[13px] text-muted">
        {msg}
      </p>
    </Section>
  );
}

function DeleteForm({ user, onDeleted }: { user: WebUser; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Section title="Delete account">
      <p className="text-[14px] text-ink-2">
        Your account and every sign-in are removed for good. FireVoice keeps working on your computers, and nothing on them is touched.
      </p>
      {!open ? (
        <button className={`${ghost} mt-4 text-fire-ink`} onClick={() => setOpen(true)}>
          Delete my account…
        </button>
      ) : (
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const v = String(new FormData(e.currentTarget).get("confirm") ?? "");
            setBusy(true);
            try {
              await post("/api/v1/auth/me", user.hasPassword ? { password: v } : { confirmEmail: v }, "DELETE");
              onDeleted();
            } catch (er) {
              setMsg((er as Error).message);
              setBusy(false);
            }
          }}
        >
          <input
            name="confirm"
            required
            type={user.hasPassword ? "password" : "email"}
            autoComplete={user.hasPassword ? "current-password" : "off"}
            placeholder={user.hasPassword ? "Your password" : `Type ${user.email}`}
            aria-label={user.hasPassword ? "Your password" : "Your email, to confirm"}
            className={`${field} max-w-xs`}
          />
          <button className="h-11 rounded-xl bg-[#d92d20] px-5 text-[15px] font-semibold text-white disabled:opacity-60" disabled={busy}>
            Delete for good
          </button>
        </form>
      )}
      <p aria-live="polite" className="mt-2 min-h-5 text-[13px] text-fire-ink">
        {msg}
      </p>
    </Section>
  );
}
