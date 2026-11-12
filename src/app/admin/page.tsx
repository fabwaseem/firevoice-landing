import type { Metadata } from "next";
import { Dashboard } from "./Dashboard";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

/** The private dashboard: a static page that signs in with ADMIN_PASSWORD and reads everything from /api/admin. */
export default function AdminPage() {
  return <Dashboard />;
}
