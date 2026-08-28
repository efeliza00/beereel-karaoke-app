import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/admin/dashboard-shell";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
