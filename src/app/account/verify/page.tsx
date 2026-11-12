import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { Verify } from "./Verify";

export const metadata: Metadata = { title: "Confirm your email", robots: { index: false, follow: false } };

export default function VerifyPage() {
  return (
    <PageShell width="max-w-md">
      <Suspense fallback={<p className="text-[15px] text-muted">Confirming…</p>}>
        <Verify />
      </Suspense>
    </PageShell>
  );
}
