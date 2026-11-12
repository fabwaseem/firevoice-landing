"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

/** Confirms the email from the link's token (posted, so it is not left in server logs as a GET). */
export function Verify() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"working" | "done" | "bad">(token ? "working" : "bad");
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    fetch("/api/v1/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then((r) => setState(r.ok ? "done" : "bad"))
      .catch(() => setState("bad"));
    // the token is spent: take it out of the address bar
    window.history.replaceState(null, "", "/account/verify");
  }, [token]);

  return (
    <div role="status" aria-live="polite">
      <h1 className="text-[30px] leading-tight font-semibold tracking-tight">
        {state === "working" ? "Confirming your email…" : state === "done" ? "Your email is confirmed" : "This link does not work"}
      </h1>
      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
        {state === "working"
          ? "One moment."
          : state === "done"
            ? "You are all set. You can close this page and go back to FireVoice."
            : "It may have expired or already been used. In FireVoice, open Account and choose Resend email."}
      </p>
    </div>
  );
}
