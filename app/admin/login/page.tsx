import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return <LoginForm />;
}
