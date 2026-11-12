import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/PageShell";
import { Link as Approve } from "./Link";

export const metadata: Metadata = { title: "Sign in to the app", robots: { index: false, follow: false } };

export default function LinkPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="h-80" />}>
        <div className="rounded-[28px] bg-surface px-6 pt-10 pb-8 shadow-[0_30px_60px_-30px_rgba(23,19,15,0.35)] sm:px-9">
          <Approve />
        </div>
      </Suspense>
    </AuthShell>
  );
}
