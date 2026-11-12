import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/PageShell";
import { Link as Approve } from "./Link";

export const metadata: Metadata = { title: "Sign in to the app", robots: { index: false, follow: false } };

export default function LinkPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="h-80" />}>
        <div>
          <Approve />
        </div>
      </Suspense>
    </AuthShell>
  );
}
