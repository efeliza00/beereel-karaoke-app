"use server";

import { redirect } from "next/navigation";

import {
  clearSession,
  setSession,
  verifyCredentials,
} from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/validations";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  values: LoginValues,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please fill in both fields." };
  }

  const { username, password } = parsed.data;
  if (!verifyCredentials(username, password)) {
    return { error: "Invalid username or password." };
  }

  await setSession(username);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/admin/login");
}
