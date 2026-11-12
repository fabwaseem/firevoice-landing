import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { Reset } from "./Reset";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default function ResetPage() {
  return (
    <PageShell width="max-w-md">
      <Suspense fallback={null}>
        <Reset />
      </Suspense>
    </PageShell>
  );
}
