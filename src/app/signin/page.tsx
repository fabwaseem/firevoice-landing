import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/PageShell";
import { SignIn } from "./SignIn";

export const metadata: Metadata = {
  title: "Get started",
  description: "Sign in to FireVoice, or create a free account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="h-[460px]" />}>
        <SignIn />
      </Suspense>
    </AuthShell>
  );
}
