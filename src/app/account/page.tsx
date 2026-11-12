import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Account } from "./Account";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <PageShell width="max-w-2xl">
      <Account />
    </PageShell>
  );
}
