"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";

import Image from "next/image";

import { loginAction } from "@/app/admin/actions";
import { loginSchema, type LoginValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction({}, values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      router.push("/admin");
    });
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <Card className="w-full max-w-sm rounded-3xl">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex flex-col items-center gap-3">
            <Image
              src="/logo/favicon-96x96.png"
              alt="Beereel Logo"
              width={56}
              height={56}
              quality={100}
              className="rounded-2xl"
            />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
              Beereel
            </span>
          </div>
          <CardTitle className="text-lg">Admin sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access the Beereel dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username ? (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={isPending} className="mt-1 w-full">
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
