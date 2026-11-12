import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { Link as Approve } from "./Link";

export const metadata: Metadata = { title: "Sign in to the app", robots: { index: false, follow: false } };

export default function LinkPage() {
  return (
    <PageShell width="max-w-md">
      <Suspense fallback={<div className="h-80" />}>
        <Approve />
      </Suspense>
    </PageShell>
  );
}
