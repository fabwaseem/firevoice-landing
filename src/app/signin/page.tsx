import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { SignIn } from "./SignIn";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your FireVoice account, or create one.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <PageShell width="max-w-md">
      <Suspense fallback={<div className="h-96" />}>
        <SignIn />
      </Suspense>
    </PageShell>
  );
}
